import { Process } from "../../domain/entities/process/Process";
import { ProcessStep } from "../../domain/entities/process/ProcessStep";
import { ProcessRepository } from "./ports/ProcessRepository";
import { SubscriptionService } from "./ports/SubscriptionService";
import { UnitOfWork } from "./ports/UnitOfWork";

export interface CreateProcessInput {
    id: string;
    organizationId: string;
    name: string;
    steps: { 
        id: string;
        name: string; 
        order: number 
    }[];
}


export class CreateAndActivateProcess {
    constructor(
        private readonly processRepo: ProcessRepository,
        private readonly subscriptionService: SubscriptionService,
        private readonly unitOfWork: UnitOfWork
    ) {}

    async execute(input: CreateProcessInput): Promise<void> {
        const canCreate = await this.subscriptionService.canCreateProcess(input.organizationId);
        if (!canCreate) throw new Error("Organization cannot create more processes: Plan limit reached");

        const process = Process.create(input.id, input.name, input.organizationId);

        input.steps.forEach(s => {
            process.addStep(new ProcessStep({
                id: s.id,
                name: s.name,
                order: s.order
            }));
        });

        process.activate();

        await this.unitOfWork.run(async (tx) => {
            await this.processRepo.save(process, tx);
        });
    }
}
