import { Router } from 'express';
import { ProcessController } from './ProcessController';
import { container } from '../../infrastructure/config/container';
import { authMiddleware } from './authMiddleware';

export class ProcessRoutes {
  public router: Router;
  private controller: ProcessController;

  constructor() {
    this.router = Router();
    this.controller = container.get(ProcessController);
    this.initRoutes();
  }

  private initRoutes(): void {
    this.router.use(authMiddleware);

    // Ruta para crear (POST /)
    this.router.post('/', this.controller.create.bind(this.controller));

    // Ruta para ejecutar (POST /start-execution)
    this.router.post('/start-execution', this.controller.startExecution.bind(this.controller));
  }
}
