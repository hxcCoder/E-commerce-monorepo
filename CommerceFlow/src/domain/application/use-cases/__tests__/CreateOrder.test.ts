import { CreateOrder } from '../CreateOrder';
import { InMemoryOrderRepository } from './fakes/InMemoryOrderRepository';
import { InMemoryEventPublisher } from './fakes/InMemoryEventPublisher';

describe('CreateOrder', () => {
    it('creates an order with items and emits OrderCreated', async () => {
        const repository = new InMemoryOrderRepository();
        const publisher = new InMemoryEventPublisher();
        const useCase = new CreateOrder(repository, publisher);

        const items = [
            {
                productId: 'p1',
                quantity: 2,
                unitPrice: 100,
            },
        ];

        const order = await useCase.execute(items);

        expect(repository.count()).toBe(1);

        const [saved] = repository.getAll();
        expect(saved.getTotalAmount()).toBe(200);
        expect(order.id).toBe(saved.id);

        expect(publisher.events.length).toBe(1);
        const evt = publisher.events[0] as any;
        expect(evt).toHaveProperty('orderId', order.id);
    });
});
