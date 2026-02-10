// src/application/use-cases/ports/EventPublisherWorker.ts
import { OutboxRepository } from "../prisma/PrismaOutboxRepository";

export class EventPublisherWorker {
  constructor(private readonly outboxRepo: OutboxRepository) {}

  async publishPending() {
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
    