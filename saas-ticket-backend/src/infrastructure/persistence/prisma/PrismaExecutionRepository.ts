import { PrismaClient, StepStatus } from "../../../generated/prisma";
import { getPrismaClient } from "./PrismaClient";
import { ExecutionRepository } from "../../../application/use-cases/ports/ExecutionRepository";
import { OutboxRepository } from "../../../application/use-cases/ports/OutBoxRepository";
import { Execution } from "../../../domain/entities/execution/Execution";
import { ExecutionStep } from "../../../domain/entities/execution/ExecutionStep";
import { ExecutionStatus } from "../../../domain/entities/execution/ExecutionStatus";
import { ExecutionStepStatus } from "../../../domain/entities/execution/ExecutionStep";
import { toJsonValue } from "./Json";

export class PrismaExecutionRepository implements ExecutionRepository {
  private prisma: PrismaClient = getPrismaClient();

  constructor(private readonly outboxRepo: OutboxRepository) {}

  async save(execution: Execution): Promise<void> {
    const events = execution.pullDomainEvents();

    await this.prisma.$transaction(async tx => {
      await tx.execution.upsert({
        where: { id: execution.getId() },
        update: {
          status: execution.getStatus(),
          finishedAt: execution.getFinishedAt(),
        },
        create: {
          id: execution.getId(),
          processId: execution.getProcessId(),
          status: execution.getStatus(),
          finishedAt: execution.getFinishedAt(),
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
          update: {
            status: step.getStatus() as unknown as StepStatus,
            completedAt: step.getCompletedAt(),
          },
          create: {
            executionId: execution.getId(),
            stepId: step.getStepId(),
            nameSnapshot: step.getNameSnapshot(),
            orderSnapshot: step.getOrderSnapshot(),
            configSnapshot: toJsonValue(step.getConfigSnapshot()),
            status: step.getStatus() as unknown as StepStatus,
            completedAt: step.getCompletedAt(),
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

    return Execution.rehydrate({
      id: row.id,
      processId: row.processId,
      status: row.status as ExecutionStatus,
      finishedAt: row.finishedAt ?? undefined,
      steps: row.steps.map(step =>
        ExecutionStep.rehydrate({
          stepId: step.stepId,
          nameSnapshot: step.nameSnapshot,
          orderSnapshot: step.orderSnapshot,
          configSnapshot: step.configSnapshot,
          status: step.status as ExecutionStepStatus,
          completedAt: step.completedAt ?? undefined,
        })
      ),
    });
  }
}