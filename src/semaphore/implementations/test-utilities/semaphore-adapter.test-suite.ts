/**
 * @module Semaphore
 */
import {
    type TestAPI,
    type SuiteAPI,
    type ExpectStatic,
    type beforeEach,
} from "vitest";
import { type ISemaphoreAdapter } from "@/semaphore/contracts/_module-exports.js";
import { type Promisable } from "@/utilities/_module-exports.js";
import type { TimeSpan } from "@/utilities/_module-exports.js";
import { LazyPromise } from "@/async/_module-exports.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/test-utilities"`
 * @group Utilities
 */
export type SemaphoreAdapterTestSuiteSettings = {
    expect: ExpectStatic;
    test: TestAPI;
    describe: SuiteAPI;
    beforeEach: typeof beforeEach;
    createAdapter: () => Promisable<ISemaphoreAdapter>;
};

/**
 * The `semaphoreAdapterTestSuite` function simplifies the process of testing your custom implementation of {@link ISemaphoreAdapter | `ISemaphoreAdapter`} with `vitest`.
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/test-utilities"`
 * @group Utilities
 * @example
 * ```ts
 * import { afterEach, beforeEach, describe, expect, test } from "vitest";
 * import { semaphoreAdapterTestSuite } from "@daiso-tech/core/semaphore/test-utilities";
 * import { RedisSemaphoreAdapter } from "@daiso-tech/core/semaphore/adapters";
 * import { Redis } from "ioredis";
 * import {
 *     RedisContainer,
 *     type StartedRedisContainer,
 * } from "@testcontainers/redis";
 * import { TimeSpan } from "@daiso-tech/core/utilities";
 *
 * const timeout = TimeSpan.fromMinutes(2);
 * describe("class: RedisSemaphoreAdapter", () => {
 *     let client: Redis;
 *     let startedContainer: StartedRedisContainer;
 *     beforeEach(async () => {
 *         startedContainer = await new RedisContainer("redis:7.4.2").start();
 *         client = new Redis(startedContainer.getConnectionUrl());
 *     }, timeout.toMilliseconds());
 *     afterEach(async () => {
 *         await client.quit();
 *         await startedContainer.stop();
 *     }, timeout.toMilliseconds());
 *     semaphoreAdapterTestSuite({
 *         createAdapter: () =>
 *             new RedisSemaphoreAdapter(client),
 *         test,
 *         beforeEach,
 *         expect,
 *         describe,
 *     });
 * });
 * ```
 */
export function semaphoreAdapterTestSuite(
    settings: SemaphoreAdapterTestSuiteSettings,
): void {
    const { expect, test, createAdapter, describe, beforeEach } = settings;
    let adapter: ISemaphoreAdapter;
    beforeEach(async () => {
        adapter = await createAdapter();
    });

    async function delay(time: TimeSpan): Promise<void> {
        await LazyPromise.delay(time);
    }

    describe("method: acquire", () => {
        test.todo("Write tests!!!");
    });
    describe("method: release", () => {
        test.todo("Write tests!!!");
    });
    describe("method: refresh", () => {
        test.todo("Write tests!!!");
    });
}
