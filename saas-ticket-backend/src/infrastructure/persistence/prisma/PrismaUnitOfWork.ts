// src/infrastructure/persistence/prisma/PrismaUnitOfWork.ts
import { PrismaClient, Prisma } from '../../../generated/prisma';
import { UnitOfWork } from '../../../application/use-cases/ports/UnitOfWork';
import { OutboxRepository } from '../../../application/use-cases/ports/OutBoxRepository';

export class PrismaUnitOfWork implements UnitOfWork {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly outboxRepo: OutboxRepository
  ) {}

  async run<T>(
    work: (tx: Prisma.TransactionClient, outbox: OutboxRepository) => Promise<T>
  ): Promise<T> {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      return work(tx, this.outboxRepo);
    });
  }
}
