import { Execution } from '../../../../../domain/entities/execution/Execution';
import { ExecutionStep } from '../../../../../domain/entities/execution/ExecutionStep';

export class InMemoryExecutionRepository {
  private store = new Map<string, Execution>();

  async save(execution: Execution) {
    this.store.set(execution.getId(), execution);
  }

  async findById(id: string): Promise<Execution | null> {
    return this.store.get(id) ?? null;
  }

  // Helper para tests: crea una ejecución dummy con steps opcionales
  createDummyExecution(steps: ExecutionStep[] = []): Execution {
    return Execution.createForTest('exec1', 'process1', steps);
  }
}
