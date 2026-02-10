import { DomainEvent } from "../../audit/shared/DomainEvent";

export class ExecutionStarted extends DomainEvent {
  constructor(
    public readonly executionId: string,
    public readonly processId: string,
    eventId?: string,
    occurredOn?: Date
  ) {
    super(eventId, occurredOn);
  }

  getEventName(): string {
    return "execution.started";
  }

  toPrimitives(): Record<string, unknown> {
    return {
      executionId: this.executionId,
      processId: this.processId,
      occurredOn: this.occurredOn.toISOString(),
    };
  }
}
