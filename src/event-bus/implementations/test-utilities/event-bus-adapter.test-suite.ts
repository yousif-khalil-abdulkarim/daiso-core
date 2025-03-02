/**
 * @module EventBus
 */

import {
    type TestAPI,
    type SuiteAPI,
    type ExpectStatic,
    type beforeEach,
    describe,
} from "vitest";
import type { IEventBusAdapter } from "@/event-bus/contracts/_module-exports.js";
import { BaseEvent } from "@/event-bus/contracts/_module-exports.js";
import { type Promisable } from "@/utilities/_module-exports.js";
import { TimeSpan } from "@/utilities/_module-exports.js";
import { delay } from "@/async/_module-exports.js";
import type { IFlexibleSerde } from "@/serde/contracts/_module-exports.js";
import { Serde } from "@/serde/implementations/derivables/_module-exports.js";
import { NoOpSerdeAdapter } from "@/serde/implementations/adapters/_module-exports.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/implementations/test-utilities"```
 * @group Test utilities
 */
export type EventBusAdapterTestSuiteSettings = {
    expect: ExpectStatic;
    serde?: IFlexibleSerde;
    test: TestAPI;
    describe: SuiteAPI;
    beforeEach: typeof beforeEach;
    createAdapter: () => Promisable<IEventBusAdapter>;
};

/**
 * The <i>eventBusAdapterTestSuite</i> function simplifies the process of testing your custom implementation of <i>{@link IEventBusAdapter}</i> with vitest.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/implementations/test-utilities"```
 * @group Test utilities
 */
export function eventBusAdapterTestSuite(
    settings: EventBusAdapterTestSuiteSettings,
): void {
    const {
        expect,
        test,
        createAdapter,
        beforeEach,
        serde = new Serde(new NoOpSerdeAdapter()),
    } = settings;

    let adapter: IEventBusAdapter;
    beforeEach(async () => {
        adapter = await createAdapter();
    });

    const TTL = TimeSpan.fromMilliseconds(50);
    class TestEvent extends BaseEvent {}
    serde.registerEvent(TestEvent);
    describe("method: addListener, removeListener, dispatch", () => {
        test("Should be null when listener added and event is not triggered", async () => {
            let result: BaseEvent | null = null;
            await adapter.addListener(TestEvent.name, (event: BaseEvent) => {
                result = event;
            });
            expect(result).toBeNull();
        });
        test("Should be TestEvent when listener added and event is triggered", async () => {
            let result: BaseEvent | null = null;
            await adapter.addListener(TestEvent.name, (event: BaseEvent) => {
                result = event;
            });
            const event = new TestEvent({
                type: BaseEvent.name,
            });
            await adapter.dispatch(TestEvent.name, event);
            await delay(TTL);
            expect(result).toEqual(event);
            expect(result).toBeInstanceOf(TestEvent);
        });
        test("Should be null when listener removed and event is triggered", async () => {
            let result: BaseEvent | null = null;
            const listener = (event: BaseEvent) => {
                result = event;
            };
            await adapter.addListener(TestEvent.name, listener);
            await adapter.removeListener(TestEvent.name, listener);
            const event = new TestEvent({
                type: BaseEvent.name,
            });
            await adapter.dispatch(TestEvent.name, event);
            await delay(TTL);
            expect(result).toBeNull();
        });
    });
}
