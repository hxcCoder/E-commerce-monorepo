# Sistema de Tickets / Procesos – Descripción Técnica
## Propósito del sistema

*Este sistema no es solo un “ticketing”, es un motor de procesos ejecutables orientado a SaaS.*

Su objetivo es:

- Definir procesos compuestos por pasos

- Activarlos de forma controlada

- Ejecutar esos pasos de manera trazable

- Registrar auditoría y eventos

- Integrarse con sistemas externos (suscripciones, pagos, notificaciones)

Por diseño, el sistema no depende del dominio “tickets”:
*tickets, ventas, workflows, automatizaciones o pedidos son casos de uso del mismo motor.*

## Arquitectura general

El sistema sigue Clean Architecture + DDD ligero, con separación estricta:

```text
Interfaces (HTTP / API)
↓
Application (Use Cases)
↓
Domain (Reglas puras)
↓
Infrastructure (DB, servicios externos)
```

Esto permite:

- Reutilizar el core en otros productos

- Cambiar infraestructura sin tocar reglas

- Testear lógica sin base de datos

- Integrar el motor en sistemas grandes sin acoplarlo

## Núcleo del dominio (lo más importante)

# Entidades principales

*Process*:

- Representa un proceso ejecutable (ej: flujo de ticket, orden de venta, onboarding).

Responsabilidades:

- Mantener su estado (CREATED, ACTIVE, ARCHIVED)

- Validar transiciones

- Contener pasos (ProcessStep)

- Emitir eventos de dominio (creado, activado, archivado)

- El proceso no sabe nada de HTTP, DB ni servicios externos.

*Execution*

- Representa una ejecución concreta de un proceso.

Ejemplo:

*Proceso*: “Atención de ticket”

*Execution*: “Ticket #8342 iniciado por cliente X”

Responsabilidades:

- -Avanzar pasos

- Mantener estado de ejecución

- Emitir eventos (ExecutionStarted, ExecutionStepCompleted, ExecutionCompleted)

- Validar reglas de avance

- AuditLog

*Entidad transversal para:*

- Trazabilidad

- Debug

- Cumplimiento

- Soporte

Permite reconstruir qué pasó, cuándo y por qué, algo crítico en SaaS reales.

*Casos de uso (Application Layer)*

- Aquí vive la orquestación, no la lógica de negocio pura.

- CreateAndActivateProcess

- Crea un proceso

- Valida consistencia

Lo activa en una única operación

- Emite eventos

Este caso de uso es atómico y usa UnitOfWork.

*StartExecution*

- Verifica que el proceso esté activo

- Crea una ejecución

- Marca el estado inicial

- Publica evento de inicio

*Ideal para:*

- inicio de ticket

- inicio de pedido

- inicio de workflow

*CompleteExecutionStep*

Marca un paso como completado

- Valida orden y estado

- Avanza la ejecución

- Registra auditoría

- Emite eventos

Este es el punto más crítico del sistema:
controla el avance correcto del proceso.

## Puertos (contratos)

Los ports definen qué necesita el sistema, no cómo se implementa.

Ejemplos:

- *ProcessRepository*

- *ExecutionRepository*

- *OutboxRepository*

- *SubscriptionService*

- *UnitOfWork*

Esto permite:

- Usar Prisma hoy

- Cambiar a otro ORM mañana

- Simular todo en tests

- Integrar el sistema en otro backend sin reescribir dominio

## Infraestructura (implementaciones reales)
*Persistencia (Prisma)*

Las clases Prisma*Repository:

- Implementan los puertos

- Traducen entidades de dominio a DB

- No contienen reglas de negocio

- El dominio nunca importa Prisma.

*UnitOfWork*

Garantiza:

- Transacciones consistentes

- Escritura de dominio + outbox + auditoría

- Seguridad ante fallos parciales

Esto es clave para sistemas grandes.

*SubscriptionService*

Abstracción para:

- planes

- límites

- permisos

En un ecommerce real aquí irían:

- verificación de plan

- número de tickets

- features habilitadas

## Interfaces HTTP

*La capa HTTP:*

- Valida entrada (schemas)

- Traduce request → use case

- Traduce resultado → response

- Maneja auth

*No contiene lógica de negocio.*

Esto permite:

- Reusar el sistema vía REST, GraphQL, workers, colas, etc.

- Integrarlo en un sistema mayor sin romper nada

## Cómo encaja en un sistema grande (ecommerce / SaaS)
Ejemplo real: Ecommerce

*Process:* “Gestión de pedido”

*Execution:* Pedido #1234

Steps:

1- Pago recibido

2- Preparación

3- Envío

4- Entrega

5- Postventa / ticket

El sistema no cambia.
Solo cambian:

- los pasos

- los eventos

- las integraciones externas

- Tickets de soporte

- Un ticket es una Execution

- El flujo de atención es un Process

- IA / agentes externos completan pasos

*Auditoría queda registrada*

## Decisión clave (muy importante)

*Este sistema no es un microservicio aislado, es un core reusable.*

Cuando lo incrustes en un sistema mayor:

- *NO mezcles dominio con ventas*

- *NO metas lógica de pagos aquí*

- *SÍ usa eventos para comunicarte con otros módulos*

- *SÍ mantenlo como motor central*

## Qué haría yo como tu “senior”

- Mantener este core intocable

- Crear un módulo sales o commerce encima

- Orquestar desde ahí los procesos

- Usar eventos para integración

- Documentar casos reales (pedido, ticket, onboarding