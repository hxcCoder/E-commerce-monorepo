import { DomainEvent } from "../../audit/shared/DomainEvent";

export class ExecutionStepCompleted extends DomainEvent {
  constructor(
    public readonly executionId: string,
    public readonly stepId: string,
    eventId?: string,
    occurredOn?: Date
  ) {
    super(eventId, occurredOn);
  }

  getEventName(): string {
    return "execution.step.completed";
  }

  toPrimitives(): Record<string, unknown> {
    return {
      executionId: this.executionId,
      stepId: this.stepId,
    };
  }
}
