export interface EventPublisher {
    publish(event: unknown): Promise<void>;
}

export type EventHandler = (event: any) => void;

export class InMemoryEventBus implements EventPublisher {
    private handlers: EventHandler[] = [];

    subscribe(handler: EventHandler) {
        this.handlers.push(handler);
    }

    async publish(event: any) {
        for (const h of this.handlers) {
            await h(event);
        }
    }
}
