import { Process } from "../../../../domain/entities/process/Process";
import { ProcessStep } from "../../../../domain/entities/process/ProcessStep";

export class ProcessFactory {
  static create(id: string, name: string, organizationId: string): Process {
    return Process.create(id, name, organizationId);
  }

  static withSteps(
    id: string,
    name: string,
    organizationId: string,
    stepsData: { id: string; name: string; order: number }[]
  ): Process {
    const process = Process.create(id, name, organizationId);
    stepsData.forEach(s =>
      process.addStep(new ProcessStep({ id: s.id, name: s.name, order: s.order }))
    );
    return process;
  }
}
