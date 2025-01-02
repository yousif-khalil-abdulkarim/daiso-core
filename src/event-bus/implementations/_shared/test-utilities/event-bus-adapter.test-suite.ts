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
import type {
    IBaseEvent,
    IEventBusAdapter,
} from "@/event-bus/contracts/_module";
import { type Promisable } from "@/_shared/types";
import { delay, TimeSpan } from "@/utilities/_module";

/**
 * @group Utilities
 */
export type EventBusTestSuiteSettings = {
    expect: ExpectStatic;
    test: TestAPI;
    describe: SuiteAPI;
    beforeEach: typeof beforeEach;
    createAdapter: () => Promisable<IEventBusAdapter>;
};
/**
 * @group Utilities
 */
export function eventBusTestSuite(settings: EventBusTestSuiteSettings): void {
    const { expect, test, createAdapter, beforeEach } = settings;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let eventBusAdapter: IEventBusAdapter;
    beforeEach(async () => {
        eventBusAdapter = await createAdapter();
    });

    describe("method: addListener, removeListener, dispatch", () => {
        test("Should be null when listener added and event is not triggered", async () => {
            const TYPE = "type";
            let result: IBaseEvent | null = null;
            await eventBusAdapter.addListener(TYPE, (event) => {
                result = event;
            });
            expect(result).toBeNull();
        });
        test("Should be IBaseEvent when listener added and event is triggered", async () => {
            const TYPE = "type";
            let result: IBaseEvent | null = null;
            await eventBusAdapter.addListener(TYPE, (event) => {
                result = event;
            });
            const event: IBaseEvent = {
                type: TYPE,
            };
            await eventBusAdapter.dispatch([event]);
            await delay(TimeSpan.fromMilliseconds(50));
            expect(result).toEqual(event);
        });
        test("Should be null when listener removed and event is triggered", async () => {
            const TYPE = "type";
            let result: IBaseEvent | null = null;
            const listener = (event: IBaseEvent) => {
                result = event;
            };
            await eventBusAdapter.addListener(TYPE, listener);
            await eventBusAdapter.removeListener(TYPE, listener);
            const event: IBaseEvent = {
                type: TYPE,
            };
            await delay(TimeSpan.fromMilliseconds(50));
            await eventBusAdapter.dispatch([event]);
            expect(result).toBeNull();
        });
    });
}
