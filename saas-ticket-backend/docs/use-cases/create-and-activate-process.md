# Create and Activate Process

## Objetivo
Permitir que un usuario autorizado cree un proceso estructurado dentro de una organización
y lo active correctamente, asegurando el cumplimiento de todas las reglas de dominio
antes de que pueda ser ejecutado.

Este caso de uso define la columna vertebral del sistema.

---

## Actor
- Usuario autenticado
- Rol permitido: ADMIN | OPERATOR
- Pertenece a una Organización activa

---

## Precondiciones
- El usuario existe y está activo
- La organización existe y está activa
- El plan de suscripción permite crear procesos activos
- El sistema se encuentra operativo

---

## Flujo Principal

1. El usuario solicita crear un nuevo proceso
2. El sistema valida:
   - usuario activo
   - rol autorizado
   - organización activa
3. El sistema crea un proceso en estado `DRAFT`
4. El sistema valida la definición del proceso:
   - nombre válido
   - al menos un paso
   - orden correcto de los pasos
5. El sistema intenta activar el proceso
6. El dominio valida la transición de estado `DRAFT → ACTIVE`
7. El sistema registra un evento de auditoría
8. El sistema devuelve el proceso en estado `ACTIVE`

---

## Reglas de Dominio

### Reglas de Usuario
- El usuario debe estar activo
- El usuario debe tener permisos suficientes para crear procesos

### Reglas de Organización
- La organización debe estar activa

### Reglas de Proceso
- Un proceso debe tener al menos un paso
- Los pasos deben tener un orden válido
- Un proceso solo puede activarse si está en estado `DRAFT`
- Un proceso activo no puede ser modificado directamente

### Reglas de Suscripción
- El plan debe permitir procesos activos
- Si se supera el límite, la activación debe fallar

---

## Estados Involucrados

### Proceso
- `DRAFT`
- `ACTIVE`

Transiciones permitidas:
- `DRAFT → ACTIVE`

---

## Errores Esperados

- Usuario no autorizado
- Usuario inactivo
- Organización inactiva
- Plan de suscripción no válido
- Definición de proceso inválida
- Transición de estado no permitida

---

## Notas de Diseño

- Todas las validaciones de negocio deben vivir en el dominio
- La activación del proceso nunca debe hacerse desde la API
- Este caso de uso debe ejecutarse de forma transaccional
- No deben existir cambios parciales ante errores

---

## Resultado
Un proceso válido, activo y listo para ser ejecutado dentro del sistema.
