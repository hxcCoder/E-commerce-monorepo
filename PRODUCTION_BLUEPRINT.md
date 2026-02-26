# Production Blueprint: CommerceFlow + SaaS Ticket Backend

Este documento es una guía de trabajo **senior** para construir una base segura, mantenible y escalable en este monorepo.

## 1) Objetivo de arquitectura

Construir un sistema donde:

- **CommerceFlow** gobierna el flujo de ventas (orden, pago, cumplimiento).
- **SaaS Ticket Backend** gobierna procesos internos y compliance (auditoría, validación, trazabilidad).
- Ambos se conectan por contratos explícitos, con eventos versionados y observabilidad fuerte.

Principio rector: **el dominio manda y la infraestructura obedece**.

## 2) Límites de contexto (Bounded Contexts)

### CommerceFlow (Ventas)
Responsabilidades:
- Crear órdenes.
- Solicitar confirmación de pago.
- Confirmar/rechazar pago.
- Cumplir orden según reglas de dominio.

No responsabilidades:
- Orquestar procesos internos de compliance.
- Resolver workflows administrativos complejos.

### SaaS Ticket Backend (Control operativo y cumplimiento)
Responsabilidades:
- Ejecutar procesos internos con reglas y estados.
- Trazabilidad/auditoría verificable.
- Evidencia para cumplimiento.

No responsabilidades:
- Calcular reglas comerciales de órdenes.
- Decidir lifecycle de ventas.

## 3) Contrato de integración recomendado

### 3.1 Evento canónico cruzado
Usar eventos de integración explícitos, por ejemplo:

- `commerce.order.created.v1`
- `commerce.order.payment_requested.v1`
- `commerce.order.paid.v1`
- `commerce.order.payment_failed.v1`
- `commerce.order.fulfilled.v1`

Campos base sugeridos:
- `eventId` (UUID)
- `eventName`
- `eventVersion`
- `occurredAt` (ISO-8601)
- `tenantId`
- `correlationId`
- `causationId`
- `payload` (tipado por evento)

### 3.2 Reglas no negociables de mensajería
- **Idempotencia** por `eventId`.
- **Outbox pattern** para publicar eventos solo tras commit local.
- **Reintentos con backoff** + dead-letter queue.
- **Consumer contracts versionados** (nunca romper `v1`; agregar `v2`).

### 3.3 Modo de comunicación
Recomendación por fases:
1. Fase 1: Async por cola/event bus + polling de estados críticos.
2. Fase 2: Saga/orquestación explícita para procesos multi-paso.

## 4) Modelo de datos y consistencia

### 4.1 Diseño de persistencia
- Cada contexto con su propia DB o esquema bien aislado.
- No compartir tablas entre contextos.
- Integración solo vía eventos/API.

### 4.2 Consistencia
- Local: transaccional fuerte.
- Entre contextos: **eventual consistency** con compensaciones.

### 4.3 Supabase (si lo usas)
- Habilitar **RLS por tenant** desde el día 1.
- Claves de servicio solo en backend, nunca en clientes.
- Policies explícitas para lectura/escritura por rol.
- Auditoría de cambios en entidades críticas (orders, payments, process runs).

## 5) Seguridad y cumplimiento (mínimo de producción)

### 5.1 Identidad y autorización
- JWT con `tenantId`, `role`, `sub`, `jti`, `iat`, `exp`.
- RBAC por acciones de dominio (no solo por endpoint).
- Rotación de secretos y expiración corta de tokens.

### 5.2 Protección de APIs
- Rate limiting por tenant y por IP.
- Idempotency-Key en endpoints de escritura críticos.
- Validación estricta de entrada con esquemas.

### 5.3 Evidencia y auditoría
- Toda acción crítica debe dejar:
  - quién (`actorId`)
  - cuándo (`timestamp`)
  - qué (`action`)
  - sobre qué (`entityId`, `tenantId`)
  - resultado (`success|failure`)
  - motivo/error

## 6) Observabilidad y operación

### 6.1 Logging estructurado
Formato JSON con campos mínimos:
- `level`, `service`, `env`, `tenantId`, `correlationId`, `eventId`, `message`, `errorCode`.

Regla: nunca loggear secretos ni PII sin mascarado.

### 6.2 Métricas mínimas
- Latencia p95/p99 por caso de uso.
- Tasa de error por endpoint y por evento.
- Retries, DLQ size, eventos procesados/min.
- Órdenes creadas vs pagadas vs fallidas.

### 6.3 Trazas distribuidas
- Propagar `correlationId` y `traceId` entre servicios.
- Instrumentación OpenTelemetry desde inicio.

## 7) Calidad de código y arquitectura

### 7.1 Reglas de diseño
- Caso de uso = una intención clara de negocio.
- Entidades ricas (reglas dentro del dominio).
- Infraestructura detrás de puertos/adaptadores.
- Prohibido mezclar lógica HTTP/DB dentro de entidades.

### 7.2 Pirámide de tests
- Unit tests de entidades y casos de uso.
- Contract tests entre publicador y consumidor de eventos.
- Integration tests para persistencia y colas.
- E2E para journeys críticos: create->pay->fulfill.

### 7.3 Definition of Done (DoD)
Toda feature crítica debe incluir:
- reglas de dominio claras,
- tests,
- logs estructurados,
- métricas,
- manejo de errores tipados,
- rollback/compensación definida.

## 8) Gestión de fallos reales (runbook base)

Para incidentes de producción:
1. Identificar `correlationId`.
2. Confirmar estado de orden/proceso en ambos servicios.
3. Revisar outbox/inbox/retries/DLQ.
4. Aplicar replay idempotente si corresponde.
5. Registrar postmortem con causa raíz y acción preventiva.

## 9) Roadmap sugerido (90 días)

### Días 1-30 (Base sólida)
- Definir contrato de eventos v1.
- Añadir outbox + idempotencia en consumidores.
- Estandarizar error model y códigos de dominio.
- Logging JSON y correlación extremo a extremo.

### Días 31-60 (Confiabilidad)
- Contract tests automatizados.
- DLQ + replay tool interno.
- Dashboards de negocio y técnicos.
- Hardening de auth/RBAC + RLS multi-tenant.

### Días 61-90 (Escala y operación)
- Sagas para flujos multi-contexto.
- SLOs y alertas accionables.
- Pruebas de carga sobre caminos críticos.
- Runbooks completos + game days.

## 10) Checklist de salida a producción

- [ ] Integración por eventos versionados e idempotentes.
- [ ] Outbox implementado en productores.
- [ ] Inbox/idempotency store en consumidores.
- [ ] Correlation IDs en logs/traces/eventos.
- [ ] Auditoría completa de acciones críticas.
- [ ] Alertas para errores, latencia y DLQ.
- [ ] Plan de rollback/replay documentado.
- [ ] Pruebas E2E de journeys críticos.
- [ ] Seguridad base: RBAC, rate limit, secretos.
- [ ] Revisión de costos y capacidad.

---

## Primeros pasos prácticos para ti (orden recomendado)

1. Congelar un **glosario de dominio compartido** (order, payment, process, compliance event).
2. Diseñar el **evento `order.paid.v1`** con contrato formal y tests de contrato.
3. Implementar **outbox** en el servicio que emite el evento.
4. Implementar consumidor idempotente en el otro servicio.
5. Añadir `correlationId` y logging JSON en ambos lados.
6. Ejecutar un flujo E2E controlado y guardar evidencia (logs + métricas + auditoría).

Si haces esto bien, ya estarás construyendo con mentalidad de producción real.


Checklist ejecutable de cierre V1: `V1_RELEASE_CHECKLIST.md`.


## 11) ¿Cómo saber si “conecta bien” entre ambos repos?

No se responde con intuición; se responde con **evidencia observable**.

### 11.1 Señales de integración sana
- Una orden creada en CommerceFlow dispara exactamente 1 evento esperado.
- El consumidor en SaaS Ticket procesa ese evento una sola vez (aunque llegue duplicado).
- Si el consumidor falla, hay retry y finalmente DLQ con trazabilidad.
- `correlationId` permite seguir el flujo completo en logs de ambos servicios.
- El estado final en ambos contextos es coherente (sin contradicciones).

### 11.2 Prueba manual mínima (happy path)
1. Crear orden de prueba.
2. Verificar evento `commerce.order.created.v1` publicado.
3. Verificar recepción en SaaS Ticket.
4. Simular pago aprobado.
5. Verificar `commerce.order.paid.v1` y transición final correcta.
6. Confirmar auditoría completa (actor, acción, timestamp, resultado).

### 11.3 Prueba manual de resiliencia (obligatoria)
1. Reenviar el mismo evento (`eventId` idéntico) y comprobar idempotencia.
2. Forzar fallo temporal del consumidor y verificar retries.
3. Forzar fallo permanente y verificar envío a DLQ.
4. Ejecutar replay controlado desde DLQ.
5. Confirmar que no se generan efectos dobles.

Si estas pruebas pasan con evidencia, **sí conecta bien para iniciar checklist de producción**.

## 12) Madurez profesional: cuándo “eres buen programador backend”

No depende de memorizar cada rincón, depende de **controlar el sistema bajo cambio y falla**.

### 12.1 Señales reales de madurez
- Diseñas con límites claros de dominio e integración.
- Detectas riesgos antes de lanzar (seguridad, idempotencia, consistencia).
- Cuando algo falla, llegas rápido a causa raíz con observabilidad.
- Tomas decisiones con trade-offs explícitos, no por moda.
- Tu código es mantenible por otros, no solo por ti.

### 12.2 ¿Debes conocer cada rincón al detalle?
No al 100%. Lo importante es:
- entender lo crítico profundamente,
- tener mapas/documentación del resto,
- poder diagnosticar rápido lo desconocido.

La excelencia backend no es “saber todo”; es **reducir incertidumbre operacional**.

### 12.3 ¿Es normal tener fallos?
Sí, totalmente normal. Lo profesional es:
- fallar pequeño,
- detectar rápido,
- recuperar sin corrupción de datos,
- aprender y cerrar la brecha para que no se repita.

### 12.4 Tu enfoque de “templo fuerte y sellado” (versión práctica)
Tradúcelo a controles concretos:
- Seguridad: RBAC, least privilege, secretos rotados, validación fuerte.
- Integridad: invariantes de dominio + idempotencia + transacciones.
- Resiliencia: retries, timeouts, circuit breakers, DLQ.
- Observabilidad: logs estructurados, métricas y trazas con correlación.
- Operación: runbooks, alertas accionables y postmortems sin culpa.

Si ejecutas esto de forma disciplinada, vas por camino de senior real.
