import { DomainEvent } from "../../audit/shared/DomainEvent";

export class ProcessCreated extends DomainEvent {
  constructor(
    public readonly processId: string,
    public readonly name: string,
    eventId?: string,
    occurredOn?: Date
  ) {
    super(eventId, occurredOn);
  }

  getEventName(): string {
    return "process.created";
  }

  toPrimitives(): Record<string, unknown> {
    return {
      processId: this.processId,
      name: this.name,
    };
  }
}
