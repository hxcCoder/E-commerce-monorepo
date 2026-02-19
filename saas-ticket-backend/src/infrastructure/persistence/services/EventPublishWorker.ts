import { OutboxRepository } from "../../../application/use-cases/ports/OutBoxRepository";

export class EventPublisherWorker {
  constructor(private readonly outboxRepo: OutboxRepository) {}

  async publishPending(): Promise<void> {
    const events = await this.outboxRepo.findPending();

    for (const event of events) {
      try {
        console.log("Publicando evento:", event.eventName, event.payload);
        await this.outboxRepo.markAsPublished(event.id);
      } catch (err) {
        console.error("Error publicando evento", event.id, err);
      }
    }
  }
}
