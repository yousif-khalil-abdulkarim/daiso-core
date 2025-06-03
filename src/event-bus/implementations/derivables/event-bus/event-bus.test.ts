import { describe, test, beforeEach, expect } from "vitest";
import { MemoryEventBusAdapter } from "@/event-bus/implementations/adapters/memory-event-bus-adapter/memory-event-bus-adapter.js";
import { EventBus } from "@/event-bus/implementations/derivables/event-bus/event-bus.js";
import { eventBusTestSuite } from "@/event-bus/implementations/test-utilities/_module-exports.js";
import { EventEmitter } from "node:events";
import {
    Namespace,
    TimeSpan,
    ValidationError,
} from "@/utilities/_module-exports.js";
import { z } from "zod";
import type { EventListenerFn } from "@/event-bus/contracts/event-bus-adapter.contract.js";
import { LazyPromise } from "@/async/_module-exports.js";

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
    describe("standard schema:", () => {
        type AddEvent = { a: number; b: number };
        const addEventSchema = z.object({
            a: z.number(),
            b: z.number(),
        });
        const eventMapSchema = {
            add: addEventSchema,
        };
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const invalidInput: AddEvent = { a: "asd", c: null } as any;
        const namespace = new Namespace("event-bus");

        describe("input validation:", () => {
            test("method: dispatch", async () => {
                const eventBus = new EventBus({
                    adapter: new MemoryEventBusAdapter(),
                    namespace,
                    eventMapSchema,
                });
                const promise = eventBus.dispatch("add", invalidInput);
                await expect(promise).rejects.toBeInstanceOf(ValidationError);
            });
        });
        describe("output validation:", () => {
            test("method: addListener", async () => {
                let error: unknown = null;
                const adapter = new MemoryEventBusAdapter();
                const eventBus = new EventBus({
                    adapter,
                    namespace,
                    eventMapSchema,
                    __onUncaughtRejection: (error_) => {
                        error = error_;
                    },
                });

                const listener: EventListenerFn<AddEvent> = () => {};

                await eventBus.addListener("add", listener);
                await adapter.dispatch(
                    namespace._getInternal().create("add").namespaced,
                    invalidInput,
                );
                await LazyPromise.delay(TimeSpan.fromMilliseconds(10));

                expect(error).toBeInstanceOf(ValidationError);
                eventBus.removeListener("add", listener);
            });
            test("method: listenOnce", async () => {
                let error: unknown = null;
                const adapter = new MemoryEventBusAdapter();
                const eventBus = new EventBus({
                    adapter,
                    namespace,
                    eventMapSchema,
                    __onUncaughtRejection: (error_) => {
                        error = error_;
                    },
                });

                const listener: EventListenerFn<AddEvent> = () => {};

                await eventBus.listenOnce("add", listener);
                await adapter.dispatch(
                    namespace._getInternal().create("add").namespaced,
                    invalidInput,
                );
                await LazyPromise.delay(TimeSpan.fromMilliseconds(10));

                expect(error).toBeInstanceOf(ValidationError);
                eventBus.removeListener("add", listener);
            });
            test("method: asPromise", async () => {
                let error: unknown = null;
                const adapter = new MemoryEventBusAdapter();
                const eventBus = new EventBus({
                    adapter,
                    namespace,
                    eventMapSchema,
                    __onUncaughtRejection: (error_) => {
                        error = error_;
                    },
                });

                eventBus.asPromise("add").defer();
                await adapter.dispatch(
                    namespace._getInternal().create("add").namespaced,
                    invalidInput,
                );
                await LazyPromise.delay(TimeSpan.fromMilliseconds(10));

                expect(error).toBeInstanceOf(ValidationError);
            });
            test("method: subscribeOnce", async () => {
                let error: unknown = null;
                const adapter = new MemoryEventBusAdapter();
                const eventBus = new EventBus({
                    adapter,
                    namespace,
                    eventMapSchema,
                    __onUncaughtRejection: (error_) => {
                        error = error_;
                    },
                });

                const listener: EventListenerFn<AddEvent> = () => {};

                const unsubscribe = await eventBus.subscribeOnce(
                    "add",
                    listener,
                );
                await adapter.dispatch(
                    namespace._getInternal().create("add").namespaced,
                    invalidInput,
                );
                await LazyPromise.delay(TimeSpan.fromMilliseconds(10));

                expect(error).toBeInstanceOf(ValidationError);
                await unsubscribe();
            });
            test("method: subscribe", async () => {
                let error: unknown = null;
                const adapter = new MemoryEventBusAdapter();
                const eventBus = new EventBus({
                    adapter,
                    namespace,
                    eventMapSchema,
                    __onUncaughtRejection: (error_) => {
                        error = error_;
                    },
                });

                const listener: EventListenerFn<AddEvent> = () => {};

                const unsubscribe = await eventBus.subscribe("add", listener);
                await adapter.dispatch(
                    namespace._getInternal().create("add").namespaced,
                    invalidInput,
                );
                await LazyPromise.delay(TimeSpan.fromMilliseconds(10));

                expect(error).toBeInstanceOf(ValidationError);
                await unsubscribe();
            });
        });
    });
});
