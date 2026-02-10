import { InMemoryEventPublisher } from "./application/use-cases/__tests__/fakes/InMemoryEventPublisher";
import { SaasTicketSubscriber } from "./application/use-cases/subscribers/SaasTicketSubscriber";

// Use-cases del SaaS
import { CreateAndActivateProcess } from "../../../saas-ticket-backend/src/application/use-cases/CreateAndActivateProcess";
import { StartExecution } from "../../../saas-ticket-backend/src/application/use-cases/StartExecution";
import { CompleteExecutionStep } from "../../../saas-ticket-backend/src/application/use-cases/CompleteExecutionStep";

// Instancia el EventPublisher (puedes cambiarlo a real más tarde)
const eventPublisher = new InMemoryEventPublisher();

// Instancia los use-cases del SaaS
const createProcess = new CreateAndActivateProcess(/* repositorios / dependencias */);
const startExecution = new StartExecution(/* repositorios / dependencias */);
const completeStep = new CompleteExecutionStep(/* repositorios / dependencias */);

// Instancia el subscriber
const saasSubscriber = new SaasTicketSubscriber(createProcess, startExecution, completeStep);

// Suscribirlo al EventPublisher
eventPublisher.subscribe((event) => saasSubscriber.handleEvent(event));

// Ejemplo: publicar un evento para probar
eventPublisher.publish({
    type: "OrderCreated",
    orderId: "123",
    items: [],
  totalAmount: 100,
});
