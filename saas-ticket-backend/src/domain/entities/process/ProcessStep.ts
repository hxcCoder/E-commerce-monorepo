    import { ProcessStepStatus } from "./ProcessStepStatus";
    import {
        EmptyStepNameError,
        InvalidStepOrderError,
    } from "./ProcessStepErrors";

    export class ProcessStep {
        private readonly id: string;
        private readonly name: string;
        private readonly order: number;
        private status: ProcessStepStatus;

        constructor(params: { id: string; name: string; order: number }) {
            if (!params.name.trim()) {
                throw new EmptyStepNameError();
            }

            if (params.order < 0) {
                throw new InvalidStepOrderError();
            }
            if (!params.id.trim()) {
                throw new InvalidStepOrderError();
            }   
            this.id = params.id;
            this.name = params.name;
            this.order = params.order;
            this.status = ProcessStepStatus.ACTIVE;
        }

        getId(): string {
            return this.id;
        }


        getName(): string {
            return this.name;
        }
        getOrder(): number {
            return this.order;
        }
        isActive(): boolean {
            return this.status === ProcessStepStatus.ACTIVE;
        }

        disable(): void {
            this.status = ProcessStepStatus.DISABLED;
        }
    }

