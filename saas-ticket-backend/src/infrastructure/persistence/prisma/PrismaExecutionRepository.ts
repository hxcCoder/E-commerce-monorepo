// src/infrastructure/persistence/prisma/PrismaExecutionRepository.ts
import { PrismaClient, StepStatus } from "../../../generated/prisma";
import { getPrismaClient } from "./PrismaClient";
import { ExecutionRepository } from "../../../application/use-cases/ports/ExecutionRepository";
import { OutboxRepository } from "../../../application/use-cases/ports/OutBoxRepository";
import { Execution } from "../../../domain/entities/execution/Execution";
import { ExecutionStep } from "../../../domain/entities/execution/ExecutionStep";
import { ExecutionStatus } from "../../../domain/entities/execution/ExecutionStatus";
import { ExecutionStepStatus } from "../../../domain/entities/execution/ExecutionStep";
import { toJsonValue } from "./Json";

type DbExecutionStep = {
  stepId: string;
  status: string;
};

type DbExecution = {
  id: string;
  processId: string;
  status: string;
  steps: DbExecutionStep[];
};

const toPrismaStepStatus = (status: ExecutionStepStatus): StepStatus =>
  status as unknown as StepStatus;

export class PrismaExecutionRepository implements ExecutionRepository {
  private prisma: PrismaClient = getPrismaClient();

  constructor(private readonly outboxRepo: OutboxRepository) {}

  async save(execution: Execution): Promise<void> {
    const events = execution.pullDomainEvents();

    await this.prisma.$transaction(async tx => {
      await tx.execution.upsert({
        where: { id: execution.getId() },
        update: { status: execution.getStatus() as ExecutionStatus },
        create: {
          id: execution.getId(),
          processId: execution.getProcessId(),
          status: execution.getStatus() as ExecutionStatus,
        },
      });

      for (const step of execution.getSteps()) {
        await tx.executionStep.upsert({
          where: {
            executionId_stepId: {
              executionId: execution.getId(),
              stepId: step.getStepId(),
            },
          },
          update: { status: toPrismaStepStatus(step.getStatus()) },
          create: {
            executionId: execution.getId(),
            stepId: step.getStepId(),
            status: toPrismaStepStatus(step.getStatus()),
          },
        });
      }

      for (const event of events) {
        await this.outboxRepo.save({
          id: event.eventId,
          eventName: event.getEventName(),
          payload: toJsonValue(event.toPrimitives()),
          occurredOn: event.occurredOn,
          published: false,
        });
      }
    });
  }

  async findById(id: string): Promise<Execution | null> {
    const row = await this.prisma.execution.findUnique({
      where: { id },
      include: { steps: true },
    });
    if (!row) return null;

    const dbRow = row as unknown as DbExecution;
    return Execution.rehydrate({
      id: dbRow.id,
      processId: dbRow.processId,
      status: dbRow.status as ExecutionStatus,
      steps: dbRow.steps.map(step =>
        ExecutionStep.rehydrate({
          stepId: step.stepId,
          status: step.status as ExecutionStepStatus,
        })
      ),
    });
  }
}
