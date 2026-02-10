import { AuditRepository } from "../../../application/use-cases/ports/AuditRepository";
import { DomainEvent } from "../../../domain/entities/audit/shared/DomainEvent";
import { getPrismaClient } from "./PrismaClient";
import { Prisma } from "../../../generated/prisma";

export class PrismaAuditRepository implements AuditRepository {
  private prisma = getPrismaClient();

  async saveEvents(events: DomainEvent[]): Promise<void> {
    try {
      for (const event of events) {
        const primitives = event.toPrimitives();

        await this.prisma.auditLog.create({
          data: {
            eventId: event.eventId, // ✅ FIX
            eventName: event.getEventName(),
            eventData: primitives as Prisma.InputJsonValue,
            payload: primitives as Prisma.InputJsonValue,
            occurredOn: event.occurredOn,
          },
        });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to save events: ${error.message}`);
      }
      throw new Error("Failed to save events");
    }
  }
}
