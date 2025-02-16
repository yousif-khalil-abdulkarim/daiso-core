import { describe, test, beforeEach, expect } from "vitest";
import { eventBusAdapterTestSuite } from "@/event-bus/implementations/test-utilities/_module-exports.js";
import { MemoryEventBusAdapter } from "@/event-bus/implementations/adapters/memory-event-bus-adapter/memory-event-bus-adapter.js";
import EventEmitter from "node:events";

describe("class: MemoryEventBusAdapter", () => {
    let eventEmitter: EventEmitter;
    beforeEach(() => {
        eventEmitter = new EventEmitter();
    });
    eventBusAdapterTestSuite({
        createAdapter: () =>
            new MemoryEventBusAdapter({
                rootGroup: "@a",
                eventEmitter,
            }),
        test,
        beforeEach,
        expect,
        describe,
    });
});
