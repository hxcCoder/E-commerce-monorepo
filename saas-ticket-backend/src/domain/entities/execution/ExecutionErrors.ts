import { DomainError } from "../audit/shared/DomainError";

export class InvalidExecutionStatusError extends DomainError {
    constructor(status: string) {
        super(`Invalid execution status: ${status}`);
    }
}

export class InvalidExecutionStepError extends DomainError {
    constructor(message: string) {
        super(message);
    }
}

export class ProcessNotActive extends DomainError {
    constructor() {
        super("Cannot start execution from inactive process");
    }
}

export namespace ExecutionErrors {
    export class ExecutionNotRunning extends Error {
        constructor() {
            super("Execution is not running");
        }
    }

    export class ExecutionAlreadyCompleted extends Error {
        constructor() {
            super("Execution already completed");
        }
    }
}
