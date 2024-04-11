import { OrderStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

import { PaginationDto } from 'src/common';
import { OrderStatusList } from '../enum';

export class OrderPaginationDto extends PaginationDto {
  @IsOptional()
  @IsEnum(OrderStatusList, {
    message: `Status must be one of the following values: ${OrderStatusList}`,
  })
  status?: OrderStatus;
}
