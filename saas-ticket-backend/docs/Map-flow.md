
TTP Request
   ↓
Controller
   ↓
CreateAndActivateProcess (application)
   ↓
Domain (Process + reglas)
   ↓
Repositories (interfaces)
   ↓
Infrastructure (Prisma)
   ↑
Response

📌 Mapeo DIRECTO del MD → arquitectura

MD	Capa
Reglas de dominio	- /domain
Flujo principal	- /application/use-cases
Estados	- /domain/value-objects
Persistencia	- /application/ports
Prisma	- /infrastructure
HTTP	- /interfaces

🚫 Errores que esta arquitectura evita

Controllers gigantes

Models anémicos

Reglas en la DB

Prisma en el dominio

Caos de carpetas