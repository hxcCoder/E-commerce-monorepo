import { ProcessStatus } from "./ProcessStatus";
import { ProcessStep } from "./ProcessStep";
import {
  ProcessHasNoStepsError,
  InvalidProcessStateError,
} from "./ProcessErrors";
import { DomainEvent } from "../audit/shared/DomainEvent";
import { ProcessCreated } from "./events/ProcessCreated";
import { ProcessActivated } from "./events/ProcessActivated";

export class Process {
  private readonly id: string;
  private readonly organizationId: string;
  private readonly version: number;
  private name: string;
  private status: ProcessStatus;
  private steps: ProcessStep[] = [];
  private domainEvents: DomainEvent[] = [];

  private constructor(
    id: string,
    name: string,
    organizationId: string,
    version: number
  ) {
    this.id = id;
    this.name = name;
    this.organizationId = organizationId;
    this.version = version;
    this.status = ProcessStatus.DRAFT;

    this.record(new ProcessCreated(id, name));
  }

  static create(
    id: string,
    name: string,
    organizationId: string,
    version: number = 1
  ): Process {
    // new processes start at version 1 by default; callers may override for rehydration
    return new Process(id, name, organizationId, version);
  }

  static rehydrate(data: {
    id: string;
    name: string;
    organizationId: string;
    version: number;
    status: ProcessStatus;
    steps: { id: string; name: string; order: number; config?: any }[];
  }): Process {
    const process = new Process(
      data.id,
      data.name,
      data.organizationId,
      data.version
    );

    process.status = data.status;
    process.steps = data.steps.map(
      s =>
        new ProcessStep({
          id: s.id,
          name: s.name,
          order: s.order,
          config: s.config,
        })
    );

    process.pullDomainEvents();
    return process;
  }

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

  pullDomainEvents(): DomainEvent[] {
    const events = [...this.domainEvents];
    this.domainEvents = [];
    return events;
  }

  private record(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  getId(): string { return this.id; }
  getName(): string { return this.name; }
  getOrganizationId(): string { return this.organizationId; }
  getVersion(): number { return this.version; }
  getStatus(): ProcessStatus { return this.status; }
  getSteps(): readonly ProcessStep[] { return this.steps; }
  isActive(): boolean { return this.status === ProcessStatus.ACTIVE; }
}