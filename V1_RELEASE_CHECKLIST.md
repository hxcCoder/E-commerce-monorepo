# V1 Release Checklist (CommerceFlow + SaaS Ticket Backend)

Checklist final para cerrar V1 con foco en estabilidad, seguridad y operación real.

## 0) Estado de rama y control de cambios
- [ ] Rama de trabajo actualizada con `main`.
- [ ] PR abierto con diff revisable (sin artefactos generados innecesarios).
- [ ] Commits con mensajes claros (`feat/fix/test/chore`).

## 1) Calidad mínima de código (gates obligatorios)
- [ ] `npm test --prefix CommerceFlow` en verde.
- [ ] `npm test --prefix saas-ticket-backend` en verde.
- [ ] `npm run build --prefix saas-ticket-backend` en verde.
- [ ] Sin errores de TypeScript ni tests flaky.

## 2) Configuración de entorno (Supabase-ready)
- [ ] `.env` basado en `saas-ticket-backend/.env.example`.
- [ ] `DATABASE_URL` de Supabase con `sslmode=require`.
- [ ] `JWT_SECRET` robusto (>=32 chars), rotado y fuera de cliente.
- [ ] `CORS_ORIGIN` configurado con dominios reales del front.
- [ ] `ENABLE_AUTH=true` en producción.

## 3) Seguridad backend
- [ ] Middleware JWT activo en rutas críticas.
- [ ] Rechazo correcto de requests sin token (401).
- [ ] Claims mínimas validadas (`sub` + issuer/audience si aplica).
- [ ] Logs sin secretos ni datos sensibles sin mascarar.

## 4) Base de datos y Prisma
- [ ] `prisma generate` ejecutado en entorno objetivo.
- [ ] Migraciones aplicadas en DB real antes del despliegue.
- [ ] Verificación de conectividad real a Supabase.
- [ ] Tests de integración con `DATABASE_URL` real en staging.

## 5) Integración backend ↔ front (contract first)
- [ ] Contrato de endpoints congelado (payload/errores/códigos).
- [ ] Front maneja 401, 422, 500 de forma explícita.
- [ ] Front propaga/visualiza `x-request-id` para soporte.
- [ ] Flujos mínimos validados:
  - [ ] Crear proceso
  - [ ] Iniciar ejecución

## 6) Observabilidad y operación
- [ ] Logs estructurados activos en backend.
- [ ] Correlación por `requestId` funcionando extremo a extremo.
- [ ] Health check (`/health`) operativo.
- [ ] Alertas mínimas definidas (errores 5xx, latencia alta, caída DB).

## 7) Ensayo de fallo controlado
- [ ] Simular token inválido (esperar 401).
- [ ] Simular caída de DB (esperar error controlado y log útil).
- [ ] Confirmar recuperación al restablecer servicios.

## 8) Go/No-Go V1
- [ ] Todos los gates de secciones 1-7 en verde.
- [ ] Riesgos abiertos documentados con owner y fecha.
- [ ] Decisión final registrada: **GO** / **NO-GO**.

---

## Comandos de validación rápida (copiar/pegar)
```bash
npm test --prefix CommerceFlow
npm test --prefix saas-ticket-backend
npm run build --prefix saas-ticket-backend
```

## Nota
No subir artefactos generados locales de Prisma al repo, salvo decisión explícita del equipo.
