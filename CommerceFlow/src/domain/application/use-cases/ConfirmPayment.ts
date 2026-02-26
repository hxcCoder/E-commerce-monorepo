import { OrderRepository } from '../ports/OrderRepository';
import { EventPublisher } from '../ports/EventPublisher';
import { PaymentResult } from '../../entities/payment/PaymentResult';
import { PaymentStatus } from '../../entities/payment/PaymentStatus';
import { OrderPaid } from '../../events/OrderPaid';
import { OrderPaymentFailed } from '../../events/OrderPaymentFailed';
import { Logger, consoleLogger } from '../../../shared/logger';

export class ConfirmPayment {
    constructor(
        private readonly orderRepository: OrderRepository,
        private readonly eventPublisher: EventPublisher,
        private readonly logger: Logger = consoleLogger,
    ) {}

    async execute(orderId: string, payment: PaymentResult): Promise<void> {
        this.logger.info('ConfirmPayment start', { orderId, paymentStatus: payment.status });
        const order = await this.orderRepository.findById(orderId);

        if (!order) {
            throw new Error('Order.notFound');
        }

        if (payment.status === PaymentStatus.APPROVED) {
            order.confirmPayment();
            await this.orderRepository.save(order);
            await this.eventPublisher.publish(new OrderPaid(orderId));
            this.logger.info('ConfirmPayment approved', { orderId });
            return;
        }

        if (payment.status === PaymentStatus.REJECTED) {
            order.fail();
            await this.orderRepository.save(order);
            await this.eventPublisher.publish(new OrderPaymentFailed(orderId));
            this.logger.info('ConfirmPayment rejected', { orderId });
            return;
        }

        // PENDING → no cambia estado
        this.logger.info('ConfirmPayment pending, no changes', { orderId });
    }
}
