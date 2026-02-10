    export abstract class DomainError extends Error {
public readonly occurredAt: Date;

protected constructor(message: string) {
    super(message);

    this.name = this.constructor.name;
    this.occurredAt = new Date();

    Object.setPrototypeOf(this, new.target.prototype);
}
}
