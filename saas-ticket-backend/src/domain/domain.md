# DOMAIN — Compliance & Process Automation SaaS

Este documento define el **dominio del negocio**.
Aquí viven las **reglas**, **entidades**, **estados** y **casos de uso**.
Si el código contradice este documento, **el código está mal**.

---

## 1. North Star

### Problema que se resuelve
Las empresas no tienen control claro sobre sus procesos internos, no pueden auditar acciones ni demostrar cumplimiento operativo.

### Usuario objetivo
Administrador operativo de pequeñas y medianas empresas.

### Resultado esperado
Procesos claros, ejecutables, auditables y completamente trazables.

### Métrica principal
Procesos ejecutados correctamente por mes.

### Qué NO es este producto
- No es un ERP
- No es un CRM
- No es un gestor de tareas personal
- No es un n8n visual (eso podrá venir después)

---

## 2. Entidades del Dominio

### Organización
Representa una empresa (tenant) dentro del sistema.

Responsabilidades:
- Controlar su estado operativo
- Asociar usuarios, procesos y suscripción

---

### Usuario
Persona que interactúa con el sistema dentro de una organización.

Responsabilidades:
- Ejecutar acciones según su rol
- Ser trazable en auditoría
    
---

### Rol
Define permisos dentro de una organización.

Ejemplos:
- ADMIN
- PROCESS_MANAGER
- USER

---

### Proceso (Aggregate Root)
Define un proceso empresarial ejecutable y auditable.

Responsabilidades:
- Mantener consistencia de sus pasos
- Controlar su ciclo de vida
- Validar reglas antes de activarse o ejecutarse

---

### Paso
Unidad interna de un proceso.
No existe fuera de un proceso.

---

### Ejecución
Instancia concreta de la ejecución de un proceso.

Responsabilidades:
- Mantener estado de ejecución
- Generar eventos y auditoría

---

### Evento
Hecho relevante ocurrido durante una ejecución o acción del sistema.

---

### Auditoría
Registro inmutable de acciones relevantes del sistema.

---

### Suscripción
Define el plan activo de una organización.

---

### Plan
Define límites operativos (procesos activos, ejecuciones, usuarios, etc.).

---

## 3. Estados del Dominio

### Organización
- activa
- suspendida

---

### Proceso
- borrador
- activo
- pausado
- archivado

---

### Ejecución
- pendiente
- en_progreso
- completada
- fallida

---

### Suscripción
- trial
- activa
- vencida
- cancelada

---

## 4. Reglas de Negocio (Invariantes)

Estas reglas **no dependen del framework ni de la base de datos**.

- Una organización suspendida no puede ejecutar procesos
- Un proceso en borrador no puede ejecutarse
- Un proceso solo puede activarse desde estado borrador
- Un usuario sin rol adecuado no puede modificar procesos
- Toda ejecución genera auditoría
- Un plan limita la cantidad de procesos activos
- Un error crítico marca la ejecución como fallida
- La auditoría es inmutable

---

## 5. Casos de Uso — Checklist Profesional

Cada caso de uso **debe responder estas preguntas antes de implementarse**.

---

### Crear Proceso

**Entidad que cambia:**  
Proceso

**Estado que cambia:**  
inexistente → borrador

**Reglas que se validan:**  
- Organización activa
- Nombre válido

**Quién puede hacerlo:**  
Usuario con rol autorizado

**Evento que se registra:**  
ProcessCreated

---

### Definir Pasos

**Entidad que cambia:**  
Proceso / Pasos

**Estado que cambia:**  
Proceso permanece en borrador

**Reglas que se validan:**  
- Proceso en borrador
- Pasos con orden válido
- Pasos no vacíos

**Quién puede hacerlo:**  
Usuario con rol autorizado

**Evento que se registra:**  
ProcessStepsDefined

---

### Activar Proceso

**Entidad que cambia:**  
Proceso

**Estado que cambia:**  
borrador → activo

**Reglas que se validan:**  
- Proceso en borrador
- Al menos un paso
- Pasos válidos
- Organización activa
- Plan permite procesos activos
- No puede activarse dos veces

**Quién puede hacerlo:**  
Usuario con rol autorizado

**Evento que se registra:**  
ProcessActivated

---

### Ejecutar Proceso

**Entidad que cambia:**  
Ejecución

**Estado que cambia:**  
pendiente → en_progreso

**Reglas que se validan:**  
- Proceso activo
- Organización activa
- Usuario autorizado
- Límite del plan no excedido

**Quién puede hacerlo:**  
Usuario autorizado

**Evento que se registra:**  
ProcessExecutionStarted

---

### Generar Auditoría

**Entidad que cambia:**  
Auditoría

**Estado que cambia:**  
inexistente → registrada

**Reglas que se validan:**  
- Toda acción relevante genera auditoría
- Auditoría inmutable

**Quién puede hacerlo:**  
Sistema

**Evento que se registra:**  
AuditLogCreated

---
Z
## 6. Principios de Diseño del Dominio

- El dominio no conoce frameworks
- No existen setters de estado públicos
- Las reglas viven dentro de las entidades
- El dominio se protege de usos inválidos
- Todo cambio relevante genera un evento

---
---
## 7. Flujo de Implementación Técnica (Auditabilidad)

Para garantizar que el sistema sea auditable y robusto, cada acción sigue este flujo de capas:

1. **Interfaces:** Recibe el request y valida el esquema (Zod).
2. **Application (Use Case):** Orquestra la lógica. Llama al `SubscriptionService` para validar límites antes de permitir cambios.
3. **Domain (Entity):** Ejecuta la lógica de transición de estados (ej. `activate()`). Si las reglas fallan, lanza una `DomainError`.
4. **Infrastructure (Repository):** Persiste el estado final usando Prisma en una transacción atómica que incluye la tabla `Outbox`.

## Gestión de Identidad
Los IDs de las entidades (Process y ProcessStep) son generados por el cliente o la capa de aplicación antes de la persistencia. Esto permite:

Rastrear la entidad a través de logs antes de que llegue a la base de datos.

Evitar colisiones y asegurar la idempotencia en las operaciones de creación.

Mantener la pureza del dominio al no depender de IDs autoincrementales de la base de datos.