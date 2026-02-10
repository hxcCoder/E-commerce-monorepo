import { Process } from "../../Process";
import { ProcessHasNoStepsError } from "../../ProcessErrors";

describe("Process.activate errors", () => {
    it("throws if process has no steps", () => {
        const process = Process.create("p-1", "Process");

        expect(() => {
            process.activate();
        }).toThrow(ProcessHasNoStepsError);
    });
});
