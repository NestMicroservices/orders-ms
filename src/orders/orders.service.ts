import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';

import { ChangeOrderStatusDto, OrderPaginationDto } from './dto';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('OrdersService');
  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected');
  }

  create(createOrderDto: CreateOrderDto) {
    return this.order.create({ data: createOrderDto });
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
