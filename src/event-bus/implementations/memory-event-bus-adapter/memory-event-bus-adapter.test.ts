import { describe, test, beforeEach, expect } from "vitest";
import { eventBusAdapterTestSuite } from "@/event-bus/implementations/_shared/test-utilities/event-bus-adapter.test-suite";
import { MemoryEventBusAdapter } from "@/event-bus/implementations/memory-event-bus-adapter/memory-event-bus-adapter";

describe("class: MemoryEventBusAdapter", () => {
    eventBusAdapterTestSuite({
        createAdapter: () => new MemoryEventBusAdapter(),
        test,
        beforeEach,
        expect,
        describe,
    });
});
