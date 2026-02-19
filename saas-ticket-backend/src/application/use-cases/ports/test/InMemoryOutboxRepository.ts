import {
  OutboxEvent,
  OutboxRepository,
} from '../../../../application/use-cases/ports/OutBoxRepository';

export class InMemoryOutboxRepository implements OutboxRepository {
  private events: OutboxEvent[] = [];

  async save(event: OutboxEvent): Promise<void> {
    this.events.push(event);
  }

  async findPending(limit = 100): Promise<OutboxEvent[]> {
    return this.events.filter((e) => !e.published).slice(0, limit);
  }

  async markAsPublished(id: string): Promise<void> {
    const event = this.events.find((e) => e.id === id);
    if (event) {
      event.published = true;
    }
  }
}
