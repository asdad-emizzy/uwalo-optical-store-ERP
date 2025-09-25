import { randomUUID } from 'crypto';
import { OrderAggregate } from '../../domain/order.aggregate';
import { OrderRepository } from '../order-repository';

export class InMemoryOrderRepository implements OrderRepository {
  private readonly orders = new Map<string, OrderAggregate>();

  nextIdentity(): string {
    return randomUUID();
  }

  async create(order: OrderAggregate): Promise<OrderAggregate> {
    this.orders.set(order.id, order);
    return order;
  }

  async findById(orderId: string, tenantId: string): Promise<OrderAggregate | null> {
    const order = this.orders.get(orderId);
    if (!order) {
      return null;
    }

    if (order.tenantId !== tenantId) {
      return null;
    }

    return order;
  }
}
