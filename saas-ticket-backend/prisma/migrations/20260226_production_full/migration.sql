-- =====================================
-- Migración completa de transición + producción
-- =====================================

-- ==============================
-- 1️⃣ Transición de datos existentes
-- ==============================

-- 1a. ExecutionStep: reemplazar valores temporales
UPDATE "ExecutionStep" es
SET "nameSnapshot" = ps.name,
    "orderSnapshot" = ps.order
FROM "ProcessStep" ps
WHERE es.stepId = ps.id
    AND es."nameSnapshot" = 'TEMP'
    AND es."orderSnapshot" = 0;

-- 1b. Process: asegurar que version tenga valor
UPDATE "Process"
SET "version" = 1
WHERE "version" IS NULL;

-- 1c. Outbox: reemplazar defaults temporales
UPDATE "Outbox"
SET "aggregateId" = id,
    "type" = 'SYSTEM'
WHERE "aggregateId" = 'TEMP'
    OR "type" = 'TEMP';

-- ==============================
-- 2️⃣ Migración final de producción
-- ==============================

-- Enums
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'processstatus') THEN
        CREATE TYPE "ProcessStatus" AS ENUM ('DRAFT','ACTIVE','ARCHIVED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'executionstatus') THEN
        CREATE TYPE "ExecutionStatus" AS ENUM ('PENDING','RUNNING','COMPLETED','FAILED','CANCELLED');
    END IF;
END$$;

-- Cambiar status de Execution
ALTER TABLE "Execution"
    ALTER COLUMN "status" TYPE "ExecutionStatus" USING "status"::text::"ExecutionStatus";

-- Columnas nuevas
ALTER TABLE "ExecutionStep"
    ADD COLUMN IF NOT EXISTS "configSnapshot" JSONB,
    ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP(3);

ALTER TABLE "Process"
    ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 1,
    DROP COLUMN IF EXISTS "status",
    ADD COLUMN IF NOT EXISTS "status" "ProcessStatus" NOT NULL DEFAULT 'DRAFT';

ALTER TABLE "Outbox"
    ADD COLUMN IF NOT EXISTS "aggregateId" TEXT NOT NULL DEFAULT 'SYSTEM',
    ADD COLUMN IF NOT EXISTS "type" TEXT NOT NULL DEFAULT 'SYSTEM';

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
CREATE UNIQUE INDEX IF NOT EXISTS "Process_organizationId_name_version_key" ON "Process"("organizationId","name","version");
CREATE INDEX IF NOT EXISTS "ProcessStep_processId_idx" ON "ProcessStep"("processId");

-- Foreign keys
ALTER TABLE "Process"
    ADD CONSTRAINT IF NOT EXISTS "Process_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ExecutionStep"
    ADD CONSTRAINT IF NOT EXISTS "ExecutionStep_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "Execution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ==============================
-- 3️⃣ Limpieza de defaults temporales
-- ==============================

ALTER TABLE "ExecutionStep"
    ALTER COLUMN "nameSnapshot" DROP DEFAULT,
    ALTER COLUMN "orderSnapshot" DROP DEFAULT;

ALTER TABLE "Process"
    ALTER COLUMN "version" DROP DEFAULT;

ALTER TABLE "Process"
    ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "Outbox"
    ALTER COLUMN "aggregateId" DROP DEFAULT,
    ALTER COLUMN "type" DROP DEFAULT;