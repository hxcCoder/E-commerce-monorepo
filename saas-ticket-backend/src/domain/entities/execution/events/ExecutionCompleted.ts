import { DomainEvent } from "../../audit/shared/DomainEvent";

export class ExecutionCompleted extends DomainEvent {
  constructor(public readonly executionId: string) {
    super();
  }

  getEventName(): string {
    return "execution.completed";
  }

  toPrimitives() {
    return {
      executionId: this.executionId,
    };
  }
}
