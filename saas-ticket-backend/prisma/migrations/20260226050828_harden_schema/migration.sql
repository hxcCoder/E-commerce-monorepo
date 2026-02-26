-- Enums
CREATE TYPE "ProcessStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');
CREATE TYPE "ExecutionStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- Cambiar status de Execution
ALTER TABLE "Execution"
  ALTER COLUMN "status" TYPE "ExecutionStatus" USING "status"::text::"ExecutionStatus";

-- Columnas nuevas
ALTER TABLE "ExecutionStep"
  ADD COLUMN "nameSnapshot" TEXT NOT NULL,
  ADD COLUMN "orderSnapshot" INTEGER NOT NULL,
  ADD COLUMN "configSnapshot" JSONB,
  ADD COLUMN "completedAt" TIMESTAMP(3);

ALTER TABLE "Process"
  ADD COLUMN "version" INTEGER NOT NULL,
  DROP COLUMN "status",
  ADD COLUMN "status" "ProcessStatus" NOT NULL;

ALTER TABLE "Outbox"
  ADD COLUMN "aggregateId" TEXT NOT NULL,
  ADD COLUMN "type" TEXT NOT NULL;

-- Drop columnas antiguas
ALTER TABLE "Organization"
  DROP COLUMN IF EXISTS "plan",
  DROP COLUMN IF EXISTS "status";

ALTER TABLE "Outbox"
  DROP COLUMN IF EXISTS "createdAt",
  DROP COLUMN IF EXISTS "eventName",
  DROP COLUMN IF EXISTS "updatedAt";

ALTER TABLE "Process"
  DROP COLUMN IF EXISTS "updatedAt";

-- Índices
CREATE INDEX IF NOT EXISTS "Execution_processId_idx" ON "Execution"("processId");
CREATE INDEX IF NOT EXISTS "Execution_status_idx" ON "Execution"("status");
CREATE INDEX IF NOT EXISTS "ExecutionStep_executionId_idx" ON "ExecutionStep"("executionId");
CREATE INDEX IF NOT EXISTS "Outbox_published_idx" ON "Outbox"("published");
CREATE INDEX IF NOT EXISTS "Outbox_occurredOn_idx" ON "Outbox"("occurredOn");
CREATE INDEX IF NOT EXISTS "Process_organizationId_idx" ON "Process"("organizationId");
CREATE UNIQUE INDEX IF NOT EXISTS "Process_organizationId_name_version_key" ON "Process"("organizationId", "name", "version");
CREATE INDEX IF NOT EXISTS "ProcessStep_processId_idx" ON "ProcessStep"("processId");

-- Foreign keys
ALTER TABLE "Process"
  ADD CONSTRAINT "Process_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ExecutionStep"
  ADD CONSTRAINT "ExecutionStep_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "Execution"("id") ON DELETE CASCADE ON UPDATE CASCADE;