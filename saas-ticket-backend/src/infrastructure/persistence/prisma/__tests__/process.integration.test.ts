import { PrismaUnitOfWork } from "../PrismaUnitOfWork";
import { PrismaProcessRepository } from "../PrismaProcessRepository";
import { Process } from "../../../../domain/entities/process/Process";
import { ProcessStep } from "../../../../domain/entities/process/ProcessStep";
import { getPrismaClient } from "../PrismaClient";

const prisma = getPrismaClient();
const outboxRepo = {
  save: jest.fn(),
  findPending: jest.fn(),
  markAsPublished: jest.fn(),
};
const uow = new PrismaUnitOfWork(prisma, outboxRepo as any);
const processRepo = new PrismaProcessRepository();

describe("Process Repository Integration", () => {
  beforeAll(async () => {
    await prisma.processStep.deleteMany({});
    await prisma.process.deleteMany({});
  });

  it("should save and retrieve a process with steps", async () => {
    const process = Process.create("p1", "Test Process", "org1");
    process.addStep(new ProcessStep({ id: "s1", name: "Step 1", order: 1 }));
    process.addStep(new ProcessStep({ id: "s2", name: "Step 2", order: 2 }));

    await uow.run(async (tx, outbox) => await processRepo.save(process, tx));

    const loaded = await processRepo.findById("p1");
    expect(loaded).not.toBeNull();
    expect(loaded!.getId()).toBe(process.getId());
    expect(loaded!.getSteps().length).toBe(2);
  });
});
