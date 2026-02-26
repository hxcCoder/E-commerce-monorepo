import { ProcessStep } from "../process/ProcessStep";

export enum ExecutionStepStatus {
  PENDING = "PENDING",
  DONE = "DONE",
  FAILED = "FAILED",
}

export class ExecutionStep {
  private readonly stepId: string;
  private readonly nameSnapshot: string;
  private readonly orderSnapshot: number;
  private readonly configSnapshot?: any;
  private status: ExecutionStepStatus;
  private completedAt?: Date;

  private constructor(params: {
    stepId: string;
    nameSnapshot: string;
    orderSnapshot: number;
    configSnapshot?: any;
    status?: ExecutionStepStatus;
    completedAt?: Date;
  }) {
    this.stepId = params.stepId;
    this.nameSnapshot = params.nameSnapshot;
    this.orderSnapshot = params.orderSnapshot;
    this.configSnapshot = params.configSnapshot;
    this.status = params.status ?? ExecutionStepStatus.PENDING;
    this.completedAt = params.completedAt;
  }

  static fromProcessStep(step: ProcessStep): ExecutionStep {
    return new ExecutionStep({
      stepId: step.getId(),
      nameSnapshot: step.getName(),
      orderSnapshot: step.getOrder(),
      configSnapshot: step.getConfig(),
    });
  }

  static rehydrate(params: {
    stepId: string;
    nameSnapshot: string;
    orderSnapshot: number;
    configSnapshot?: any;
    status: ExecutionStepStatus;
    completedAt?: Date;
  }): ExecutionStep {
    return new ExecutionStep(params);
  }

  markDone(): void {
    if (this.status !== ExecutionStepStatus.PENDING) return;
    this.status = ExecutionStepStatus.DONE;
    this.completedAt = new Date();
  }

  isDone(): boolean {
    return this.status === ExecutionStepStatus.DONE;
  }

  getStepId(): string { return this.stepId; }
  getStatus(): ExecutionStepStatus { return this.status; }
  getNameSnapshot(): string { return this.nameSnapshot; }
  getOrderSnapshot(): number { return this.orderSnapshot; }
  getConfigSnapshot(): any { return this.configSnapshot; }
  getCompletedAt(): Date | undefined { return this.completedAt; }
}