import { ProcessStep } from "../process/ProcessStep";

export enum ExecutionStepStatus {
  PENDING = "PENDING",
  DONE = "DONE",
  FAILED = "FAILED",
}

export class ExecutionStep {
  private readonly stepId: string;
  private status: ExecutionStepStatus;

  private constructor(stepId: string, status?: ExecutionStepStatus) {
    this.stepId = stepId;
    this.status = status ?? ExecutionStepStatus.PENDING;
  }

  static fromProcessStep(step: ProcessStep): ExecutionStep {
    return new ExecutionStep(step.getId());
  }

  static rehydrate(params: {
    stepId: string;
    status: ExecutionStepStatus;
  }): ExecutionStep {
    if (!Object.values(ExecutionStepStatus).includes(params.status)) {
      throw new Error("Invalid ExecutionStepStatus during rehydration");
    }
    return new ExecutionStep(params.stepId, params.status);
  }

  markDone(): void {
    if (this.status !== ExecutionStepStatus.PENDING) return;
    this.status = ExecutionStepStatus.DONE;
  }

  isDone(): boolean {
    return this.status === ExecutionStepStatus.DONE;
  }

  getStepId(): string {
    return this.stepId;
  }

  getStatus(): ExecutionStepStatus {
    return this.status;
  }
}