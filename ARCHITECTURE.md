# CommerceFlow - Arquitectura del Sistema

## 📊 Diagrama General de la Plataforma

```mermaid
graph TB
    subgraph "Frontend Layer"
        WEB["Storefront Web 🌐<br/>(Next-gen UX)"]
    end

    subgraph "API Gateway & Auth"
        ROUTER["Express Router<br/>(ProcessRoutes)"]
        AUTH["JWT Auth Middleware<br/>(authMiddleware)"]
    end

    subgraph "CommerceFlow Domain"
        ORD["Order Domain<br/>(Order, OrderItem)"]
        PAY["Payment Domain<br/>(PaymentStatus)"]
        PROD["Product Domain<br/>(Product)"]
    end

    subgraph "Use Cases Layer"
        CREATE["CreateOrder<br/>(Request payment)"]
        CONFIRM["ConfirmPayment<br/>(Approve/Reject)"]
        REQUEST["RequestOrderPayment<br/>(Initiate payment)"]
        FULFILL["FulfillOrder<br/>(Complete order)"]
    end

    subgraph "Event System"
        EVENTS["Domain Events<br/>OrderCreated<br/>OrderPaid<br/>OrderFulfilled"]
        PUBLISHER["EventPublisher<br/>(InMemoryBus)"]
    end

    subgraph "SaaS Backend"
        PROCESS["Process Management<br/>(CreateAndActivateProcess)"]
        EXECUTION["Execution Engine<br/>(StartExecution)"]
        AUDIT["Audit Logging<br/>(AuditLog)"]
    end

    subgraph "Persistence Layer"
        PRISMA["Prisma ORM<br/>(PostgreSQL)"]
        STORAGE["Repositories<br/>(Order, Process, Audit)"]
    end

    subgraph "External Systems"
        PAYMENT_GATEWAY["Payment Gateway<br/>(Stripe/PayPal)"]
        EMAIL["Email Service<br/>(Notifications)"]
    end

    WEB -->|HTTP/JSON| ROUTER
    ROUTER --> AUTH
    AUTH --> CREATE
    AUTH --> CONFIRM
    AUTH --> REQUEST
    AUTH --> FULFILL
    
    CREATE --> ORD
    CONFIRM --> ORD
    REQUEST --> ORD
    FULFILL --> ORD
    
    CREATE --> PUBLISHER
    CONFIRM --> PUBLISHER
    REQUEST --> PUBLISHER
    FULFILL --> PUBLISHER
    
    PUBLISHER --> EVENTS
    EVENTS -->|Subscribe| PROCESS
    EVENTS -->|Log| AUDIT
    
    PROCESS --> EXECUTION
    EXECUTION --> AUDIT
    
    ORD --> STORAGE
    PROCESS --> STORAGE
    AUDIT --> STORAGE
    
    STORAGE --> PRISMA
    PRISMA -->|Read/Write| PAYMENT_GATEWAY
    AUDIT --> EMAIL
```

---

## 🔄 Flujo de una Orden Completa

```mermaid
sequenceDiagram
    actor User as Usuario
    participant WEB as Frontend<br/>(Storefront)
    participant API as Backend API
    participant DOMAIN as Domain Layer
    participant EVENTS as Event Bus
    participant SAAS as SaaS Scheduler
    participant DB as Database
    participant EMAIL as Email Service

    User->>WEB: Crea carrito + paga
    WEB->>API: POST /api/orders (items, user)
    
    API->>DOMAIN: CreateOrder.execute()
    Note over DOMAIN: Crea Order entity<br/>Estado: CREATED
    
    DOMAIN->>DB: Save order
    DOMAIN->>EVENTS: Publish OrderCreated
    
    EVENTS->>SAAS: OrderCreated event
    SAAS->>API: CreateAndActivateProcess
    Note over SAAS: Proceso:<br/>1. Validar pago<br/>2. Reservar stock<br/>3. Enviar confirmación
    
    API->>DOMAIN: RequestOrderPayment.execute()
    Note over DOMAIN: Estado: PAYMENT_PENDING
    DOMAIN->>EVENTS: Publish OrderPaymentRequested
    
    User->>WEB: Procesa pago
    WEB->>PAYMENT_GATEWAY: Charge card
    
    alt Pago aprobado
        WEB->>API: ConfirmPayment (approved)
        API->>DOMAIN: ConfirmPayment.execute()
        Note over DOMAIN: Estado: PAID
        DOMAIN->>EVENTS: Publish OrderPaid
        EVENTS->>SAAS: Actualizar proceso
        
        SAAS->>API: StartExecution (reserve stock)
        API->>DB: Update inventory
        
        API->>DOMAIN: FulfillOrder.execute()
        Note over DOMAIN: Estado: FULFILLED
        DOMAIN->>EVENTS: Publish OrderFulfilled
        
        EVENTS->>EMAIL: Send confirmation
        EMAIL->>User: "Orden confirmada"
    else Pago rechazado
        WEB->>API: ConfirmPayment (rejected)
        API->>DOMAIN: order.fail()
        Note over DOMAIN: Estado: FAILED
        DOMAIN->>EVENTS: Publish OrderPaymentFailed
        EVENTS->>EMAIL: Send failure notice
    end
```

---

## 🏗️ Arquitectura por Capas - CommerceFlow

```mermaid
graph LR
    subgraph "Interfaces/HTTP"
        CTRL["Controllers<br/>(ProcessController)"]
        ROUTES["Routes<br/>(ProcessRoutes)"]
        SCHEMA["Schemas<br/>(Zod validation)"]
    end
    
    subgraph "Application Layer"
        USECASES["Use Cases<br/>(CreateOrder<br/>ConfirmPayment<br/>RequestPayment<br/>FulfillOrder)"]
        PORTS["Port Interfaces<br/>(OrderRepository<br/>EventPublisher<br/>ProductRepository)"]
    end
    
    subgraph "Domain Layer"
        ENTITIES["Entities<br/>(Order, OrderItem<br/>Product, Payment)"]
        ERRORS["Domain Errors<br/>(OrderErrors)"]
        EVENTS_DOMAIN["Domain Events<br/>(OrderCreated<br/>OrderPaid<br/>OrderFulfilled)"]
    end
    
    subgraph "Infrastructure"
        REPOS["Repositories<br/>(Prisma)"]
        LOGGER["Logger<br/>(Winston)"]
        CONFIG["Configuration<br/>(env, DI)"]
    end

    ROUTES --> CTRL
    CTRL --> USECASES
    USECASES --> PORTS
    PORTS -.->|Depend on abstraction| REPOS
    USECASES --> ENTITIES
    ENTITIES --> ERRORS
    USECASES --> EVENTS_DOMAIN
    CTRL --> SCHEMA
    USECASES --> LOGGER
    CONFIG --> REPOS
```

---

## 📝 Modelos de Datos

### Order (CommerceFlow)
```
Order {
  id: UUID (generado por constructor)
  status: OrderStatus (CREATED → PAYMENT_PENDING → PAID → FULFILLED)
  items: OrderItem[]
  createdAt: Date
  
  Methods:
  + create(items): Order
  + requestPayment(): void
  + confirmPayment(): void
  + fail(): void
  + fulfill(): void
  + getTotalAmount(): number
  + getStatus(): OrderStatus
}

OrderItem {
  productId: string
  quantity: number
  unitPrice: number
  subtotal: number (calculated)
}
```

### Process (SaaS Backend)
```
Process {
  id: UUID
  organizationId: UUID
  status: ProcessStatus (DRAFT → ACTIVE → COMPLETED → PAUSED)
  steps: ProcessStep[]
  
  Methods:
  + activate(): void
  + complete(): void
  + pause(): void
}

ProcessStep {
  id: UUID
  name: string
  order: number
  status: ExecutionStatus
}
```

### Execution (Workflow)
```
Execution {
  id: UUID
  processId: UUID
  status: ExecutionStatus (PENDING → RUNNING → COMPLETED → FAILED)
  currentStep: number
  steps: ExecutionStep[]
  
  Methods:
  + start(): void
  + completeStep(stepId): void
  + fail(): void
}
```

---

## 🔐 Seguridad & Auditoría

```mermaid
graph TB
    REQ["Incoming Request"]
    REQ -->|x-request-id| HEADER["Request Header"]
    HEADER --> CORR["CorrelationId"]
    
    AUTH["JWT Middleware"]
    CORR -->|Attach| AUTH
    
    AUTH -->|Extract| TOKEN["JWT Token<br/>sub: user_id<br/>tenantId: org_id<br/>role: employer|customer"]
    
    TOKEN -->|Validate| RBAC["RBAC Check<br/>(employer → admin access)"]
    
    RBAC -->|Approved| USECASE["Execute Use Case"]
    USECASE -->|Log| AUDIT["Audit Log<br/>action: CREATE_ORDER<br/>user: email<br/>resource: order_id<br/>correlationId"]
    
    USECASE -->|Publish| EVENTS["Events<br/>OrderCreated { orderId, totalAmount }"]
    EVENTS -->|Store| OUTBOX["Outbox Pattern<br/>(Garantizar entrega)"]
    
    OUTBOX -->|Async| EVENT_HANDLER["Event Subscribers<br/>SaasTicketSubscriber"]
    
    AUDIT -->|Persist| LOG_DB["Audit Store<br/>(PostgreSQL)"]
    LOG_DB -->|Query| DASHBOARD["Dashboard<br/>& Reports"]
```

---

## 📊 Diagrama de Componentes

```mermaid
graph TB
    subgraph "Client"
        BROWSER["Web Browser<br/>Storefront"]
    end
    
    subgraph "API Server (CommerceFlow)"
        NGINX["Nginx<br/>(Reverse Proxy)"]
        EXPRESS["Express App<br/>(Node.js)"]
        CACHE["Redis Cache<br/>(Sessions)"]
    end
    
    subgraph "Microservices"
        COMMERCE["CommerceFlow Service<br/>(Order Domain)"]
        SAAS["SaaS Scheduler<br/>(Process + Execution)"]
        AUTH_SVC["Auth Service<br/>(JWT)"]
    end
    
    subgraph "Data Layer"
        POSTGRES["PostgreSQL<br/>(Prisma ORM)"]
        QUEUE["Message Queue<br/>(RabbitMQ/Redis)"]
    end
    
    subgraph "External"
        STRIPE["Stripe API<br/>(Payments)"]
        SENDGRID["SendGrid<br/>(Email)"]
    end

    BROWSER -->|HTTPS| NGINX
    NGINX -->|Forward| EXPRESS
    EXPRESS -->|Auth| AUTH_SVC
    AUTH_SVC -->|Verify| CACHE
    
    EXPRESS -->|Route| COMMERCE
    EXPRESS -->|Route| SAAS
    
    COMMERCE -->|Read/Write| POSTGRES
    COMMERCE -->|Publish| QUEUE
    
    SAAS -->|Read/Write| POSTGRES
    SAAS -->|Consume| QUEUE
    
    STRIPE -.->|Webhook| COMMERCE
    COMMERCE -->|Email| SENDGRID
    SAAS -->|Notify| SENDGRID
```

---

## 🧪 Test Strategy

```
Frontend (Storefront Web)
├── Unit Tests (Utilities, formatCurrency, escapeHtml)
├── Integration Tests (Cart, Auth, Product Management)
└── E2E Tests (Full checkout flow)

Domain (CommerceFlow)
├── Entity Tests (Order lifecycle, state transitions)
├── Use Case Tests (CreateOrder, ConfirmPayment, FulfillOrder)
├── Event Tests (OrderCreated, OrderPaid, OrderFulfilled)
└── Repository Fakes (InMemoryOrderRepository)

Infrastructure (SaaS Backend)
├── Persistence Tests (Prisma repositories)
├── API Tests (ProcessController, routing)
├── Middleware Tests (Auth, logging, error handling)
└── Integration Tests (Order → Process flow)
```

---

## 📈 Flujo de Escalabilidad

```
Monolito (Actual)
    ↓
    Microservicios (Siguiente fase)
    ├── commerce-service (Orders)
    ├── process-service (Workflows)
    ├── auth-service (JWT)
    └── notification-service (Email/SMS)
    
    Distributed Tracing: Jaeger con correlationId
    Metrics: Prometheus + Grafana
    Logging: ELK Stack (JSON logs)
    API Gateway: Kong o Traefik
```

---

## 🎯 Checklist de Seguridad

- [x] JWT con algoritmo HS256
- [x] CORS configurado
- [x] Validación Zod en entrada
- [x] Correlation IDs en logs
- [x] Audit trail completo
- [ ] Rate limiting (pendiente)
- [ ] HTTPS/TLS en producción
- [ ] Secrets en variables de entorno
- [ ] SQL injection prevention (Prisma ORM)
- [ ] OWASP Top 10 checklist

---

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────┐
│   Cloud Provider (AWS/GCP/Azure)    │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │  CDN (CloudFront/Cloudflare)│   │
│  │  - Storefront static files  │   │
│  └───────────────┬─────────────┘   │
│                  │                 │
│  ┌───────────────▼─────────────┐   │
│  │   Load Balancer (ALB/NLB)   │   │
│  │   - TLS termination         │   │
│  └───────────────┬─────────────┘   │
│                  │                 │
│  ┌───────────────▼─────────────┐   │
│  │  ECS/K8s Cluster            │   │
│  │  ├─ API Pod (3 replicas)    │   │
│  │  ├─ Worker Pod (2 replicas) │   │
│  │  └─ Scheduler Pod (1 replica)   │
│  └───────────────┬─────────────┘   │
│                  │                 │
│  ┌───────────────┼─────────────┐   │
│  │               │             │   │
│  │  ┌────────────▼────┐   ┌──────┐│
│  │  │  RDS PostgreSQL │   │ Redis││
│  │  │  - Data         │   │Cache ││
│  │  └─────────────────┘   └──────┘│
│  │                                 │
│  └──────────────────────────────────┘
│                                     │
└─────────────────────────────────────┘

Logs → CloudWatch/Datadog
Metrics → Prometheus/CloudWatch
Traces → Jaeger/Datadog
Alerts → PagerDuty/Opsgenie
```
