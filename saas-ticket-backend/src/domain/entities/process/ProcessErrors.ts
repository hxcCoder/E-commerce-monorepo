import { DomainError } from "../audit/shared/DomainError";

export class ProcessAlreadyActiveError extends DomainError {
    constructor() {
    super("Process is already active");
}
}

export class ProcessHasNoStepsError extends DomainError {
    constructor() {
    super("Process must have at least one step");
}
}

export class InvalidProcessStateError extends DomainError {
    constructor(message: string) {
    super(message);
}
}
