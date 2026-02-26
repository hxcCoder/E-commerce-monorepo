import { Order } from '../../entities/order/Order';
import { OrderItem } from '../../entities/order/OrderItem';
import { OrderRepository } from '../ports/OrderRepository';
import { EventPublisher } from '../ports/EventPublisher';
import { OrderCreated } from '../../events/OrderCreated';
import { Logger, consoleLogger } from '../../../shared/logger';

type CreateOrderItemInput = {
    productId: string;
    quantity: number;
    unitPrice: number;
};

export class CreateOrder {
    constructor(
        private readonly orderRepository: OrderRepository,
        private readonly eventPublisher: EventPublisher,
        private readonly logger: Logger = consoleLogger,
    ) {}

    async execute(items: CreateOrderItemInput[]): Promise<Order> {
        this.logger.info('CreateOrder start', { items });
        const orderItems = items.map(
            (item) =>
            new OrderItem({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
            })
        );

        const order = Order.create(orderItems);

        await this.orderRepository.save(order);
        await this.eventPublisher.publish(new OrderCreated(order.id, order.getTotalAmount()));
        this.logger.info('CreateOrder finished', { orderId: order.id, total: order.getTotalAmount() });

        return order;
    }
}

