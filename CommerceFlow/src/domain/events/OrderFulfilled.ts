export class OrderFulfilled {
    constructor(
        public readonly orderId: string,
        public readonly occurredAt: Date = new Date(),
    ) {}
}
