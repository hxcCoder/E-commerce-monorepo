import { EventPublisher } from "../../ports/EventPublisher";
import { CreateAndActivateProcess, CreateProcessInputExtended } from "../../../../../../saas-ticket-backend/src/application/use-cases/CreateAndActivateProcess";
import { StartExecution } from "../../../../../../saas-ticket-backend/src/application/use-cases/StartExecution";
import { CompleteExecutionStep } from "../../../../../../saas-ticket-backend/src/application/use-cases/CompleteExecutionStep";

export class SaasTicketSubscriber {
    constructor(
        private readonly publisher: EventPublisher,
        private readonly createProcess: CreateAndActivateProcess,
        private readonly startExecution: StartExecution,
        private readonly completeExecutionStep: CompleteExecutionStep
    ) {
        // Suscripción a eventos
        if ('subscribe' in this.publisher) {
            (this.publisher as any).subscribe((event: any) => this.handleEvent(event));
        } else {
            throw new Error("Publisher no soporta subscribe");
        }
    }

    private async handleEvent(event: any) {
        switch(event.type) {
            case "OrderCreated":
                await this.handleOrderCreated(event.payload);
                break;
            case "OrderPaid":
                await this.handleOrderPaid(event.payload);
                break;
            case "OrderPaymentFailed":
                console.log("Payment failed for order", event.payload.orderId);
                break;
            default:
                break;
        }
    }

    private async handleOrderCreated(payload: { orderId: string, organizationId: string, name: string }) {
        const input: CreateProcessInputExtended = {
            id: crypto.randomUUID(),
            organizationId: payload.organizationId,
            name: payload.name,
            orderId: payload.orderId,
            steps: [
                { id: crypto.randomUUID(), name: "Step 1", order: 1 },
                { id: crypto.randomUUID(), name: "Step 2", order: 2 }
            ]
        };

        await this.createProcess.execute(input);
    }

    private async handleOrderPaid(payload: { orderId: string, processId: string }) {
        // Ahora necesitamos processId y executionId
        const executionId = crypto.randomUUID(); // Generamos un nuevo executionId
        await this.startExecution.execute(payload.processId, executionId);

        // Marca el primer paso como completado (ejemplo)
        const firstStepId = "step-1"; // Aquí deberías mapear al stepId real
        await this.completeExecutionStep.execute(executionId, firstStepId);
    }
}
