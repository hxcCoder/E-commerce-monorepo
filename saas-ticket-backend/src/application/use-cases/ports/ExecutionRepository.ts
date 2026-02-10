import { Execution } from "../../../domain/entities/execution/Execution";

export interface ExecutionRepository {
    findById(id: string): Promise<Execution | null>;
    save(execution: Execution): Promise<void>;
}
