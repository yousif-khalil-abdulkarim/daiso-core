import { describe, test, beforeEach, expect } from "vitest";
import { eventBusAdapterTestSuite } from "eridu-tech/event-bus/test-utilities";
import { MemoryEventBusAdapter } from "eridu-tech/event-bus/memory-event-bus-adapter";

describe("class: MyEventBusAdapter", () => {
    eventBusAdapterTestSuite({
        createAdapter: () => new MemoryEventBusAdapter(),
        test,
        beforeEach,
        expect,
        describe,
    });
});
