import { Request, Response } from 'express';
import * as crypto from 'crypto';
import { StartExecution } from '../../application/use-cases/StartExecution';
import { CreateAndActivateProcess } from '../../application/use-cases/CreateAndActivateProcess';
import { z } from 'zod';
import { DomainError } from "../../domain/entities/audit/shared/DomainError";


// Esquemas de validación
const startExecutionSchema = z.object({
  processId: z.string().uuid(),
  executionId: z.string().uuid(),
});

const createProcessSchema = z.object({
  name: z.string().min(3),
  organizationId: z.string().uuid(),
  steps: z.array(z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
    order: z.number().int().min(0)
  })).min(1)
});

export class ProcessController {
  // Inyectamos ambos casos de uso
  constructor(
    private startExecUseCase: StartExecution,
    private createProcessUseCase: CreateAndActivateProcess
  ) {}

  // MÉTODO EXISTENTE: Ejecutar
  async startExecution(req: Request, res: Response): Promise<void> {
    try {
      req.logger?.info('startExecution called', { body: req.body });
      const { processId, executionId } = startExecutionSchema.parse(req.body);
      await this.startExecUseCase.execute(processId, executionId);
      res.status(201).send();
    } catch (error) {
      req.logger?.error('startExecution failed', { error });
      this.handleError(res, error);
    }
  }

  // MÉTODO NUEVO: Crear
  async create(req: Request, res: Response): Promise<void> {
    try {
      req.logger?.info('create process called', { body: req.body });
      const validatedData = createProcessSchema.parse(req.body);
      
      // El ID del proceso lo puede mandar el cliente o generarlo aquí
      const processId = (req.body.id as string) || crypto.randomUUID();

      await this.createProcessUseCase.execute({
        id: processId,
        ...validatedData
      });

      res.status(201).json({ id: processId, message: "Process created and activated" });
    } catch (error) {
      req.logger?.error('create process failed', { error });
      this.handleError(res, error);
    }
  }

  // Helper para no repetir código de errores
  private handleError(res: Response, error: unknown) {
  // log whatever we have available on request context
  res.locals && (res.locals.logger || (res as any).logger)?.error?.(
    'Request error',
    { error }
  );

  if (error instanceof z.ZodError) {
    res.status(400).json({ error: "Invalid input", details: error.issues });
    return;
  }

  if (error instanceof DomainError) {
    res.status(422).json({ error: error.message });
    return;
  }

  res.status(500).json({ error: "Internal server error" });
}
}