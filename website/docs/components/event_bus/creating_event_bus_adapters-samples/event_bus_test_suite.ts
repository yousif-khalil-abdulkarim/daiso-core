import { describe, test, beforeEach, expect } from "vitest";
import { eventBusTestSuite } from "eridu-tech/event-bus/test-utilities";
import { EventBus } from "eridu-tech/event-bus";
import { MemoryEventBusAdapter } from "eridu-tech/event-bus/memory-event-bus-adapter";

describe("class: EventBus", () => {
    eventBusTestSuite({
        createEventBus: () =>
            new EventBus({
                adapter: new MemoryEventBusAdapter(),
            }),
        test,
        beforeEach,
        expect,
        describe,
    });
});
