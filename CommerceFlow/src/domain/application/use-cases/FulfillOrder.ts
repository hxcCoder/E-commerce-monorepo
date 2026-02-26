import { OrderRepository } from '../ports/OrderRepository';
import { EventPublisher } from '../ports/EventPublisher';
import { Order } from '../../entities/order/Order';
import { OrderCannotBeFulfilledError } from '../../entities/order/OrderErrors';
import { OrderFulfilled } from '../../events/OrderFulfilled';
import { Logger, consoleLogger } from '../../../shared/logger';

export class FulfillOrder {
    constructor(
        private readonly orderRepository: OrderRepository,
        private readonly eventPublisher: EventPublisher,
        private readonly logger: Logger = consoleLogger,
    ) {}

    async execute(orderId: string): Promise<void> {
        this.logger.info('FulfillOrder start', { orderId });
        const order = await this.orderRepository.findById(orderId);
        if (!order) {
            throw new Error('Order.notFound');
        }

        order.fulfill();
        await this.orderRepository.save(order);
        await this.eventPublisher.publish(new OrderFulfilled(orderId));
        this.logger.info('FulfillOrder finished', { orderId, status: order.getStatus() });
    }
}
