import { DomainError } from "../audit/shared/DomainError";

export class InvalidStepOrderError extends DomainError {
    constructor() {
    super("Process step order must be zero or positive");
}
}

export class EmptyStepNameError extends DomainError {
    constructor() {
    super("Process step name cannot be empty");
}
}
