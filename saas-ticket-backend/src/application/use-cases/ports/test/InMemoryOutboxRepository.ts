import { OutboxRepository } from '../../../../infrastructure/persistence/prisma/PrismaOutboxRepository';

export class InMemoryOutboxRepository implements OutboxRepository {
  private events: any[] = [];

  async save(event: any) { this.events.push(event); }
  async findPending(limit?: number) { return this.events.filter(e => !e.published).slice(0, limit); }
  async markAsPublished(id: string) { 
    const e = this.events.find(e => e.id === id); 
    if (e) e.published = true;
  }
}
