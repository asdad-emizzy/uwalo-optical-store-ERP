import { OrderAggregate } from '../domain/order.aggregate';

export interface OrderRepository {
  create(order: OrderAggregate): Promise<OrderAggregate>;
  findById(orderId: string, tenantId: string): Promise<OrderAggregate | null>;
  nextIdentity(): string;
}
