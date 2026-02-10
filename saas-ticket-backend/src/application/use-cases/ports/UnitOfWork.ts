// src/application/use-cases/ports/UnitOfWork.ts
import { PrismaClient, Prisma } from '../../../generated/prisma';
import { OutboxRepository } from './OutBoxRepository';

export interface UnitOfWork {
  /**
   * Ejecuta una función dentro de una transacción atómica
   */
  run<T>(work: (tx: Prisma.TransactionClient, outbox: OutboxRepository) => Promise<T>): Promise<T>;
}
  