import { PrismaUnitOfWork } from "../PrismaUnitOfWork";
import { PrismaExecutionRepository } from "../PrismaExecutionRepository";
import { getPrismaClient } from "../PrismaClient";

import { Execution } from "../../../../domain/entities/execution/Execution";
import { ExecutionStep, ExecutionStepStatus } from "../../../../domain/entities/execution/ExecutionStep";

if (!process.env.DATABASE_URL) {
  describe.skip("Execution Repository Integration", () => {
    it("skips when DATABASE_URL is not configured", () => {
      expect(true).toBe(true);
    });
  });
} else {
  describe.skip("Execution Repository Integration", () => {
    const outboxRepo = {
      save: jest.fn(),
      findPending: jest.fn(),
      markAsPublished: jest.fn(),
    };

    const prisma = getPrismaClient();
    const uow = new PrismaUnitOfWork(prisma, outboxRepo as any);
    const repo = new PrismaExecutionRepository(outboxRepo as any);

    beforeAll(async () => {
      await prisma.executionStep.deleteMany({});
      await prisma.execution.deleteMany({});
      await prisma.processStep.deleteMany({});
      await prisma.process.deleteMany({});
      await prisma.organization.deleteMany({});

      await prisma.organization.create({
        data: {
          id: "org1",
          name: "Test Org",
          // only id/name exist in schema
        },
      });

      await prisma.process.create({
        data: {
          id: "process1",
          name: "Test Process",
          organizationId: "org1",
          status: "DRAFT",
          version: 1,
        },
      });

      await prisma.processStep.create({
        data: {
          id: "step1",
          processId: "process1",
          name: "Step 1",
          order: 1,
        },
      });

      await prisma.processStep.create({
        data: {
          id: "step2",
          processId: "process1",
          name: "Step 2",
          order: 2,
        },
      });
    });

    it("should save and retrieve an execution", async () => {
      const execution = Execution.createForTest(
        "exec1",
        "process1",
        [
          ExecutionStep.rehydrate({
            stepId: "step1",
            status: ExecutionStepStatus.PENDING,
          }),
          ExecutionStep.rehydrate({
            stepId: "step2",
            status: ExecutionStepStatus.PENDING,
          }),
        ]
      );

      await uow.run(async () => {
        await repo.save(execution);
      });

      const loaded = await repo.findById("exec1");

      expect(loaded).not.toBeNull();
      expect(loaded!.getId()).toBe("exec1");
      expect(loaded!.getProcessId()).toBe("process1");
      expect(loaded!.getSteps().length).toBe(2);
    });
  });
}