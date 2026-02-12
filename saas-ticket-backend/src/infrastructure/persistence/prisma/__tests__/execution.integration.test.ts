import { PrismaUnitOfWork } from "../PrismaUnitOfWork";
import { PrismaExecutionRepository } from "../PrismaExecutionRepository";
import { ExecutionFactory } from "../../../../application/use-cases/test/fakes/ExecutionFactory";
import { getPrismaClient } from "../PrismaClient";

if (!process.env.DATABASE_URL) {
  describe.skip("Execution Repository Integration", () => {
    it("skips when DATABASE_URL is not configured", () => {
      expect(true).toBe(true);
    });
  });
} else {
  describe("Execution Repository Integration", () => {
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
    });

    it("should save and retrieve an execution", async () => {
      const execution = ExecutionFactory.createExecution();
      await uow.run(async () => repo.save(execution));

      const loaded = await repo.findById(execution.getId());
      expect(loaded).not.toBeNull();
      expect(loaded!.getId()).toBe(execution.getId());
      expect(loaded!.getSteps().length).toBe(execution.getSteps().length);
    });
  });
}
