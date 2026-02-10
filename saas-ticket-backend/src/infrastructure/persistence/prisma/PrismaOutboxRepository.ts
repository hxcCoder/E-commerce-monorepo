import { PrismaClient } from "../../../generated/prisma";
import { getPrismaClient } from "./PrismaClient";
import {
  OutboxRepository,
  OutboxEvent
} from "../../../application/use-cases/ports/OutBoxRepository";

export class PrismaOutboxRepository implements OutboxRepository {
  private prisma: PrismaClient = getPrismaClient();

  async save(event: OutboxEvent): Promise<void> {
    await this.prisma.outbox.create({
      data: {
        id: event.id,
        eventName: event.eventName,
        payload: event.payload ?? {},
        occurredOn: event.occurredOn,
        published: event.published,
      },
    });
  }

  async findPending(limit = 100): Promise<OutboxEvent[]> {
    const rows = await this.prisma.outbox.findMany({
      where: { published: false },
      take: limit,
    });

    return rows.map(r => ({
      id: r.id,
      eventName: r.eventName,
      payload: r.payload,
      occurredOn: r.occurredOn,
      published: r.published,
    }));
  }

  async markAsPublished(id: string): Promise<void> {
    await this.prisma.outbox.update({
      where: { id },
      data: { published: true },
    });
  }
}
