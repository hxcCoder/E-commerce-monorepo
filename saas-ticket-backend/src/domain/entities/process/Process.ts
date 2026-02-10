import { ProcessStatus } from "./ProcessStatus";
import { ProcessStep } from "./ProcessStep";
import {
    ProcessAlreadyActiveError,
    ProcessHasNoStepsError,
    InvalidProcessStateError,
} from "./ProcessErrors";
import { DomainEvent } from "../audit/shared/DomainEvent";
import { ProcessCreated } from "./events/ProcessCreated";
import { ProcessActivated } from "./events/ProcessActivated";

export class Process {
    private readonly id: string;
    private name: string;
    private readonly organizationId: string;
    private status: ProcessStatus;
    private steps: ProcessStep[] = [];
    private domainEvents: DomainEvent[] = [];

private constructor(id: string, name: string, organizationId: string) {
        this.id = id;
        this.name = name;
        this.organizationId = organizationId;
        this.status = ProcessStatus.DRAFT;
        this.record(new ProcessCreated(id, name));
    }

static create(id: string, name: string, organizationId: string): Process {
        return new Process(id, name, organizationId);
    }
static rehydrate(data: {
    id: string;
    name: string;
    organizationId: string;
    status: ProcessStatus;
    steps: { id: string; name: string; order: number }[]; // Añadimos id aquí
}): Process {
    const process = new Process(data.id, data.name, data.organizationId);
    process.status = data.status;
    
    process.steps = data.steps.map(s => new ProcessStep({ 
        id: s.id, 
        name: s.name, 
        order: s.order 
    }));
    
    process.pullDomainEvents(); 
    return process;
}

getOrganizationId(): string { return this.organizationId; }

addStep(step: ProcessStep): void {
    if (this.status !== ProcessStatus.DRAFT) {
        throw new InvalidProcessStateError(
        "Cannot add steps to a non-draft process"
    );
}

    this.steps.push(step);
}

activate(): void {
    if (this.status !== ProcessStatus.DRAFT) {
        throw new InvalidProcessStateError(
        "Only draft processes can be activated"
        );
    }

    if (this.steps.length === 0) {
        throw new ProcessHasNoStepsError();
    }

    this.status = ProcessStatus.ACTIVE;
    this.record(new ProcessActivated(this.id));
}

isActive(): boolean {
    return this.status === ProcessStatus.ACTIVE;
}

pullDomainEvents(): DomainEvent[] {
    const events = [...this.domainEvents];
    this.domainEvents = [];
    return events;
}

private record(event: DomainEvent): void {
    this.domainEvents.push(event);
}
public getId(): string {
    return this.id;
}
public getName(): string {
    return this.name;
}
public getSteps(): readonly ProcessStep[] {
    return this.steps;
}

public getStatus(): ProcessStatus {
    return this.status;
}

}
