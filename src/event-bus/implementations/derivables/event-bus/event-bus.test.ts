import { describe, test, beforeEach, expect } from "vitest";
import { MemoryEventBusAdapter } from "@/event-bus/implementations/adapters/memory-event-bus-adapter/memory-event-bus-adapter";
import { EventBus } from "@/event-bus/implementations/derivables/event-bus/event-bus";
import { eventBusTestSuite } from "@/event-bus/implementations/test-utilities/_module";
import { EventEmitter } from "node:events";

describe("class: EventBus", () => {
    let eventEmitter: EventEmitter;
    beforeEach(() => {
        eventEmitter = new EventEmitter();
    });
    eventBusTestSuite({
        test,
        expect,
        describe,
        beforeEach,
        createEventBus: () =>
            new EventBus({
                adapter: new MemoryEventBusAdapter({
                    rootGroup: "@a",
                    eventEmitter,
                }),
            }),
    });
});
