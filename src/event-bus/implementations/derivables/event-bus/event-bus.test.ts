import { describe, test, beforeEach, expect } from "vitest";
import { MemoryEventBusAdapter } from "@/event-bus/implementations/adapters/memory-event-bus-adapter/memory-event-bus-adapter.js";
import { EventBus } from "@/event-bus/implementations/derivables/event-bus/event-bus.js";
import { eventBusTestSuite } from "@/event-bus/implementations/test-utilities/_module-exports.js";
import { EventEmitter } from "node:events";
import { KeyPrefixer } from "@/utilities/_module-exports.js";
import type { IEventBusAdapter } from "@/event-bus/contracts/event-bus-adapter.contract.js";

describe("class: EventBus", () => {
    let eventEmitter: EventEmitter;
    beforeEach(() => {
        eventEmitter = new EventEmitter();
    });
    describe("Without group:", () => {
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
    describe("With group:", () => {
        let store: Partial<Record<string, IEventBusAdapter>> = {};
        beforeEach(() => {
            store = {};
        });
        eventBusTestSuite({
            test,
            expect,
            describe,
            beforeEach,
            createEventBus: () =>
                new EventBus({
                    keyPrefixer: new KeyPrefixer("event-bus"),
                    adapter: (prefix): IEventBusAdapter => {
                        let adapter = store[prefix];
                        if (adapter === undefined) {
                            adapter = new MemoryEventBusAdapter();
                            store[prefix] = adapter;
                        }
                        return adapter;
                    },
                }),
        });
    });
});
