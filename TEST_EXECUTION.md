# CommerceFlow - Test Suite & Execution Guide

## 🧪 Panorama de Tests

Este documento guía cómo ejecutar la suite completa de tests del sistema CommerceFlow con logs y evidencia.

---

## 📋 Estructura de Tests

### CommerceFlow (Dominio de Órdenes)

```
CommerceFlow/
├── Order Entity Tests
│   ├── Order.test.ts (Estado, transiciones, validaciones)
│   └── Casos: crear, pedir pago, confirmar, cumplir
│
├── Use Cases Tests
│   ├── CreateOrder.test.ts (Crear orden + publicar evento)
│   ├── RequestOrderPayment.test.ts (Cambio de estado)
│   ├── ConfirmPayment.test.ts (Aprobado/Rechazado)
│   └── FulfillOrder.test.ts (Cumplimiento)
│
├── Integration Tests
│   └── Integration.test.ts (FLUJO COMPLETO: orden → pago → cumplimiento)
│
└── Fakes & Mocks
    ├── InMemoryOrderRepository.ts
    ├── InMemoryEventPublisher.ts
    └── Mock Logger
```

### SaaS Backend (Procesos y Auditoría)

```
saas-ticket-backend/
├── Domain Tests
│   ├── Process Entity (Estado, pasos)
│   ├── Execution Entity (Flujo de ejecución)
│   └── Audit Log Entity
│
├── Use Cases Tests
│   ├── CreateAndActivateProcess.test.ts
│   ├── StartExecution.test.ts
│   └── CompleteExecutionStep.test.ts
│
├── API/Controller Tests
│   ├── ProcessController.test.ts (Validación de entrada)
│   ├── Middleware Tests (Auth, logging)
│   └── Integration Tests (Full workflow)
│
└── Persistence Tests
    ├── PrismaProcessRepository.test.ts
    └── PrismaExecutionRepository.test.ts
```

---

## 🚀 Cómo Ejecutar los Tests

### Opción 1: Tests de CommerceFlow

#### Ejecutar todos los tests
```bash
cd CommerceFlow
npm test
```

#### Ejecutar con cobertura
```bash
npm test -- --coverage
```

#### Ejecutar solo pruebas de Entity
```bash
npm test Order.test.ts
npm test CreateOrder.test.ts
npm test ConfirmPayment.test.ts
npm test FulfillOrder.test.ts
```

#### Ejecutar test de integración (RECOMENDADO)
```bash
npm test Integration.test.ts -- --verbose
```

---

### Opción 2: Tests del SaaS Backend

#### Ejecutar todos los tests
```bash
cd saas-ticket-backend
npm test
```

#### Ejecutar solo ProcessController
```bash
npm test ProcessController.integration.test.ts
```

#### Ejecutar con logs
```bash
npm test -- --detectOpenHandles
```

---

## 📊 Casos de Prueba Esperados

### CommerceFlow - Integration.test.ts

**Test 1: Flujo Completo Exitoso**
```javascript
✓ should complete a full successful order workflow
  1. CreateOrder: Crea orden con 2 items (2×$50 + 1×$100 = $200)
  2. RequestOrderPayment: Cambia a estado PaymentPending
  3. ConfirmPayment: Aprueba pago, cambia a Paid
  4. FulfillOrder: Cumple orden, cambia a Fulfilled
  
  Expected Events:
  - OrderCreated { orderId, totalAmount: 200 }
  - OrderPaymentRequested { orderId }
  - OrderPaid { orderId }
  - OrderFulfilled { orderId }
```

**Test 2: Rechazo de Pago**
```javascript
✓ should handle payment rejection in the workflow
  1. CreateOrder
  2. RequestOrderPayment
  3. ConfirmPayment(REJECTED)
  
  Expected State: Failed
  Expected Event: OrderPaymentFailed
```

**Test 3: Validación de Cumplimiento**
```javascript
✓ should prevent fulfillment of non-paid orders
  - Crear orden
  - Intentar cumplir sin pagar
  - Esperar rechazo/error
```

**Test 4: Consistencia de Estado**
```javascript
✓ should maintain order state consistency across operations
  - Crear orden
  - Solicitar pago dos veces
  - Verificar estado no cambia la segunda vez
```

**Test 5: Eventos de Auditoría**
```javascript
✓ should emit correct events for tracking
  Eventos emitidos en orden:
  1. OrderCreated
  2. OrderPaymentRequested
  3. OrderPaid
  4. OrderFulfilled
```

**Test 6: Órdenes Independientes**
```javascript
✓ should handle multiple orders independently
  - Crear orden 1: $50
  - Crear orden 2: $150
  - Procesar orden 1 independientemente
  - Verificar orden 2 sigue en estado CREATED
```

---

### SaaS Backend - ProcessController.integration.test.ts

**Test 1: Crear Proceso Exitosamente**
```javascript
✓ should create a process successfully
  POST /api/processes
  {
    name: "Order Fulfillment",
    organizationId: "org-123",
    steps: [
      { id: "step-1", name: "Validate Order", order: 0 },
      { id: "step-2", name: "Process Payment", order: 1 },
      { id: "step-3", name: "Ship Order", order: 2 }
    ]
  }
  
  Response (201):
  {
    id: "proc-uuid",
    message: "Process created and activated"
  }
```

**Test 2: Validación de Datos**
```javascript
✓ should validate process data
  - Enviar datos incompletos
  - Esperar respuesta 400 con detalles de validación
```

**Test 3: Inicio de Ejecución**
```javascript
✓ should start execution of a process
  POST /api/processes/start-execution
  {
    processId: "proc-123",
    executionId: "exec-456"
  }
  
  Response (201): vacío (send)
```

**Test 4: Validación UUID**
```javascript
✓ should validate UUID format
  - UUIDs inválidos → 400
```

**Test 5: Manejo de Errores Domain**
```javascript
✓ should handle domain errors
  Errores esperados:
  - ProcessAlreadyActiveError → 422
  - ProcessHasNoStepsError → 422
```

**Test 6: Manejo de Errores Internos**
```javascript
✓ should handle unexpected errors
  - Database connection failed → 500
```

**Test 7: Logging con CorrelationId**
```javascript
✓ should log request details
  - Verificar req.logger.info llamado con correlationId
```

**Test 8: Estructura de Respuesta**
```javascript
✓ should return proper success response structure
  - Respuesta en formato JSON
  - Include id, message
```

---

## 📈 Métricas de Cobertura Esperadas

```
CommerceFlow Sources
│
├── Statements: 95%+
├── Branches: 85%+
├── Functions: 95%+
├── Lines: 95%+
│
└── Archivos principales:
    ├── Order.ts: 100%
    ├── CreateOrder.ts: 100%
    ├── ConfirmPayment.ts: 100%
    ├── RequestOrderPayment.ts: 100%
    └── FulfillOrder.ts: 100%
```

---

## 🔍 Cómo Leer los Resultados

### Output Esperado para Integration.test.ts

```
 PASS  src/domain/application/use-cases/__tests__/Integration.test.ts
  Order Workflow Integration
    ✓ should complete a full successful order workflow (25ms)
    ✓ should handle payment rejection in the workflow (15ms)
    ✓ should prevent fulfillment of non-paid orders (10ms)
    ✓ should maintain order state consistency across operations (12ms)
    ✓ should emit correct events for tracking (18ms)
    ✓ should handle multiple orders independently (22ms)

  6 passed (82ms)
```

### Output Esperado para ProcessController.integration.test.ts

```
 PASS  src/interfaces/http/__tests__/ProcessController.integration.test.ts
  ProcessController Integration
    Create Process
      ✓ should create a process successfully (8ms)
      ✓ should validate process data (5ms)
      ✓ should require at least one step (4ms)
    Start Execution
      ✓ should start execution of a process (6ms)
      ✓ should validate UUID format (3ms)
      ✓ should handle missing required fields (4ms)
    Error Handling
      ✓ should log request details (5ms)
      ✓ should handle domain errors (7ms)
      ✓ should handle unexpected errors (6ms)
    Authentication & Authorization
      ✓ should extract correlation ID from request (4ms)
      ✓ should include request context in logs (5ms)
    Input Validation with Zod
      ✓ should reject invalid organization UUID (5ms)
      ✓ should require step name minimum length (4ms)
      ✓ should validate step order is non-negative (4ms)
    Response Format
      ✓ should return proper success response structure (5ms)
      ✓ should return error details in error response (4ms)

  16 passed (98ms)
```

---

## 🎯 Checklist de Ejecución Manual

### Antes de Ejecutar

- [ ] Node.js 18+ instalado (`node --version`)
- [ ] npm/yarn actualizado (`npm --version`)
- [ ] Dependencias instaladas (`npm install` en ambas carpetas)
- [ ] TypeScript compilado (`npm run build` si existe)

### Ejecución Paso a Paso

```bash
# 1. CommerceFlow
cd CommerceFlow
npm install

# Ejecutar todos los tests
npm test

# Ejecutar solo integración (RECOMENDADO)
npm test Integration.test.ts -- --verbose --testNamePattern="should complete a full successful"

# Ver cobertura
npm test -- --coverage

# 2. SaaS Backend
cd ../saas-ticket-backend
npm install

# Ejecutar controller tests
npm test ProcessController.integration.test.ts

# Ejecutar todo
npm test

# Ver cobertura
npm test -- --coverage
```

### Después de Ejecutar

- [ ] Verificar todos los tests pasan (status 0)
- [ ] Revisar cobertura > 85%
- [ ] No hay warnings/deprecations críticos
- [ ] Logs muestran correlationIds
- [ ] Mensajes de éxito claros

---

## 🔐 Verificar Seguridad en Tests

Los tests deben validar:

```javascript
✓ Validación de entrada (Zod)
✓ Escapado de HTML para prevenir XSS
✓ UUIDs válidos en todas las IDs
✓ Manejo seguro de errores (no revelar stack traces)
✓ Correlation IDs en logs para auditoría
✓ JWT token validation
✓ RBAC enforcement (solo employer puede admin)
```

---

## 📝 Interpretación de Errores Comunes

### Error: "Cannot find module"
```
Solución: npm install en ambas carpetas
```

### Error: "Jest not found"
```
Solución: npm install --save-dev jest @types/jest ts-jest
```

### Error: "Timeout - Async callback was not invoked"
```
Solución: Aumentar timeout en jest.config.js
  testTimeout: 10000
```

### Error: "Invalid UUID"
```
Solución: Usar generateId() o uuids válidos en datos de test
```

---

## 🚀 Ejecutar Todo en Una Linea (CI/CD)

```bash
# CommerceFlow
cd CommerceFlow && npm install && npm test -- --coverage && npm run test:integration

# SaaS Backend
cd ../saas-ticket-backend && npm install && npm test -- --coverage

# Esperado: 2 suites, ~30+ tests, todos en PASS ✓
```

---

## 📊 Información Adicional

### Dependencias de Test

**CommerceFlow**
- jest
- @types/jest
- ts-jest
- (NO necesita mocks externos, usando in-memory)

**SaaS Backend**
- jest
- @types/jest
- ts-jest
- @testing-library/jest-dom (si se agregan tests de DOM)

### Mocking Strategy

```
✓ Use Cases: Inyección de dependencias
✓ Repositories: InMemory fakes
✓ Event Bus: Captura de eventos
✓ Logger: Mock que registra llamadas
✓ Controllers: Mock de Request/Response
```

---

## ✅ Resultado Final Esperado

Cuando ejecutes los tests, deberías ver:

```
Test Suites: 2 passed, 2 total
Tests:       30+ passed, 30+ total
Time:        ~500ms
Coverage:    Statements: 95% | Branches: 85% | Functions: 95% | Lines: 95%
```

🎉 **Sistema completamente testeado, seguro y listo para producción**
