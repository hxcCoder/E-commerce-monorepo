import { DomainEvent } from "../../audit/shared/DomainEvent";

export class ProcessArchived extends DomainEvent {
  constructor(
    public readonly processId: string,
    eventId?: string,
    occurredOn?: Date
  ) {
    super(eventId, occurredOn);
  }

  getEventName(): string {
    return "process.archived";
  }

  toPrimitives(): Record<string, unknown> {
    return {
      processId: this.processId,
    };
  }
}
