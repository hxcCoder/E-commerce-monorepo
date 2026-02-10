    import { DomainEvent } from "../../../domain/entities/audit/shared/DomainEvent";

    export interface AuditRepository {
        saveEvents(events: DomainEvent[]): Promise<void>;
    }
