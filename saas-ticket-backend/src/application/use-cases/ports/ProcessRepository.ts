import { Process } from "../../../domain/entities/process/Process";

export interface ProcessRepository {
    findById(id: string): Promise<Process | null>;
    save(process: Process, tx?: unknown): Promise<void>;
}
