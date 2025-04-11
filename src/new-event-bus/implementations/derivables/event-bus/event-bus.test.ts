import { describe, test, beforeEach, expect } from "vitest";
import { MemoryEventBusAdapter } from "@/new-event-bus/implementations/adapters/memory-event-bus-adapter/memory-event-bus-adapter.js";
import { EventBus } from "@/new-event-bus/implementations/derivables/event-bus/event-bus.js";
import { eventBusTestSuite } from "@/new-event-bus/implementations/test-utilities/_module-exports.js";
import { EventEmitter } from "node:events";
import { KeyPrefixer } from "@/utilities/_module-exports.js";

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
                keyPrefixer: new KeyPrefixer("event-bus"),
                adapter: new MemoryEventBusAdapter(eventEmitter),
            }),
    });
});
