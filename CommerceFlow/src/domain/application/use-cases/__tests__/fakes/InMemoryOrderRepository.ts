import { OrderRepository } from '../../../ports/OrderRepository';
import { Order } from '../../../../entities/order/Order';

export class InMemoryOrderRepository implements OrderRepository {
    private orders = new Map<string, Order>();

    async findById(id: string): Promise<Order | null> {
        return this.orders.get(id) ?? null;
    }

    async save(order: Order): Promise<void> {
        const key = this.findExistingKey(order) ?? `order-${this.orders.size + 1}`;
        this.orders.set(key, order);
    }

    private findExistingKey(order: Order): string | null {
        for (const [id, stored] of this.orders.entries()) {
            if (stored === order) {
                return id;
            }
        }
        return null;
    }

    // ===== Helpers SOLO para tests =====

    saveWithId(id: string, order: Order): void {
        this.orders.set(id, order);
    }

    count(): number {
        return this.orders.size;
    }

    getAll(): Order[] {
        return Array.from(this.orders.values());
    }
}
