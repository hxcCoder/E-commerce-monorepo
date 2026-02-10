# SaaS Ticket Backend

[![License: MIT](https://img.shields.io/github/license/hxcCoder/saas-ticket-backend)](https://github.com/hxcCoder/saas-ticket-backend/blob/main/LICENSE)
[![Node.js Version](https://img.shields.io/badge/Node.js-v18+-brightgreen)](https://nodejs.org/)
[![TypeScript Version](https://img.shields.io/badge/TypeScript-4.9-blue)](https://www.typescriptlang.org/)
[![Build Status](https://github.com/hxcCoder/saas-ticket-backend/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/hxcCoder/saas-ticket-backend/actions/workflows/ci.yml)
[![Coverage Status](https://codecov.io/gh/hxcCoder/saas-ticket-backend/branch/main/graph/badge.svg)](https://codecov.io/gh/hxcCoder/saas-ticket-backend)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)


## Table of Contents

- [About](#about)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
  - [API Endpoints](#api-endpoints)
  - [Examples](#examples)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

---

## About

This backend provides a **robust workflow execution engine** with:

- Strong **domain rules** using DDD
- State transitions control: `CREATED → ACTIVE → EXECUTING → COMPLETED`
- Immutable **audit logging**
- Clean Architecture: Domain, Application, Infrastructure, Interfaces

It allows creation, activation, execution, and completion of processes with steps, including execution tracking per user.

---

## Tech Stack

- Node.js 18+
- TypeScript 4.9+
- PostgreSQL
- Prisma ORM
- Express.js
- Clean Architecture + DDD
- Jest (Unit & Integration tests)
- Docker & Docker Compose

---

## Architecture

- **Domain Layer**: Entities, Value Objects, Domain Services  
- **Application Layer**: Use Cases  
- **Infrastructure**: Repositories (Prisma)  
- **Interfaces**: HTTP Controllers, Routes, DTOs  

**Execution Flow**:

```mermaid
flowchart TD
  A[POST /processes] --> B[CreateProcessUseCase]
  B --> C[Validate Steps]
  C --> D[Persist Process in PrismaProcessRepository]
  D --> E[Response with ProcessDTO]
  E --> F[ActivateProcessUseCase]
  F --> G[Create Execution & ExecutionSteps]
  G --> H[ExecuteProcessUseCase]
  H --> I[CompleteExecutionUseCase]

```

## Domain UML:

```mermaid
classDiagram
  class Process {
    +id: string
    +name: string
    +status: string
  }

  class ProcessStep {
    +id: string
    +name: string
    +status: string
  }

  class Execution {
    +id: string
    +processId: string
    +status: string
  }

  class ExecutionStep {
    +id: string
    +executionId: string
    +status: string
  }

  class User {
    +id: string
    +name: string
    +email: string
  }

  Process --> ProcessStep
  Process "1" --> "many" Execution
  Execution --> ExecutionStep
  User "1" --> "many" Execution
```
# Project Structure
```text
src/
├── domain/           # Entities, value objects, domain rules
├── application/      # Use Cases / Application logic
├── infrastructure/   # Repositories (Prisma), services
├── interfaces/       # HTTP controllers, routes, DTOs
├── tests/            # Unit & integration tests
├── prisma/           # Schema & migrations
```
# Installation
Clone the repository:
```bash
git clone https://github.com/hxcCoder/saas-ticket-backend.git
cd saas-ticket-backend
npm install
```

*Environment Variables*

Copy .env.example to .env and fill the values:
```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
Database Setup
npx prisma migrate dev
npx prisma generate
Start Server
npm run dev
```
Or using Docker Compose:
```bash
docker-compose up -d
```
## Usage
API Endpoints

Create Process: POST /processes

Activate Process: PATCH /processes/:id/activate

Execute Step: PATCH /executions/:id/execute-step/:stepId

Complete Execution: PATCH /executions/:id/complete

## Examples

Create Process

POST /processes
Content-Type: application/json
```json
{
  "name": "Invoice Approval",
  "steps": [
    {"name": "Submit invoice"},
    {"name": "Manager review"}
  ]
}
Response:

{
  "id": "process_123",
  "name": "Invoice Approval",
  "status": "CREATED",
  "steps": [
    {"id": "step_1", "name": "Submit invoice", "status": "PENDING"},
    {"id": "step_2", "name": "Manager review", "status": "PENDING"}
  ]
}
```
```json
Activate Process

PATCH /processes/process_123/activate
Response:

{
  "id": "process_123",
  "status": "ACTIVE"
}
Execute Step

PATCH /executions/execution_456/execute-step/step_1
Response:

{
  "executionId": "execution_456",
  "stepId": "step_1",
  "status": "EXECUTING"
}
```
```json
Complete Execution

PATCH /executions/execution_456/complete
Response:

{
  "executionId": "execution_456",
  "status": "COMPLETED"
}
```
## Testing

Run all tests:
```bash
npm test
```
Watch mode:
```bash
npm run test:watch
```

Coverage report:
```bash
npm run coverage
```

Unit tests: domain logic & use cases

Integration tests: full workflows from create → activate → execute → complete

## Contributing
Contributions are welcome!

Fork the repository

Create a feature branch (git checkout -b feature/xyz)

Commit your changes (git commit -m 'Add feature')

Push to the branch (git push origin feature/xyz)

Open a Pull Request

Please follow the project code style and naming conventions.

# License
This project is licensed under the MIT License — see the LICENSE file for details.
© 2026 Benjamin Millalonco
