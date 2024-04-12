import {
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';

import { ChangeOrderStatusDto, OrderPaginationDto } from './dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { Services } from 'src/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('OrdersService');

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected');
  }

  constructor(
    @Inject(Services.PRODUCT) private readonly productsClient: ClientProxy,
  ) {
    super();
  }

  async create({ items }: CreateOrderDto) {
    const ids = items.map((item) => item.productId);
    try {
      const products = await firstValueFrom(
        this.productsClient.send({ cmd: 'validate_products' }, ids),
      );

      const totalAmount = items.reduce((acc, orderItem) => {
        const product = products.find(
          (product) => product.id === orderItem.productId,
        );
        return product.price * orderItem.quantity + acc;
      }, 0);

      const totalItems = items.reduce((acc, orderItem) => {
        return acc + orderItem.quantity;
      }, 0);

      const order = await this.order.create({
        data: {
          totalAmount: totalAmount,
          totalItems: totalItems,
          OrderItem: {
            createMany: {
              data: items.map((orderItem) => ({
                quantity: orderItem.quantity,
                productId: orderItem.productId,
                price: products.find(
                  (product) => product.id === orderItem.productId,
                ).price,
              })),
            },
          },
        },
        include: {
          OrderItem: {
            select: {
              price: true,
              quantity: true,
              productId: true,
            },
          },
        },
      });

      return {
        ...order,
        OrderItem: order.OrderItem.map((orderItem) => ({
          ...orderItem,
          name: products.find((product) => product.id === orderItem.productId)
            .name,
        })),
      };
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Check logs',
      });
    }
  }

  async findAll({ limit, page, status }: OrderPaginationDto) {
    const totalItems = await this.order.count({ where: { status } });
    const lastPage = Math.ceil(totalItems / limit);
    return {
      data: await this.order.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: { status },
      }),
      meta: {
        total: totalItems,
        page,
        lastPage,
      },
    };
  }

  async findOne(id: string) {
    const order = await this.order.findFirst({
      where: { id },
    });

    if (!order) {
      throw new RpcException({
        message: `Product whith #${id} not found`,
        status: HttpStatus.NOT_FOUND,
      });
    }

    return order;
  }

  async changeOrderStatus({ id, status }: ChangeOrderStatusDto) {
    const order = await this.findOne(id);
    if (order.status === status) return order;
    return await this.order.update({ where: { id }, data: { status } });
  }
}
