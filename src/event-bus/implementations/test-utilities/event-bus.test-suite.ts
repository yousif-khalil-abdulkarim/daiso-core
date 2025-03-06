/**
 * @module EventBus
 */

import {
    type TestAPI,
    type SuiteAPI,
    type ExpectStatic,
    type beforeEach,
} from "vitest";
import {
    BaseEvent,
    type IEventBus,
    type IGroupableEventBus,
} from "@/event-bus/contracts/_module-exports.js";
import {
    type IInvokableObject,
    type InvokableFn,
    type Promisable,
} from "@/utilities/_module-exports.js";
import { TimeSpan } from "@/utilities/_module-exports.js";
import { LazyPromise } from "@/async/_module-exports.js";
import type { IFlexibleSerde } from "@/serde/contracts/_module-exports.js";
import { Serde } from "@/serde/implementations/derivables/_module-exports.js";
import { NoOpSerdeAdapter } from "@/serde/implementations/adapters/_module-exports.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/test-utilities"```
 * @group Test utilities
 */
export type EventBusTestSuiteSettings = {
    expect: ExpectStatic;
    serde?: IFlexibleSerde;
    test: TestAPI;
    describe: SuiteAPI;
    beforeEach: typeof beforeEach;
    createEventBus: () => Promisable<IGroupableEventBus>;
};

/**
 * The <i>eventBusTestSuite</i> function simplifies the process of testing your custom implementation of <i>{@link IEventBus}</i> with vitest.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/test-utilities"```
 * @group Test utilities
 */
export function eventBusTestSuite(settings: EventBusTestSuiteSettings): void {
    const {
        expect,
        serde = new Serde(new NoOpSerdeAdapter()),
        test,
        describe,
        createEventBus,
        beforeEach,
    } = settings;

    const TTL = TimeSpan.fromMilliseconds(50);
    class AddEvent extends BaseEvent<{
        a: number;
        b: number;
    }> {}
    class SubEvent extends BaseEvent<{
        c: number;
        d: number;
    }> {}
    serde.registerEvent(AddEvent).registerEvent(SubEvent);

    let eventBusA: IEventBus<AddEvent | SubEvent>;
    let eventBusB: IEventBus<AddEvent | SubEvent>;
    beforeEach(async () => {
        const eventBus = await createEventBus();
        eventBusA = eventBus;
        eventBusB = eventBus.withGroup("b");
    });

    describe("Api tests:", () => {
        describe("method: addListener, removeListener, dispatch", () => {
            describe("Should be null when listener is added and event is not triggered", () => {
                test("Object literal listener", async () => {
                    const listener: IInvokableObject<AddEvent> & {
                        result: AddEvent | null;
                    } = {
                        result: null,
                        invoke(event: AddEvent): Promisable<void> {
                            this.result = event;
                        },
                    };
                    await eventBusA.addListener(AddEvent, listener);
                    expect(listener.result).toBeNull();
                    await eventBusA.removeListener(AddEvent, listener);
                });
                test("Class instance listener", async () => {
                    class Listener implements IInvokableObject<AddEvent> {
                        result: AddEvent | null = null;
                        invoke(event: AddEvent): Promisable<void> {
                            this.result = event;
                        }
                    }
                    const listener = new Listener();
                    await eventBusA.addListener(AddEvent, listener);
                    expect(listener.result).toBeNull();
                    await eventBusA.removeListener(AddEvent, listener);
                });
                test("Function listener", async () => {
                    let result = null as AddEvent | null;
                    const listener: InvokableFn<AddEvent> = (event) => {
                        result = event;
                    };
                    await eventBusA.addListener(AddEvent, listener);
                    expect(result).toBeNull();
                    await eventBusA.removeListener(AddEvent, listener);
                });
            });
            describe("Should be AddEvent when listener is added and event is triggered", () => {
                test("Object literal listener", async () => {
                    const listener: IInvokableObject<AddEvent> & {
                        result: AddEvent | null;
                    } = {
                        result: null,
                        invoke(event: AddEvent): Promisable<void> {
                            this.result = event;
                        },
                    };
                    await eventBusA.addListener(AddEvent, listener);
                    const event = new AddEvent({
                        a: 1,
                        b: 2,
                    });
                    await eventBusA.dispatch(event);
                    await LazyPromise.delay(TTL);
                    expect(listener.result).toEqual(event);
                    expect(listener.result).toBeInstanceOf(AddEvent);
                    await eventBusA.removeListener(AddEvent, listener);
                });
                test("Class instance listener", async () => {
                    class Listener implements IInvokableObject<AddEvent> {
                        result: AddEvent | null = null;
                        invoke(event: AddEvent): Promisable<void> {
                            this.result = event;
                        }
                    }
                    const listener = new Listener();
                    await eventBusA.addListener(AddEvent, listener);
                    const event = new AddEvent({
                        a: 1,
                        b: 2,
                    });
                    await eventBusA.dispatch(event);
                    await LazyPromise.delay(TTL);
                    expect(listener.result).toEqual(event);
                    expect(listener.result).toBeInstanceOf(AddEvent);
                    await eventBusA.removeListener(AddEvent, listener);
                });
                test("Function listener", async () => {
                    let result = null as AddEvent | null;
                    const listener: InvokableFn<AddEvent> = (event) => {
                        result = event;
                    };
                    await eventBusA.addListener(AddEvent, listener);
                    const event = new AddEvent({
                        a: 1,
                        b: 2,
                    });
                    await eventBusA.dispatch(event);
                    await LazyPromise.delay(TTL);
                    expect(result).toEqual(event);
                    expect(result).toBeInstanceOf(AddEvent);
                    await eventBusA.removeListener(AddEvent, listener);
                });
            });
            describe("Should be null when listener removed and event is triggered", () => {
                test("Object literal listener", async () => {
                    const listener: IInvokableObject<AddEvent> & {
                        result: AddEvent | null;
                    } = {
                        result: null,
                        invoke(event: AddEvent): Promisable<void> {
                            this.result = event;
                        },
                    };
                    await eventBusA.addListener(AddEvent, listener);
                    await eventBusA.removeListener(AddEvent, listener);
                    const event = new AddEvent({
                        a: 1,
                        b: 2,
                    });
                    await eventBusA.dispatch(event);
                    await LazyPromise.delay(TTL);
                    expect(listener.result).toBeNull();
                });
                test("Class instance listener", async () => {
                    class Listener implements IInvokableObject<AddEvent> {
                        result: AddEvent | null = null;
                        invoke(event: AddEvent): Promisable<void> {
                            this.result = event;
                        }
                    }
                    const listener = new Listener();
                    await eventBusA.addListener(AddEvent, listener);
                    await eventBusA.removeListener(AddEvent, listener);
                    const event = new AddEvent({
                        a: 1,
                        b: 2,
                    });
                    await eventBusA.dispatch(event);
                    await LazyPromise.delay(TTL);
                    expect(listener.result).toBeNull();
                });
                test("Function listener", async () => {
                    let result = null as AddEvent | null;
                    const listener: InvokableFn<AddEvent> = (event) => {
                        result = event;
                    };
                    await eventBusA.addListener(AddEvent, listener);
                    await eventBusA.removeListener(AddEvent, listener);
                    const event = new AddEvent({
                        a: 1,
                        b: 2,
                    });
                    await eventBusA.dispatch(event);
                    await LazyPromise.delay(TTL);
                    expect(result).toBeNull();
                });
            });
        });
        describe("method: addListenerMany, removeListenerMany, dispatchMany", () => {
            describe("Should be null when listener is added and event is not triggered", () => {
                test("Object literal listener", async () => {
                    const listener: IInvokableObject<AddEvent | SubEvent> & {
                        resultA: AddEvent | null;
                        resultB: SubEvent | null;
                    } = {
                        resultA: null,
                        resultB: null,
                        invoke(event: AddEvent | SubEvent): Promisable<void> {
                            if (event instanceof AddEvent) {
                                this.resultA = event;
                            }
                            if (event instanceof SubEvent) {
                                this.resultB = event;
                            }
                        },
                    };
                    await eventBusA.addListenerMany(
                        [AddEvent, SubEvent],
                        listener,
                    );
                    expect(listener.resultA).toBeNull();
                    expect(listener.resultB).toBeNull();
                    await eventBusA.removeListenerMany(
                        [AddEvent, SubEvent],
                        listener,
                    );
                });
                test("Class instance listener", async () => {
                    class Listener
                        implements IInvokableObject<AddEvent | SubEvent>
                    {
                        resultA: AddEvent | null = null;
                        resultB: SubEvent | null = null;
                        invoke(event: AddEvent | SubEvent): Promisable<void> {
                            if (event instanceof AddEvent) {
                                this.resultA = event;
                            }
                            if (event instanceof SubEvent) {
                                this.resultB = event;
                            }
                        }
                    }
                    const listener = new Listener();
                    await eventBusA.addListenerMany(
                        [AddEvent, SubEvent],
                        listener,
                    );
                    expect(listener.resultA).toBeNull();
                    expect(listener.resultB).toBeNull();
                    await eventBusA.removeListenerMany(
                        [AddEvent, SubEvent],
                        listener,
                    );
                });
                test("Function listener", async () => {
                    let resultA = null as AddEvent | null;
                    let resultB = null as SubEvent | null;
                    const listener: InvokableFn<AddEvent | SubEvent> = (
                        event,
                    ) => {
                        if (event instanceof AddEvent) {
                            resultA = event;
                        }
                        if (event instanceof SubEvent) {
                            resultB = event;
                        }
                    };
                    await eventBusA.addListenerMany(
                        [AddEvent, SubEvent],
                        listener,
                    );
                    expect(resultA).toBeNull();
                    expect(resultB).toBeNull();
                    await eventBusA.removeListenerMany(
                        [AddEvent, SubEvent],
                        listener,
                    );
                });
            });
            describe("Should be AddEvent and SubEvent when listener is added and event is triggered", () => {
                test("Object literal listener", async () => {
                    const listener: IInvokableObject<AddEvent | SubEvent> & {
                        resultA: AddEvent | null;
                        resultB: SubEvent | null;
                    } = {
                        resultA: null,
                        resultB: null,
                        invoke(event: AddEvent | SubEvent): Promisable<void> {
                            if (event instanceof AddEvent) {
                                this.resultA = event;
                            }
                            if (event instanceof SubEvent) {
                                this.resultB = event;
                            }
                        },
                    };
                    await eventBusA.addListenerMany(
                        [AddEvent, SubEvent],
                        listener,
                    );
                    const addEvent = new AddEvent({
                        a: 1,
                        b: 2,
                    });
                    const subEvent = new SubEvent({
                        c: 1,
                        d: 2,
                    });
                    await eventBusA.dispatchMany([addEvent, subEvent]);
                    await LazyPromise.delay(TTL);
                    expect(listener.resultA).toEqual(addEvent);
                    expect(listener.resultA).toBeInstanceOf(AddEvent);
                    expect(listener.resultB).toEqual(subEvent);
                    expect(listener.resultB).toBeInstanceOf(SubEvent);
                    await eventBusA.removeListenerMany(
                        [AddEvent, SubEvent],
                        listener,
                    );
                });
                test("Class instance listener", async () => {
                    class Listener
                        implements IInvokableObject<AddEvent | SubEvent>
                    {
                        resultA: AddEvent | null = null;
                        resultB: SubEvent | null = null;
                        invoke(event: AddEvent | SubEvent): Promisable<void> {
                            if (event instanceof AddEvent) {
                                this.resultA = event;
                            }
                            if (event instanceof SubEvent) {
                                this.resultB = event;
                            }
                        }
                    }
                    const listener = new Listener();
                    await eventBusA.addListenerMany(
                        [AddEvent, SubEvent],
                        listener,
                    );
                    const addEvent = new AddEvent({
                        a: 1,
                        b: 2,
                    });
                    const subEvent = new SubEvent({
                        c: 1,
                        d: 2,
                    });
                    await eventBusA.dispatchMany([addEvent, subEvent]);
                    await LazyPromise.delay(TTL);
                    expect(listener.resultA).toEqual(addEvent);
                    expect(listener.resultA).toBeInstanceOf(AddEvent);
                    expect(listener.resultB).toEqual(subEvent);
                    expect(listener.resultB).toBeInstanceOf(SubEvent);
                    await eventBusA.removeListenerMany(
                        [AddEvent, SubEvent],
                        listener,
                    );
                });
                test("Function listener", async () => {
                    let resultA = null as AddEvent | null;
                    let resultB = null as SubEvent | null;
                    const listener: InvokableFn<AddEvent | SubEvent> = (
                        event,
                    ) => {
                        if (event instanceof AddEvent) {
                            resultA = event;
                        }
                        if (event instanceof SubEvent) {
                            resultB = event;
                        }
                    };
                    await eventBusA.addListenerMany(
                        [AddEvent, SubEvent],
                        listener,
                    );
                    const addEvent = new AddEvent({
                        a: 1,
                        b: 2,
                    });
                    const subEvent = new SubEvent({
                        c: 1,
                        d: 2,
                    });
                    await eventBusA.dispatchMany([addEvent, subEvent]);
                    await LazyPromise.delay(TTL);
                    expect(resultA).toEqual(addEvent);
                    expect(resultA).toBeInstanceOf(AddEvent);
                    expect(resultB).toEqual(subEvent);
                    expect(resultB).toBeInstanceOf(SubEvent);
                    await eventBusA.removeListenerMany(
                        [AddEvent, SubEvent],
                        listener,
                    );
                });
            });
            describe("Should be null when listener removed and event is triggered", () => {
                test("Object literal listener", async () => {
                    const listener: IInvokableObject<AddEvent | SubEvent> & {
                        resultA: AddEvent | null;
                        resultB: SubEvent | null;
                    } = {
                        resultA: null,
                        resultB: null,
                        invoke(event: AddEvent | SubEvent): Promisable<void> {
                            if (event instanceof AddEvent) {
                                this.resultA = event;
                            }
                            if (event instanceof SubEvent) {
                                this.resultB = event;
                            }
                        },
                    };
                    await eventBusA.addListenerMany(
                        [AddEvent, SubEvent],
                        listener,
                    );
                    await eventBusA.removeListenerMany(
                        [AddEvent, SubEvent],
                        listener,
                    );
                    const addEvent = new AddEvent({
                        a: 1,
                        b: 2,
                    });
                    const subEvent = new SubEvent({
                        c: 1,
                        d: 2,
                    });
                    await eventBusA.dispatchMany([addEvent, subEvent]);
                    await LazyPromise.delay(TTL);
                    expect(listener.resultA).toBeNull();
                    expect(listener.resultB).toBeNull();
                });
                test("Class instance listener", async () => {
                    class Listener
                        implements IInvokableObject<AddEvent | SubEvent>
                    {
                        resultA: AddEvent | null = null;
                        resultB: SubEvent | null = null;
                        invoke(event: AddEvent | SubEvent): Promisable<void> {
                            if (event instanceof AddEvent) {
                                this.resultA = event;
                            }
                            if (event instanceof SubEvent) {
                                this.resultB = event;
                            }
                        }
                    }
                    const listener = new Listener();
                    await eventBusA.addListenerMany(
                        [AddEvent, SubEvent],
                        listener,
                    );
                    await eventBusA.removeListenerMany(
                        [AddEvent, SubEvent],
                        listener,
                    );
                    const addEvent = new AddEvent({
                        a: 1,
                        b: 2,
                    });
                    const subEvent = new SubEvent({
                        c: 1,
                        d: 2,
                    });
                    await eventBusA.dispatchMany([addEvent, subEvent]);
                    await LazyPromise.delay(TTL);
                    expect(listener.resultA).toBeNull();
                    expect(listener.resultB).toBeNull();
                });
                test("Function listener", async () => {
                    let resultA: AddEvent | null = null;
                    let resultB: SubEvent | null = null;

                    const listener: InvokableFn<AddEvent | SubEvent> = (
                        event: AddEvent | SubEvent,
                    ): Promisable<void> => {
                        if (event instanceof AddEvent) {
                            resultA = event;
                        }
                        if (event instanceof SubEvent) {
                            resultB = event;
                        }
                    };

                    await eventBusA.addListenerMany(
                        [AddEvent, SubEvent],
                        listener,
                    );
                    await eventBusA.removeListenerMany(
                        [AddEvent, SubEvent],
                        listener,
                    );
                    const addEvent = new AddEvent({
                        a: 1,
                        b: 2,
                    });
                    const subEvent = new SubEvent({
                        c: 1,
                        d: 2,
                    });
                    await eventBusA.dispatchMany([addEvent, subEvent]);
                    await LazyPromise.delay(TTL);
                    expect(resultA).toBeNull();
                    expect(resultB).toBeNull();
                });
            });
        });
        describe("method: subscribe, dispatch", () => {
            describe("Should be null when listener is added and event is not triggered", () => {
                test("Object literal listener", async () => {
                    const listener: IInvokableObject<AddEvent> & {
                        result: AddEvent | null;
                    } = {
                        result: null,
                        invoke(event: AddEvent): Promisable<void> {
                            this.result = event;
                        },
                    };
                    const unsubscribe = await eventBusA.subscribe(
                        AddEvent,
                        listener,
                    );
                    expect(listener.result).toBeNull();
                    await unsubscribe();
                });
                test("Class instance listener", async () => {
                    class Listener implements IInvokableObject<AddEvent> {
                        result: AddEvent | null = null;
                        invoke(event: AddEvent): Promisable<void> {
                            this.result = event;
                        }
                    }
                    const listener = new Listener();
                    const unsubscribe = await eventBusA.subscribe(
                        AddEvent,
                        listener,
                    );
                    expect(listener.result).toBeNull();
                    await unsubscribe();
                });
                test("Function listener", async () => {
                    let result = null as AddEvent | null;
                    const listener: InvokableFn<AddEvent> = (event) => {
                        result = event;
                    };
                    const unsubscribe = await eventBusA.subscribe(
                        AddEvent,
                        listener,
                    );
                    expect(result).toBeNull();
                    await unsubscribe();
                });
            });
            describe("Should be AddEvent when listener is added and event is triggered", () => {
                test("Object literal listener", async () => {
                    const listener: IInvokableObject<AddEvent> & {
                        result: AddEvent | null;
                    } = {
                        result: null,
                        invoke(event: AddEvent): Promisable<void> {
                            this.result = event;
                        },
                    };
                    const unsubscribe = await eventBusA.subscribe(
                        AddEvent,
                        listener,
                    );
                    const event = new AddEvent({
                        a: 1,
                        b: 2,
                    });
                    await eventBusA.dispatch(event);
                    await LazyPromise.delay(TTL);
                    expect(listener.result).toEqual(event);
                    expect(listener.result).toBeInstanceOf(AddEvent);
                    await unsubscribe();
                });
                test("Class instance listener", async () => {
                    class Listener implements IInvokableObject<AddEvent> {
                        result: AddEvent | null = null;
                        invoke(event: AddEvent): Promisable<void> {
                            this.result = event;
                        }
                    }
                    const listener = new Listener();
                    const unsubscribe = await eventBusA.subscribe(
                        AddEvent,
                        listener,
                    );
                    const event = new AddEvent({
                        a: 1,
                        b: 2,
                    });
                    await eventBusA.dispatch(event);
                    await LazyPromise.delay(TTL);
                    expect(listener.result).toEqual(event);
                    expect(listener.result).toBeInstanceOf(AddEvent);
                    await unsubscribe();
                });
                test("Function listener", async () => {
                    let result = null as AddEvent | null;
                    const listener: InvokableFn<AddEvent> = (event) => {
                        result = event;
                    };
                    const unsubscribe = await eventBusA.subscribe(
                        AddEvent,
                        listener,
                    );
                    const event = new AddEvent({
                        a: 1,
                        b: 2,
                    });
                    await eventBusA.dispatch(event);
                    await LazyPromise.delay(TTL);
                    expect(result).toEqual(event);
                    expect(result).toBeInstanceOf(AddEvent);
                    await unsubscribe();
                });
            });
            describe("Should be null when listener removed and event is triggered", () => {
                test("Object literal listener", async () => {
                    const listener: IInvokableObject<AddEvent> & {
                        result: AddEvent | null;
                    } = {
                        result: null,
                        invoke(event: AddEvent): Promisable<void> {
                            this.result = event;
                        },
                    };
                    const unsubscribe = await eventBusA.subscribe(
                        AddEvent,
                        listener,
                    );
                    await unsubscribe();
                    const event = new AddEvent({
                        a: 1,
                        b: 2,
                    });
                    await eventBusA.dispatch(event);
                    await LazyPromise.delay(TTL);
                    expect(listener.result).toBeNull();
                });
                test("Class instance listener", async () => {
                    class Listener implements IInvokableObject<AddEvent> {
                        result: AddEvent | null = null;
                        invoke(event: AddEvent): Promisable<void> {
                            this.result = event;
                        }
                    }
                    const listener = new Listener();
                    const unsubscribe = await eventBusA.subscribe(
                        AddEvent,
                        listener,
                    );
                    await unsubscribe();
                    const event = new AddEvent({
                        a: 1,
                        b: 2,
                    });
                    await eventBusA.dispatch(event);
                    await LazyPromise.delay(TTL);
                    expect(listener.result).toBeNull();
                });
                test("Function listener", async () => {
                    let result = null as AddEvent | null;
                    const listener: InvokableFn<AddEvent> = (event) => {
                        result = event;
                    };
                    const unsubscribe = await eventBusA.subscribe(
                        AddEvent,
                        listener,
                    );
                    await unsubscribe();
                    const event = new AddEvent({
                        a: 1,
                        b: 2,
                    });
                    await eventBusA.dispatch(event);
                    await LazyPromise.delay(TTL);
                    expect(result).toBeNull();
                });
            });
        });
        describe("method: subscribeMany, dispatchMany", () => {
            describe("Should be null when listener is added and event is not triggered", () => {
                test("Object literal listener", async () => {
                    const listener: IInvokableObject<AddEvent | SubEvent> & {
                        resultA: AddEvent | null;
                        resultB: SubEvent | null;
                    } = {
                        resultA: null,
                        resultB: null,
                        invoke(event: AddEvent | SubEvent): Promisable<void> {
                            if (event instanceof AddEvent) {
                                this.resultA = event;
                            }
                            if (event instanceof SubEvent) {
                                this.resultB = event;
                            }
                        },
                    };
                    const unsubscribe = await eventBusA.subscribeMany(
                        [AddEvent, SubEvent],
                        listener,
                    );
                    expect(listener.resultA).toBeNull();
                    expect(listener.resultB).toBeNull();
                    await unsubscribe();
                });
                test("Class instance listener", async () => {
                    class Listener
                        implements IInvokableObject<AddEvent | SubEvent>
                    {
                        resultA: AddEvent | null = null;
                        resultB: SubEvent | null = null;
                        invoke(event: AddEvent | SubEvent): Promisable<void> {
                            if (event instanceof AddEvent) {
                                this.resultA = event;
                            }
                            if (event instanceof SubEvent) {
                                this.resultB = event;
                            }
                        }
                    }
                    const listener = new Listener();
                    const unsubscribe = await eventBusA.subscribeMany(
                        [AddEvent, SubEvent],
                        listener,
                    );
                    expect(listener.resultA).toBeNull();
                    expect(listener.resultB).toBeNull();
                    await unsubscribe();
                });
                test("Function listener", async () => {
                    let resultA = null as AddEvent | null;
                    let resultB = null as SubEvent | null;
                    const listener: InvokableFn<AddEvent | SubEvent> = (
                        event,
                    ) => {
                        if (event instanceof AddEvent) {
                            resultA = event;
                        }
                        if (event instanceof SubEvent) {
                            resultB = event;
                        }
                    };
                    const unsubscribe = await eventBusA.subscribeMany(
                        [AddEvent, SubEvent],
                        listener,
                    );
                    expect(resultA).toBeNull();
                    expect(resultB).toBeNull();
                    await unsubscribe();
                });
            });
            describe("Should be AddEvent and SubEvent when listener is added and event is triggered", () => {
                test("Object literal listener", async () => {
                    const listener: IInvokableObject<AddEvent | SubEvent> & {
                        resultA: AddEvent | null;
                        resultB: SubEvent | null;
                    } = {
                        resultA: null,
                        resultB: null,
                        invoke(event: AddEvent | SubEvent): Promisable<void> {
                            if (event instanceof AddEvent) {
                                this.resultA = event;
                            }
                            if (event instanceof SubEvent) {
                                this.resultB = event;
                            }
                        },
                    };
                    const unsubscribe = await eventBusA.subscribeMany(
                        [AddEvent, SubEvent],
                        listener,
                    );
                    const addEvent = new AddEvent({
                        a: 1,
                        b: 2,
                    });
                    const subEvent = new SubEvent({
                        c: 1,
                        d: 2,
                    });
                    await eventBusA.dispatchMany([addEvent, subEvent]);
                    await LazyPromise.delay(TTL);
                    expect(listener.resultA).toEqual(addEvent);
                    expect(listener.resultA).toBeInstanceOf(AddEvent);
                    expect(listener.resultB).toEqual(subEvent);
                    expect(listener.resultB).toBeInstanceOf(SubEvent);
                    await unsubscribe();
                });
                test("Class instance listener", async () => {
                    class Listener
                        implements IInvokableObject<AddEvent | SubEvent>
                    {
                        resultA: AddEvent | null = null;
                        resultB: SubEvent | null = null;
                        invoke(event: AddEvent | SubEvent): Promisable<void> {
                            if (event instanceof AddEvent) {
                                this.resultA = event;
                            }
                            if (event instanceof SubEvent) {
                                this.resultB = event;
                            }
                        }
                    }
                    const listener = new Listener();
                    const unsubscribe = await eventBusA.subscribeMany(
                        [AddEvent, SubEvent],
                        listener,
                    );
                    const addEvent = new AddEvent({
                        a: 1,
                        b: 2,
                    });
                    const subEvent = new SubEvent({
                        c: 1,
                        d: 2,
                    });
                    await eventBusA.dispatchMany([addEvent, subEvent]);
                    await LazyPromise.delay(TTL);
                    expect(listener.resultA).toEqual(addEvent);
                    expect(listener.resultA).toBeInstanceOf(AddEvent);
                    expect(listener.resultB).toEqual(subEvent);
                    expect(listener.resultB).toBeInstanceOf(SubEvent);
                    await unsubscribe();
                });
                test("Function listener", async () => {
                    let resultA = null as AddEvent | null;
                    let resultB = null as SubEvent | null;
                    const listener: InvokableFn<AddEvent | SubEvent> = (
                        event,
                    ) => {
                        if (event instanceof AddEvent) {
                            resultA = event;
                        }
                        if (event instanceof SubEvent) {
                            resultB = event;
                        }
                    };
                    const unsubscribe = await eventBusA.subscribeMany(
                        [AddEvent, SubEvent],
                        listener,
                    );
                    const addEvent = new AddEvent({
                        a: 1,
                        b: 2,
                    });
                    const subEvent = new SubEvent({
                        c: 1,
                        d: 2,
                    });
                    await eventBusA.dispatchMany([addEvent, subEvent]);
                    await LazyPromise.delay(TTL);
                    expect(resultA).toEqual(addEvent);
                    expect(resultA).toBeInstanceOf(AddEvent);
                    expect(resultB).toEqual(subEvent);
                    expect(resultB).toBeInstanceOf(SubEvent);
                    await unsubscribe();
                });
            });
            describe("Should be null when listener removed and event is triggered", () => {
                test("Object literal listener", async () => {
                    const listener: IInvokableObject<AddEvent | SubEvent> & {
                        resultA: AddEvent | null;
                        resultB: SubEvent | null;
                    } = {
                        resultA: null,
                        resultB: null,
                        invoke(event: AddEvent | SubEvent): Promisable<void> {
                            if (event instanceof AddEvent) {
                                this.resultA = event;
                            }
                            if (event instanceof SubEvent) {
                                this.resultB = event;
                            }
                        },
                    };
                    const unsubscribe = await eventBusA.subscribeMany(
                        [AddEvent, SubEvent],
                        listener,
                    );
                    await unsubscribe();
                    const addEvent = new AddEvent({
                        a: 1,
                        b: 2,
                    });
                    const subEvent = new SubEvent({
                        c: 1,
                        d: 2,
                    });
                    await eventBusA.dispatchMany([addEvent, subEvent]);
                    await LazyPromise.delay(TTL);
                    expect(listener.resultA).toBeNull();
                    expect(listener.resultB).toBeNull();
                });
                test("Class instance listener", async () => {
                    class Listener
                        implements IInvokableObject<AddEvent | SubEvent>
                    {
                        resultA: AddEvent | null = null;
                        resultB: SubEvent | null = null;
                        invoke(event: AddEvent | SubEvent): Promisable<void> {
                            if (event instanceof AddEvent) {
                                this.resultA = event;
                            }
                            if (event instanceof SubEvent) {
                                this.resultB = event;
                            }
                        }
                    }
                    const listener = new Listener();
                    const unsubscribe = await eventBusA.subscribeMany(
                        [AddEvent, SubEvent],
                        listener,
                    );
                    await unsubscribe();
                    const addEvent = new AddEvent({
                        a: 1,
                        b: 2,
                    });
                    const subEvent = new SubEvent({
                        c: 1,
                        d: 2,
                    });
                    await eventBusA.dispatchMany([addEvent, subEvent]);
                    await LazyPromise.delay(TTL);
                    expect(listener.resultA).toBeNull();
                    expect(listener.resultB).toBeNull();
                });
                test("Function listener", async () => {
                    let resultA: AddEvent | null = null;
                    let resultB: SubEvent | null = null;

                    const listener: InvokableFn<AddEvent | SubEvent> = (
                        event: AddEvent | SubEvent,
                    ): Promisable<void> => {
                        if (event instanceof AddEvent) {
                            resultA = event;
                        }
                        if (event instanceof SubEvent) {
                            resultB = event;
                        }
                    };

                    const unsubscribe = await eventBusA.subscribeMany(
                        [AddEvent, SubEvent],
                        listener,
                    );
                    await unsubscribe();
                    const addEvent = new AddEvent({
                        a: 1,
                        b: 2,
                    });
                    const subEvent = new SubEvent({
                        c: 1,
                        d: 2,
                    });
                    await eventBusA.dispatchMany([addEvent, subEvent]);
                    await LazyPromise.delay(TTL);
                    expect(resultA).toBeNull();
                    expect(resultB).toBeNull();
                });
            });
        });
        describe("method: listenOnce", () => {
            describe("Should be null when listener added and event is not triggered", () => {
                test("Object literal listener", async () => {
                    const listener: IInvokableObject<AddEvent> & {
                        result: AddEvent | null;
                    } = {
                        result: null,
                        invoke(event: AddEvent): Promisable<void> {
                            this.result = event;
                        },
                    };
                    await eventBusA.listenOnce(AddEvent, listener);
                    expect(listener.result).toBeNull();
                });
                test("Class instance listener", async () => {
                    class Listener implements IInvokableObject<AddEvent> {
                        result: AddEvent | null = null;
                        invoke(event: AddEvent): Promisable<void> {
                            this.result = event;
                        }
                    }
                    const listener = new Listener();
                    await eventBusA.listenOnce(AddEvent, listener);
                    expect(listener.result).toBeNull();
                });
                test("Function listener", async () => {
                    let result: AddEvent | null = null;
                    const listener: InvokableFn<AddEvent> = (event) => {
                        result = event;
                    };
                    await eventBusA.listenOnce(AddEvent, listener);
                    expect(result).toBeNull();
                });
            });
            describe("Should be AddEvent when listener added and event is triggered", () => {
                test("Object literal listener", async () => {
                    const listener: IInvokableObject<AddEvent> & {
                        result: AddEvent | null;
                    } = {
                        result: null,
                        invoke(event: AddEvent): Promisable<void> {
                            this.result = event;
                        },
                    };
                    await eventBusA.listenOnce(AddEvent, listener);
                    const event: AddEvent = new AddEvent({
                        a: 1,
                        b: 2,
                    });
                    await eventBusA.dispatch(event);
                    await LazyPromise.delay(TTL);
                    expect(listener.result).toEqual(event);
                    expect(listener.result).toBeInstanceOf(AddEvent);
                });
                test("Class instance listener", async () => {
                    class Listener implements IInvokableObject<AddEvent> {
                        result: AddEvent | null = null;
                        invoke(event: AddEvent): Promisable<void> {
                            this.result = event;
                        }
                    }
                    const listener = new Listener();
                    await eventBusA.listenOnce(AddEvent, listener);
                    const event: AddEvent = new AddEvent({
                        a: 1,
                        b: 2,
                    });
                    await eventBusA.dispatch(event);
                    await LazyPromise.delay(TTL);
                    expect(listener.result).toEqual(event);
                    expect(listener.result).toBeInstanceOf(AddEvent);
                });
                test("Function listener", async () => {
                    let result: AddEvent | null = null;
                    const listener: InvokableFn<AddEvent> = (event) => {
                        result = event;
                    };
                    await eventBusA.listenOnce(AddEvent, listener);
                    const event: AddEvent = new AddEvent({
                        a: 1,
                        b: 2,
                    });
                    await eventBusA.dispatch(event);
                    await LazyPromise.delay(TTL);
                    expect(result).toEqual(event);
                    expect(result).toBeInstanceOf(AddEvent);
                });
            });
            describe("Should only listen for event once", () => {
                test("Object literal listener", async () => {
                    const listener: IInvokableObject<AddEvent> & {
                        i: number;
                    } = {
                        i: 0,
                        invoke(_event: AddEvent): Promisable<void> {
                            this.i++;
                        },
                    };
                    await eventBusA.listenOnce(AddEvent, listener);
                    const event: AddEvent = new AddEvent({
                        a: 1,
                        b: 2,
                    });
                    await eventBusA.dispatch(event);
                    await eventBusA.dispatch(event);
                    await LazyPromise.delay(TTL);
                    expect(listener.i).toBe(1);
                });
                test("Class instance listener", async () => {
                    class Listener implements IInvokableObject<AddEvent> {
                        i = 0;
                        invoke(_event: AddEvent): Promisable<void> {
                            this.i++;
                        }
                    }
                    const listener = new Listener();
                    await eventBusA.listenOnce(AddEvent, listener);
                    const event: AddEvent = new AddEvent({
                        a: 1,
                        b: 2,
                    });
                    await eventBusA.dispatch(event);
                    await eventBusA.dispatch(event);
                    await LazyPromise.delay(TTL);
                    expect(listener.i).toBe(1);
                });
                test("Function listener", async () => {
                    let i = 0;
                    const listener: InvokableFn<AddEvent> = () => {
                        i++;
                    };
                    await eventBusA.listenOnce(AddEvent, listener);
                    const event: AddEvent = new AddEvent({
                        a: 1,
                        b: 2,
                    });
                    await eventBusA.dispatch(event);
                    await eventBusA.dispatch(event);
                    await LazyPromise.delay(TTL);
                    expect(i).toBe(1);
                });
            });
        });
        describe("method: asPromise", () => {
            test("Should be null when listener added and event is not triggered", () => {
                let result: AddEvent | null = null;
                const listener: InvokableFn<AddEvent> = (event) => {
                    result = event;
                };
                eventBusA.asPromise(AddEvent).then(listener);
                expect(result).toBeNull();
            });
            test("Should be AddEvent when listener added and event is triggered", async () => {
                let result: AddEvent | null = null;
                const listener: InvokableFn<AddEvent> = (event) => {
                    result = event;
                };
                eventBusA.asPromise(AddEvent).then(listener);
                const event: AddEvent = new AddEvent({
                    a: 1,
                    b: 2,
                });
                await eventBusA.dispatch(event);
                await LazyPromise.delay(TTL);
                expect(result).toEqual(event);
                expect(result).toBeInstanceOf(AddEvent);
            });
        });
    });
    describe("Group tests:", () => {
        test("method: addListener / dispatch", async () => {
            let result_a: AddEvent | null = null;
            await eventBusA.addListener(AddEvent, (event) => {
                result_a = event;
            });

            let result_b: AddEvent | null = null;
            await eventBusB.addListener(AddEvent, (event) => {
                result_b = event;
            });

            const event = new AddEvent({
                a: 1,
                b: 2,
            });
            await eventBusA.dispatch(event);
            await LazyPromise.delay(TTL);

            expect(result_a).toEqual(event);
            expect(result_a).toBeInstanceOf(AddEvent);
            expect(result_b).toBeNull();
        });
        test("method: addListenerMany / dispatch", async () => {
            let result_a: AddEvent | null = null;
            await eventBusA.addListenerMany([AddEvent], (event) => {
                result_a = event;
            });

            let result_b: AddEvent | null = null;
            await eventBusB.addListenerMany([AddEvent], (event) => {
                result_b = event;
            });

            const event = new AddEvent({
                a: 1,
                b: 2,
            });
            await eventBusA.dispatch(event);
            await LazyPromise.delay(TTL);

            expect(result_a).toEqual(event);
            expect(result_a).toBeInstanceOf(AddEvent);
            expect(result_b).toBeNull();
        });
        test("method: removeListener / addListener / dispatch", async () => {
            let result_a: AddEvent | null = null;
            await eventBusA.addListener(AddEvent, (event) => {
                result_a = event;
            });

            let result_b: AddEvent | null = null;
            const listenerB = (event: AddEvent) => {
                result_b = event;
            };
            await eventBusB.addListener(AddEvent, listenerB);
            await eventBusB.removeListener(AddEvent, listenerB);

            const event = new AddEvent({
                a: 1,
                b: 2,
            });
            await eventBusA.dispatch(event);
            await eventBusB.dispatch(event);
            await LazyPromise.delay(TTL);

            expect(result_a).toEqual(event);
            expect(result_a).toBeInstanceOf(AddEvent);
            expect(result_b).toBeNull();
        });
        test("method: removeListenerMany / addListener / dispatch", async () => {
            let result_a: AddEvent | null = null;
            await eventBusA.addListener(AddEvent, (event) => {
                result_a = event;
            });

            let result_b: AddEvent | null = null;
            const listenerB = (event: AddEvent) => {
                result_b = event;
            };
            await eventBusB.addListener(AddEvent, listenerB);
            await eventBusB.removeListenerMany([AddEvent], listenerB);

            const event = new AddEvent({
                a: 1,
                b: 2,
            });
            await eventBusA.dispatch(event);
            await eventBusB.dispatch(event);
            await LazyPromise.delay(TTL);

            expect(result_a).toEqual(event);
            expect(result_a).toBeInstanceOf(AddEvent);
            expect(result_b).toBeNull();
        });
        test("method: subscribe / dispatch", async () => {
            let result_a: BaseEvent | null = null;
            await eventBusA.subscribe(AddEvent, (event) => {
                result_a = event;
            });

            let result_b: BaseEvent | null = null;
            const listenerB = (event: BaseEvent) => {
                result_b = event;
            };
            const unsubscribe = await eventBusB.subscribe(AddEvent, listenerB);
            await unsubscribe();

            const event = new AddEvent({
                a: 1,
                b: 2,
            });
            await eventBusA.dispatch(event);
            await eventBusB.dispatch(event);
            await LazyPromise.delay(TTL);

            expect(result_a).toEqual(event);
            expect(result_a).toBeInstanceOf(AddEvent);
            expect(result_b).toBeNull();
        });
        test("method: subscribeMany / dispatch", async () => {
            let result_a: AddEvent | null = null;
            await eventBusA.subscribeMany([AddEvent], (event) => {
                result_a = event;
            });

            let result_b: AddEvent | null = null;
            const listenerB = (event: AddEvent) => {
                result_b = event;
            };
            const unsubscribe = await eventBusB.subscribeMany(
                [AddEvent],
                listenerB,
            );
            await unsubscribe();

            const event: AddEvent = new AddEvent({
                a: 1,
                b: 2,
            });
            await eventBusA.dispatch(event);
            await eventBusB.dispatch(event);
            await LazyPromise.delay(TTL);

            expect(result_a).toEqual(event);
            expect(result_a).toBeInstanceOf(AddEvent);
            expect(result_b).toBeNull();
        });
        test("method: listenOnce", async () => {
            let result_a: AddEvent | null = null;
            await eventBusA.listenOnce(AddEvent, (event) => {
                result_a = event;
            });

            let result_b: AddEvent | null = null;
            await eventBusB.listenOnce(AddEvent, (event) => {
                result_b = event;
            });

            const event = new AddEvent({
                a: 1,
                b: 2,
            });
            await eventBusA.dispatch(event);
            await LazyPromise.delay(TTL);

            expect(result_a).toEqual(event);
            expect(result_a).toBeInstanceOf(AddEvent);
            expect(result_b).toBeNull();
        });
        test("method: asPromise", async () => {
            let result_a: AddEvent | null = null;
            eventBusA.asPromise(AddEvent).then((event) => {
                result_a = event;
            });

            let result_b: AddEvent | null = null;
            eventBusB.asPromise(AddEvent).then((event) => {
                result_b = event;
            });

            const event = new AddEvent({
                a: 1,
                b: 2,
            });
            await eventBusA.dispatch(event);
            await LazyPromise.delay(TTL);

            expect(result_a).toEqual(event);
            expect(result_a).toBeInstanceOf(AddEvent);
            expect(result_b).toBeNull();
        });
    });
}
