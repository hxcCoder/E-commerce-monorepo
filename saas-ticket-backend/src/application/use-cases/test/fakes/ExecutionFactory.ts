// src/application/use-cases/test/fakes/ExecutionFactory.ts
import { Execution } from "../../../../domain/entities/execution/Execution";
import { ExecutionStep, ExecutionStepStatus } from "../../../../domain/entities/execution/ExecutionStep";

export class ExecutionFactory {
  static createExecution(id: string = "exec1", processId: string = "proc1"): Execution {
    const step1 = ExecutionStep.rehydrate({ stepId: "step1", status: ExecutionStepStatus.PENDING });
    const step2 = ExecutionStep.rehydrate({ stepId: "step2", status: ExecutionStepStatus.PENDING });

    return Execution.createForTest(id, processId, [step1, step2]);
  }
}
