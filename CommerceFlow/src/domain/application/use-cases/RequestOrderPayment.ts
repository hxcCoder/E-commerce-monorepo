import { OrderRepository } from '../ports/OrderRepository';
import { EventPublisher } from '../ports/EventPublisher';
import { OrderPaymentRequested } from '../../events/OrderPaymentRequested';
import { Logger, consoleLogger } from '../../../shared/logger';

export class RequestOrderPayment {
    constructor(
        private readonly orderRepository: OrderRepository,
        private readonly eventPublisher: EventPublisher,
        private readonly logger: Logger = consoleLogger,
    ) {}

    async execute(orderId: string): Promise<void> {
        this.logger.info('RequestOrderPayment start', { orderId });
        const order = await this.orderRepository.findById(orderId);

        if (!order) {
            throw new Error('Order.notFound');
        }

        order.requestPayment();

        await this.orderRepository.save(order);

        await this.eventPublisher.publish(
            new OrderPaymentRequested(orderId)
        );
        this.logger.info('RequestOrderPayment finished', { orderId, status: order.getStatus() });
    }
}
