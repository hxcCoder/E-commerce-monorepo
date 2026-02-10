import { ExecutionRepository } from './ports/ExecutionRepository';
import { Execution } from '../../domain/entities/execution/Execution';


export class CompleteExecutionStep {
  constructor(private executionRepo: ExecutionRepository) {}

  async execute(executionId: string, stepId: string): Promise<void> {
    const execution = await this.executionRepo.findById(executionId);
    if (!execution) throw new Error('Execution not found');
    execution.markStepDone(stepId);
    await this.executionRepo.save(execution);
  }
}
