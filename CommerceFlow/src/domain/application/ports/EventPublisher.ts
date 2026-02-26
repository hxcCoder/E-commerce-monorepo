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
        // basic structured log for test environments
        console.log(JSON.stringify({ level: 'info', eventType: event?.constructor?.name, payload: event }));
        for (const h of this.handlers) {
            await h(event);
        }
    }
}
