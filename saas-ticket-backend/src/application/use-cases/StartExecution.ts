import { ExecutionRepository } from './ports/ExecutionRepository';
import { ProcessRepository } from './ports/ProcessRepository';
import { AuditRepository } from './ports/AuditRepository';
import { Execution } from '../../domain/entities/execution/Execution';
import { ProcessNotActive } from '../../domain/entities/execution/ExecutionErrors';

export class StartExecution {
  constructor(
    private executionRepo: ExecutionRepository,
    private processRepo: ProcessRepository,
    private auditRepo: AuditRepository
  ) {}

  async execute(processId: string, executionId: string): Promise<void> {
    const process = await this.processRepo.findById(processId);
    if (!process || !process.isActive()) {
      throw new ProcessNotActive();
    }
    const execution = Execution.start(executionId, process);
    await this.executionRepo.save(execution);
    await this.auditRepo.saveEvents(execution.pullDomainEvents());
  }
}
