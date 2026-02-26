import { injectable } from "inversify";
import { ProcessRepository } from "../../../application/use-cases/ports/ProcessRepository";
import { Process } from "../../../domain/entities/process/Process";
import { getPrismaClient } from "./PrismaClient";
import { Prisma } from "@prisma/client";

@injectable()
export class PrismaProcessRepository implements ProcessRepository {
  private getDb(tx?: Prisma.TransactionClient) {
    return tx || getPrismaClient();
  }

  async save(process: Process, tx?: Prisma.TransactionClient): Promise<void> {
    const db = this.getDb(tx);

    const stepsData = process.getSteps().map(step => ({
      id: step.getId(),
      name: step.getName(),
      order: step.getOrder(),
      config: (step as any).getConfig ? (step as any).getConfig() : undefined,
    }));

    await db.process.upsert({
      where: { id: process.getId() },
      update: {
        name: process.getName(),
        status: process.getStatus(),
        version: process.getVersion(),
        steps: { deleteMany: {}, create: stepsData },
      },
      create: {
        id: process.getId(),
        name: process.getName(),
        organizationId: process.getOrganizationId(),
        status: process.getStatus(),
        version: process.getVersion(),
        steps: { create: stepsData },
      },
    });
  }

  async findById(id: string): Promise<Process | null> {
    const data = await getPrismaClient().process.findUnique({
      where: { id },
      include: { steps: true },
    });
    if (!data) return null;

    return Process.rehydrate({
      id: data.id,
      name: data.name,
      organizationId: data.organizationId,
      version: data.version,
      status: data.status as any,
      steps: data.steps.map((s: any) => ({
        id: s.id,
        name: s.name,
        order: s.order,
        config: s.config,
      })),
    });
  }
}
