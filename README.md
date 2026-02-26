# EcomFlow - Sistema de E-Commerce y Automatización de Procesos

## 📋 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Arquitectura](#arquitectura)
3. [Requisitos Previos](#requisitos-previos)
4. [Instalación y Configuración](#instalación-y-configuración)
5. [Ejecución del Proyecto](#ejecución-del-proyecto)
6. [Suite de Tests](#suite-de-tests)
7. [Estructura del Proyecto](#estructura-del-proyecto)
8. [Guía de Desarrollo](#guía-de-desarrollo)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

## 📦 Descripción General

**EcomFlow** es un sistema de e-commerce moderno, escalable y completo con:

✅ **Gestión de Órdenes**: Entidad de orden con ciclo de vida completo (CREATED → PAYMENT_PENDING → PAID → FULFILLED)
✅ **Automatización de Procesos**: Motor de ejecución de procesos para automatizar workflows
✅ **Tienda Frontend**: Interfaz moderna para compra de productos y gestión de carrito
✅ **Sistema de Auditoría**: Logs estructurados con correlation IDs para trazabilidad
✅ **Seguridad**: JWT, validación con Zod, escapado de HTML, RBAC
✅ **Escalabilidad**: Arquitectura por capas (Dominio → Aplicación → Infraestructura)

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENTE (Frontend)                    │
│  HTML + CSS + JavaScript (Vanillla ES6+)                │
│  - Carrito de compra                                     │
│  - Panel de admin                                        │
│  - Autenticación                                         │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   API REST (Express)                     │
│  - Procesamiento de órdenes                             │
│  - Gestión de procesos                                  │
│  - Autenticación y autorización                         │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              DOMINIO (DDD - Lógica de Negocio)          │
│  - Entidades: Order, Process, Execution                 │
│  - Eventos de Dominio                                   │
│  - Use Cases (Aplicación)                               │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  PERSISTENCIA (Prisma)                   │
│  - PostgreSQL Database                                  │
│  - Migrations                                           │
│  - ORM Typesafe                                         │
└─────────────────────────────────────────────────────────┘
```

### Patrones de Diseño

- **Domain-Driven Design (DDD)**: Modelado del negocio en el centro
- **Clean Architecture**: Separación de responsabilidades en capas
- **Dependency Injection**: Testabilidad y flexibilidad
- **Event-Driven**: Eventos de dominio para comunicación desacoplada
- **Repository Pattern**: Abstracción de persistencia

---

## 🔧 Requisitos Previos

Asegurate de tener instalados:

```bash
# Verificar versiones
node --version        # v18+ recomendado
npm --version         # v9+ recomendado
```

**Requerimientos:**
- Node.js 18+
- npm 9+ o yarn
- Git
- PostgreSQL 13+ (para deployment)

---

## 📦 Instalación y Configuración

### 1. Clonar el Repositorio

```bash
cd ~/Desktop
git clone <repository-url>
cd E-commerce
```

### 2. Instalar Dependencias de CommerceFlow

```bash
cd CommerceFlow
npm install

# Verificar instalación
npm list
```

**Dependencias principales:**
- TypeScript
- Jest (testing)
- uuid (generación de IDs)

### 3. Instalar Dependencias del SaaS Backend

```bash
cd ../saas-ticket-backend
npm install

# Verificar instalación
npm list
```

**Dependencias principales:**
- Express
- Prisma (ORM)
- Winston (logging)
- jsonwebtoken (JWT)
- Zod (validación)

### 4. Configurar la Base de Datos (SaaS Backend)

```bash
cd saas-ticket-backend

# Crear archivo .env
cat > .env << EOF
DATABASE_URL="postgresql://user:password@localhost:5432/ecomflow"
JWT_SECRET="your-secret-key-here"
NODE_ENV="development"
LOG_LEVEL="debug"
EOF

# Ejecutar migraciones
npx prisma migrate dev

# Generar cliente Prisma
npx prisma generate
```

### 5. Configurar Frontend (Opcional)

```bash
cd ../storefront-web
npm install
```

---

## 🚀 Ejecución del Proyecto

### Modo Desarrollo - CommerceFlow

```bash
cd CommerceFlow

# En una terminal: Watch mode compilación
npm run dev

# En otra terminal: Ejecutar tests interactivos
npm test -- --watch
```

### Modo Desarrollo - SaaS Backend

```bash
cd saas-ticket-backend

# Iniciar servidor Express
npm run dev

# Esperado:
# Server running on http://localhost:3000
# Connected to database
```

### Modo Desarrollo - Frontend

```bash
cd storefront-web

# Opción 1: Servir con Live Server (VS Code)
# - Click derecho en index.html
# - "Open with Live Server"

# Opción 2: Servidor local Python
python -m http.server 8000
# Acceder: http://localhost:8000
```

---

## 🧪 Suite de Tests

### Ejecutar Todos los Tests

```bash
# CommerceFlow
cd CommerceFlow
npm test

# SaaS Backend
cd ../saas-ticket-backend
npm test

# Frontend (recomendado)
cd ../storefront-web
npm test
```

### Ejecutar Tests Específicos

```bash
# Solo tests de integración (CommerceFlow)
npm test Integration.test.ts

# Solo tests de controller (SaaS)
npm test ProcessController.integration.test.ts

# Con cobertura
npm test -- --coverage

# Modo watch (desarrollo)
npm test -- --watch

# Modo verbose (detalles)
npm test -- --verbose
```

### Resultados Esperados

```
Test Suites: 3 passed, 3 total
Tests:       80+ passed, 80+ total
Snapshots:   0 total
Time:        ~2s
Coverage:    Statements: 95%+ | Branches: 85%+ | Functions: 95%+ | Lines: 95%+
```

### Coverage Report

```bash
# Generar reporte HTML
npm test -- --coverage --collectCoverageFrom="src/**/*.ts"

# Abrir reporte
open coverage/lcov-report/index.html
```

---

## 📂 Estructura del Proyecto

```
E-commerce/
│
├── CommerceFlow/                       # Dominio de órdenes
│   ├── src/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   ├── order/
│   │   │   │   │   ├── Order.ts        # Entidad principal
│   │   │   │   │   ├── OrderItem.ts    # Artículo de orden
│   │   │   │   │   └── OrderStatus.ts  # Estados
│   │   │   │   ├── payment/
│   │   │   │   └── product/
│   │   │   ├── events/
│   │   │   │   ├── OrderCreated.ts
│   │   │   │   ├── OrderPaymentRequested.ts
│   │   │   │   ├── OrderPaid.ts
│   │   │   │   ├── OrderPaymentFailed.ts
│   │   │   │   └── OrderFulfilled.ts
│   │   │   └── errors/
│   │   ├── application/
│   │   │   └── use-cases/
│   │   │       ├── CreateOrder.ts
│   │   │       ├── RequestOrderPayment.ts
│   │   │       ├── ConfirmPayment.ts
│   │   │       └── FulfillOrder.ts
│   │   ├── infrastructure/
│   │   │   ├── repositories/
│   │   │   │   └── InMemoryOrderRepository.ts
│   │   │   └── event-bus/
│   │   │       └── InMemoryEventPublisher.ts
│   │   └── shared/
│   │       └── logger.ts               # Abstracción de logging
│   ├── __tests__/
│   │   └── Integration.test.ts         # Tests de flujo completo
│   ├── jest.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── saas-ticket-backend/                # Motor de procesos
│   ├── src/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   ├── process/
│   │   │   │   ├── execution/
│   │   │   │   ├── audit/
│   │   │   │   └── organization/
│   │   │   └── errors/
│   │   │       └── DomainError.ts
│   │   ├── application/
│   │   │   ├── use-cases/
│   │   │   │   ├── CreateAndActivateProcess.ts
│   │   │   │   ├── StartExecution.ts
│   │   │   │   └── CompleteExecutionStep.ts
│   │   │   └── ports/
│   │   ├── infrastructure/
│   │   │   ├── persistence/
│   │   │   │   └── prisma/
│   │   │   ├── config/
│   │   │   │   ├── container.ts        # Inyección de dependencias
│   │   │   │   ├── logger.ts
│   │   │   │   └── env.ts
│   │   │   └── services/
│   │   ├── interfaces/
│   │   │   └── http/
│   │   │       ├── ProcessController.ts
│   │   │       └── routes.ts
│   │   └── index.ts                    # Bootstrap Express
│   ├── prisma/
│   │   ├── schema.prisma               # Definición DB
│   │   └── migrations/
│   ├── __tests__/
│   │   └── ProcessController.integration.test.ts
│   ├── .env
│   ├── jest.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── storefront-web/                     # Frontend SPA
│   ├── index.html                      # Estructura HTML
│   ├── styles.css                      # Estilos modernos
│   ├── src/
│   │   ├── app.js                      # Lógica principal
│   │   ├── api.js                      # Cliente HTTP
│   │   ├── catalog.js                  # Gestión de catálogo
│   │   └── config.js                   # Configuración
│   ├── tests/
│   │   └── storefront-web.test.ts      # Tests end-to-end
│   └── package.json
│
├── PRODUCTION_BLUEPRINT.md             # Guía de producción
├── V1_RELEASE_CHECKLIST.md            # Checklist de release
├── ARCHITECTURE.md                     # Diagramas y documentación
├── TEST_EXECUTION.md                   # Guía de testing
└── README.md                           # Este archivo
```

---

## 👨‍💻 Guía de Desarrollo

### Flujo de Desarrollo Típico

#### 1. Crear una Nueva Use Case (en CommerceFlow)

```typescript
// src/domain/application/use-cases/MyNewUseCase.ts
import { Order } from '../../entities/order/Order';
import { OrderRepository } from '../../ports/OrderRepository';
import { EventPublisher } from '../../ports/EventPublisher';
import { Logger } from '../../shared/logger';

export class MyNewUseCase {
  constructor(
    private repository: OrderRepository,
    private eventPublisher: EventPublisher,
    private logger: Logger
  ) {}

  async execute(orderId: string): Promise<Order> {
    this.logger.info('MyNewUseCase started', { orderId });
    
    const order = await this.repository.findById(orderId);
    if (!order) throw new Error('Order not found');
    
    // Lógica de negocio
    const updatedOrder = order.withMyOperation();
    
    await this.repository.save(updatedOrder);
    await this.eventPublisher.publish(new MyEvent(orderId));
    
    this.logger.info('MyNewUseCase finished', { orderId });
    return updatedOrder;
  }
}
```

#### 2. Escribir Tests

```typescript
// src/domain/application/use-cases/__tests__/MyNewUseCase.test.ts
describe('MyNewUseCase', () => {
  let useCase: MyNewUseCase;
  let repository: OrderRepository;
  let eventPublisher: EventPublisher;
  let logger: Logger;

  beforeEach(() => {
    repository = new InMemoryOrderRepository();
    eventPublisher = new InMemoryEventPublisher();
    logger = console as Logger;
    useCase = new MyNewUseCase(repository, eventPublisher, logger);
  });

  it('should update order successfully', async () => {
    const order = Order.create([{ productId: 'p1', quantity: 1 }]);
    await repository.save(order);

    const result = await useCase.execute(order.id);

    expect(result).toBeDefined();
    expect(repository.saved).toContain(order);
  });
});
```

#### 3. Integración en API (SaaS Backend)

```typescript
// src/interfaces/http/MyController.ts
import { Router, Request, Response } from 'express';
import { MyNewUseCase } from '../../application/use-cases/MyNewUseCase';

export function createMyRoutes(useCase: MyNewUseCase) {
  const router = Router();

  router.post('/my-operation/:orderId', async (req, res) => {
    try {
      const { orderId } = req.params;
      req.logger.info('POST /my-operation', { orderId });

      const result = await useCase.execute(orderId);
      
      res.status(200).json(result);
    } catch (error) {
      req.logger.error('Error in POST /my-operation', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}
```

### Convenciones de Código

```typescript
// ✅ BIEN
class CreateOrder {
  constructor(
    private repository: OrderRepository,
    private eventPublisher: EventPublisher,
    private logger: Logger
  ) {}
}

// ❌ MAL
class CreateOrder {
  repository: any;
  eventPublisher: any;
  
  execute() {
    console.log('Creating order'); // No usar console directamente
  }
}
```

### Manejo de Errores

```typescript
// Crear errores específicos del dominio
class OrderNotFoundError extends DomainError {
  constructor(orderId: string) {
    super(`Order ${orderId} not found`, 'ORDER_NOT_FOUND');
  }
}

// Usar en lógica
if (!order) {
  throw new OrderNotFoundError(orderId);
}
```

---

## 🚢 Deployment

### Deploy a Heroku

```bash
# 1. Login
heroku login

# 2. Crear app
heroku create ecomflow-api

# 3. Configurar variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=<tu-secret>
heroku config:set DATABASE_URL=<postgresql-url>

# 4. Push al repositorio
git push heroku main

# 5. Ejecutar migraciones
heroku run npx prisma migrate deploy

# 6. Ver logs
heroku logs --tail
```

### Deploy a AWS EC2

```bash
# 1. SSH en instancia
ssh -i key.pem ec2-user@<ip>

# 2. Instalar Node
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# 3. Clonar repo y setup
git clone <repo>
cd E-commerce/saas-ticket-backend
npm install
npm run build

# 4. PM2 para proceso persistente
npm install -g pm2
pm2 start npm --name "ecomflow-api" -- start
pm2 startup
pm2 save
```

### Variables de Entorno de Producción

```env
# .env.production
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@prod-db:5432/ecomflow
JWT_SECRET=<long-random-string>
LOG_LEVEL=warn
CORS_ORIGIN=https://yourdomain.com
```

---

## 🔍 Troubleshooting

### Error: "Cannot find module 'ts-jest'"

```bash
npm install --save-dev ts-jest @types/jest jest
npm test
```

### Error: "Port 3000 is already in use"

```bash
# Encontrar qué está usando el puerto
lsof -i :3000

# Matar proceso
kill -9 <PID>

# O usar port diferente
PORT=3001 npm run dev
```

### Error: "Database connection refused"

```bash
# Verificar conexión PostgreSQL
psql -h localhost -U user -d ecomflow

# Checar DATABASE_URL
echo $DATABASE_URL

# Reintentar migraciones
npx prisma migrate reset --force
```

### Tests fallan aleatoriamente

```bash
# Aumentar timeout
jest.setTimeout(10000);

# Ejecutar secuencialmente
npm test -- --runInBand

# Limpiar antes
npm test -- --clearCache
```

### Frontend no se conecta a API

```javascript
// Verificar URL en app.js
const API_BASE = 'http://localhost:3000/api';

// En development:
const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://api.yourdomain.com'
  : 'http://localhost:3000/api';
```

---

## 📚 Recursos Adicionales

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Diagramas y documentación de arquitectura
- [TEST_EXECUTION.md](./TEST_EXECUTION.md) - Guía completa de testing
- [PRODUCTION_BLUEPRINT.md](./PRODUCTION_BLUEPRINT.md) - Checklist de producción
- [V1_RELEASE_CHECKLIST.md](./V1_RELEASE_CHECKLIST.md) - Items de release v1

---

## 📞 Soporte

Para preguntas o issues:

1. Revisar [Troubleshooting](#troubleshooting)
2. Revisar documentación en `/docs`
3. Revisar tests para ejemplos de uso
4. Abrir issue en repositorio

---

## 📄 Licencia

Este proyecto está bajo licencia MIT. Ver [LICENCE](./saas-ticket-backend/LICENCE) para detalles.

---

## ✅ Checklist: Sistema Listo para Producción

- [x] Arquitectura escalable (DDD + Clean Architecture)
- [x] Logging estructurado con correlationIds
- [x] Tests completos (80+ tests)
- [x] Validación de entrada (Zod)
- [x] Seguridad (JWT, RBAC, XSS prevention)
- [x] Manejo de errores tipificado
- [x] Frontend profesional con UI/UX moderna
- [x] Documentación completa
- [x] Migrations de base de datos
- [x] CI/CD ready

🎉 **¡Sistema listo para ir a producción!**
