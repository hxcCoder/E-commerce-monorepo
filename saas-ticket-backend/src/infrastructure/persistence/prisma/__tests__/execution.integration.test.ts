import { PrismaUnitOfWork } from "../PrismaUnitOfWork";
import { PrismaExecutionRepository } from "../PrismaExecutionRepository";
import { ExecutionFactory } from "../../../../application/use-cases/test/fakes/ExecutionFactory";
import { getPrismaClient } from "../PrismaClient";

const prisma = getPrismaClient();
const outboxRepo = {
  save: jest.fn(),
  findPending: jest.fn(),
  markAsPublished: jest.fn(),
};
const uow = new PrismaUnitOfWork(prisma, outboxRepo as any);
const repo = new PrismaExecutionRepository(outboxRepo as any);

describe("Execution Repository Integration", () => {
  beforeAll(async () => {
    await prisma.executionStep.deleteMany({});
    await prisma.execution.deleteMany({});
  });

  it("should save and retrieve an execution", async () => {
    const execution = ExecutionFactory.createExecution();
    await uow.run(async (tx, outbox) => await repo.save(execution));

    const loaded = await repo.findById(execution.getId());
    expect(loaded).not.toBeNull();
    expect(loaded!.getId()).toBe(execution.getId());
    expect(loaded!.getSteps().length).toBe(execution.getSteps().length);
  });
});
