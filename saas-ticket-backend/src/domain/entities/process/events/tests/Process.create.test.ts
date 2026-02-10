import { ProcessCreated } from "../ProcessCreated";

describe("ProcessCreated Domain Event", () => {
    it("should expose correct primitives", () => {
    const event = new ProcessCreated("process-1", "My Process");

    expect(event.getEventName()).toBe("process.created");
    expect(event.toPrimitives()).toEqual({
        processId: "process-1",
        name: "My Process",
    });
});
});
