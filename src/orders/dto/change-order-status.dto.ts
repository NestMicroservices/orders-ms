import { OrderStatus } from '@prisma/client';

import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { OrderStatusList } from '../enum';

export class ChangeOrderStatusDto {
  @IsUUID()
  id: string;

  @IsOptional()
  @IsEnum(OrderStatusList, {
    message: `Status must be one of the following values: ${OrderStatusList}`,
  })
  status?: OrderStatus;
}
