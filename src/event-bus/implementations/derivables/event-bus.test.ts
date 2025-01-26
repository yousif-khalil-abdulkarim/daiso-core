import { describe, test, beforeEach, expect } from "vitest";
import { MemoryEventBusAdapter } from "@/event-bus/implementations/adapters/memory-event-bus-adapter/memory-event-bus-adapter";
import { EventBus } from "@/event-bus/implementations/derivables/event-bus";
import { eventBusTestSuite } from "@/event-bus/implementations/_shared/_module";
import { EventEmitter } from "node:events";
import { NoOpSerde } from "@/serde/implementations/_module";

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
        createEventBusA: () =>
            new EventBus({
                adapter: new MemoryEventBusAdapter({
                    rootGroup: "@a",
                    eventEmitter,
                }),
                serde: new NoOpSerde(),
            }),
        createEventBusB: () =>
            new EventBus({
                adapter: new MemoryEventBusAdapter({
                    rootGroup: "@a/b",
                    eventEmitter,
                }),
                serde: new NoOpSerde(),
            }),
    });
});
