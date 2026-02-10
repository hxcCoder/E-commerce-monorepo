// src/infrastructure/config/container.ts
import 'reflect-metadata';
import { Container } from 'inversify';
import { PrismaClient } from './../../generated/prisma';

import { ExecutionRepository } from '../../application/use-cases/ports/ExecutionRepository';
import { AuditRepository } from '../../application/use-cases/ports/AuditRepository';
import { ProcessRepository } from '../../application/use-cases/ports/ProcessRepository';
import { SubscriptionService } from '../../application/use-cases/ports/SubscriptionService';
import { UnitOfWork } from '../../application/use-cases/ports/UnitOfWork';
import { OutboxRepository } from '../../application/use-cases/ports/OutBoxRepository';

import { PrismaExecutionRepository } from '../persistence/prisma/PrismaExecutionRepository';
import { PrismaAuditRepository } from '../persistence/prisma/PrismaAuditRepository';
import { PrismaProcessRepository } from '../persistence/prisma/PrismaProcessRepository';
import { PrismaOutboxRepository } from '../persistence/prisma/PrismaOutboxRepository';
import { PrismaUnitOfWork } from '../persistence/prisma/PrismaUnitOfWork';

import { SubscriptionServiceImpl } from '../persistence/services/SubscriptionServiceImpl';

import { StartExecution } from '../../application/use-cases/StartExecution';
import { CreateAndActivateProcess } from '../../application/use-cases/CreateAndActivateProcess';
import { ProcessController } from '../../interfaces/http/ProcessController';

const container = new Container();

/* ========================
   Infraestructura base
======================== */

// PrismaClient singleton
container.bind<PrismaClient>(PrismaClient).toConstantValue(new PrismaClient());

// Repositorios
container.bind<OutboxRepository>('OutboxRepository').to(PrismaOutboxRepository);
container.bind<ExecutionRepository>('ExecutionRepository').toDynamicValue(ctx => {
  const outbox = ctx.container.get<OutboxRepository>('OutboxRepository');
  return new PrismaExecutionRepository(outbox);
});
container.bind<AuditRepository>('AuditRepository').to(PrismaAuditRepository);
container.bind<ProcessRepository>('ProcessRepository').to(PrismaProcessRepository);
container.bind<SubscriptionService>('SubscriptionService').to(SubscriptionServiceImpl);
container.bind<UnitOfWork>('UnitOfWork').to(PrismaUnitOfWork);

/* ========================
   Casos de uso
======================== */
container.bind(StartExecution).toSelf();
container.bind(CreateAndActivateProcess).toSelf();

/* ========================
   Controllers
======================== */
container.bind(ProcessController).toSelf();

export { container };
