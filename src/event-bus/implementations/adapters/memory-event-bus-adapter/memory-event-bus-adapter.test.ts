import { describe, test, beforeEach, expect } from "vitest";
import { eventBusAdapterTestSuite } from "@/event-bus/implementations/_shared/_module";
import { MemoryEventBusAdapter } from "@/event-bus/implementations/adapters/memory-event-bus-adapter/memory-event-bus-adapter";
import EventEmitter from "node:events";

describe("class: MemoryEventBusAdapter", () => {
    let eventEmitter: EventEmitter;
    beforeEach(() => {
        eventEmitter = new EventEmitter();
    });
    eventBusAdapterTestSuite({
        createAdapterA: () =>
            new MemoryEventBusAdapter({
                rootGroup: "@a",
                eventEmitter,
            }),
        createAdapterB: () =>
            new MemoryEventBusAdapter({
                rootGroup: "@a/b",
                eventEmitter,
            }),
        test,
        beforeEach,
        expect,
        describe,
    });
});
