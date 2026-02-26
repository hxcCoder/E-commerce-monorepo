import { Process } from "../process/Process";
import { ExecutionStatus } from "./ExecutionStatus";
import { ExecutionStep } from "./ExecutionStep";
import { DomainEvent } from "../audit/shared/DomainEvent";
import { ExecutionStarted } from "./events/ExecutionStarted";
import { ExecutionStepCompleted } from "./events/ExecutionStepCompleted";
import { ExecutionCompleted } from "./events/ExecutionCompleted";
import { InvalidProcessStateError } from "../process/ProcessErrors";

export class Execution {
  private domainEvents: DomainEvent[] = [];
  private finishedAt?: Date;

  private constructor(
    private readonly id: string,
    private readonly processId: string,
    private status: ExecutionStatus,
    private steps: ExecutionStep[],
    recordEvent: boolean
  ) {
    if (recordEvent) {
      this.record(new ExecutionStarted(this.id, this.processId));
    }
  }

  static start(id: string, process: Process): Execution {
    if (!process.isActive()) {
      throw new InvalidProcessStateError("Cannot execute inactive process");
    }

    const steps = process.getSteps().map(s =>
      ExecutionStep.fromProcessStep(s)
    );

    return new Execution(
      id,
      process.getId(),
      ExecutionStatus.RUNNING,
      steps,
      true
    );
  }

  static rehydrate(params: {
    id: string;
    processId: string;
    status: ExecutionStatus;
    finishedAt?: Date;
    steps: ExecutionStep[];
  }): Execution {
    const execution = new Execution(
      params.id,
      params.processId,
      params.status,
      params.steps,
      false
    );
    execution.finishedAt = params.finishedAt;
    return execution;
  }

  markStepDone(stepId: string): void {
    if (this.status !== ExecutionStatus.RUNNING) {
      throw new Error("Execution not running");
    }

    const step = this.steps.find(s => s.getStepId() === stepId);
    if (!step) throw new Error("Step not found");

    step.markDone();
    this.record(new ExecutionStepCompleted(this.id, stepId));

    if (this.steps.every(s => s.isDone())) {
      this.status = ExecutionStatus.COMPLETED;
      this.finishedAt = new Date();
      this.record(new ExecutionCompleted(this.id));
    }
  }

  pullDomainEvents(): DomainEvent[] {
    const events = [...this.domainEvents];
    this.domainEvents = [];
    return events;
  }

  private record(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  getId(): string { return this.id; }
  getProcessId(): string { return this.processId; }
  getStatus(): ExecutionStatus { return this.status; }
  getSteps(): ExecutionStep[] { return [...this.steps]; }
  getFinishedAt(): Date | undefined { return this.finishedAt; }
}