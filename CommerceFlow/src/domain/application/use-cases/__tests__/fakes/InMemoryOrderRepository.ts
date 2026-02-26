import { OrderRepository } from '../../../ports/OrderRepository';
import { Order } from '../../../../entities/order/Order';

export class InMemoryOrderRepository implements OrderRepository {
    private orders = new Map<string, Order>();

    async findById(id: string): Promise<Order | null> {
        return this.orders.get(id) ?? null;
    }

    async save(order: Order): Promise<void> {
        // use the id provided by the domain entity
        this.orders.set(order.id, order);
    }

    // ===== Helpers SOLO para tests =====

    saveWithId(id: string, order: Order): void {
        // override if you need a specific id in a test
        (order as any).id = id;
        this.orders.set(id, order);
    }

    count(): number {
        return this.orders.size;
    }

    getAll(): Order[] {
        return Array.from(this.orders.values());
    }
}
