import { describe, test, beforeEach, expect } from "vitest";
import { MemoryEventBusAdapter } from "@/event-bus/implementations/adapters/memory-event-bus-adapter/memory-event-bus-adapter.js";
import { EventBus } from "@/event-bus/implementations/derivables/event-bus/event-bus.js";
import { eventBusTestSuite } from "@/event-bus/implementations/test-utilities/_module-exports.js";
import { EventEmitter } from "node:events";
import { Namespace } from "@/utilities/_module-exports.js";

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
                namespace: new Namespace("event-bus"),
                adapter: new MemoryEventBusAdapter(eventEmitter),
            }),
    });
});
