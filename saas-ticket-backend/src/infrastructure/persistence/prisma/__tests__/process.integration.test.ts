import { PrismaUnitOfWork } from "../PrismaUnitOfWork";
import { PrismaProcessRepository } from "../PrismaProcessRepository";
import { Process } from "../../../../domain/entities/process/Process";
import { ProcessStep } from "../../../../domain/entities/process/ProcessStep";
import { getPrismaClient } from "../PrismaClient";

if (!process.env.DATABASE_URL) {
  describe.skip("Process Repository Integration", () => {
    it("skips when DATABASE_URL is not configured", () => {
      expect(true).toBe(true);
    });
  });
} else {
  describe("Process Repository Integration", () => {
    const outboxRepo = {
      save: jest.fn(),
      findPending: jest.fn(),
      markAsPublished: jest.fn(),
    };

    const prisma = getPrismaClient();
    const uow = new PrismaUnitOfWork(prisma, outboxRepo as any);
    const processRepo = new PrismaProcessRepository();

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
          status: "ACTIVE",
          plan: "BASIC",
        },
      });
    });

    it("should save and retrieve a process with steps", async () => {
      const process = Process.create("p1", "Test Process", "org1");

      process.addStep(
        new ProcessStep({ id: "s1", name: "Step 1", order: 1 })
      );

      process.addStep(
        new ProcessStep({ id: "s2", name: "Step 2", order: 2 })
      );

      await uow.run(async (tx) => {
        await processRepo.save(process, tx);
      });

      const loaded = await processRepo.findById("p1");

      expect(loaded).not.toBeNull();
      expect(loaded!.getId()).toBe(process.getId());
      expect(loaded!.getSteps().length).toBe(2);
    });
  });
}