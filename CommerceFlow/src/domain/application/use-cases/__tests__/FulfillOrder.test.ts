import { FulfillOrder } from '../FulfillOrder';
import { InMemoryOrderRepository } from './fakes/InMemoryOrderRepository';
import { InMemoryEventPublisher } from './fakes/InMemoryEventPublisher';
import { Order } from '../../../entities/order/Order';
import { OrderItem } from '../../../entities/order/OrderItem';
import { OrderStatus } from '../../../entities/order/OrderStatus';

describe('FulfillOrder', () => {
    it('marks order as FULFILLED and emits event', async () => {
        const order = Order.create([
            new OrderItem({ productId: 'p1', quantity: 1, unitPrice: 100 }),
        ]);
        order.requestPayment();
        order.confirmPayment();

        const repo = new InMemoryOrderRepository();
        repo.saveWithId('order-1', order);

        const publisher = new InMemoryEventPublisher();
        const useCase = new FulfillOrder(repo, publisher);

        await useCase.execute('order-1');

        expect(order.getStatus()).toBe(OrderStatus.Fulfilled);
        expect(publisher.events.length).toBe(1);
        const evt = publisher.events[0] as any;
        expect(evt).toHaveProperty('orderId', 'order-1');
    });

    it('throws if payment not confirmed', async () => {
        const order = Order.create([
            new OrderItem({ productId: 'p1', quantity: 1, unitPrice: 100 }),
        ]);
        // payment never confirmed, still CREATED
        const repo = new InMemoryOrderRepository();
        repo.saveWithId('order-2', order);
        const publisher = new InMemoryEventPublisher();
        const useCase = new FulfillOrder(repo, publisher);

        await expect(useCase.execute('order-2')).rejects.toThrow();
    });
});
