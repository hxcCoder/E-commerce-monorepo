/*
  Warnings:

  - The values [COMPLETED,DISABLED] on the enum `StepStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `finishedAt` on the `Execution` table. All the data in the column will be lost.
  - You are about to drop the `AuditLog` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[executionId,stepId]` on the table `ExecutionStep` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[processId,order]` on the table `ProcessStep` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `status` on the `Execution` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `Process` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StepStatus_new" AS ENUM ('PENDING', 'DONE', 'FAILED');
ALTER TABLE "ExecutionStep" ALTER COLUMN "status" TYPE "StepStatus_new" USING ("status"::text::"StepStatus_new");
ALTER TYPE "StepStatus" RENAME TO "StepStatus_old";
ALTER TYPE "StepStatus_new" RENAME TO "StepStatus";
DROP TYPE "public"."StepStatus_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "ExecutionStep" DROP CONSTRAINT "ExecutionStep_executionId_fkey";

-- DropIndex
DROP INDEX "Execution_processId_idx";

-- DropIndex
DROP INDEX "ExecutionStep_executionId_idx";

-- DropIndex
DROP INDEX "ExecutionStep_stepId_idx";

-- DropIndex
DROP INDEX "Outbox_occurredOn_idx";

-- DropIndex
DROP INDEX "Outbox_published_idx";

-- DropIndex
DROP INDEX "Process_organizationId_idx";

-- AlterTable
ALTER TABLE "Execution" DROP COLUMN "finishedAt",
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Process" DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL;

-- DropTable
DROP TABLE "AuditLog";

-- DropEnum
DROP TYPE "ExecutionStatus";

-- DropEnum
DROP TYPE "ProcessStatus";

-- CreateIndex
CREATE UNIQUE INDEX "ExecutionStep_executionId_stepId_key" ON "ExecutionStep"("executionId", "stepId");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessStep_processId_order_key" ON "ProcessStep"("processId", "order");

-- AddForeignKey
ALTER TABLE "ExecutionStep" ADD CONSTRAINT "ExecutionStep_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "Execution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
