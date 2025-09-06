/**
 * @module SharedLock
 */
import {
    type TestAPI,
    type SuiteAPI,
    type ExpectStatic,
    type beforeEach,
} from "vitest";
import { type ISharedLockAdapter } from "@/shared-lock/contracts/_module-exports.js";
import { type Promisable } from "@/utilities/_module-exports.js";
import type { TimeSpan } from "@/utilities/_module-exports.js";
import { LazyPromise } from "@/async/_module-exports.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/test-utilities"`
 * @group Utilities
 */
export type SharedLockAdapterTestSuiteSettings = {
    expect: ExpectStatic;
    test: TestAPI;
    describe: SuiteAPI;
    beforeEach: typeof beforeEach;
    createAdapter: () => Promisable<ISharedLockAdapter>;
};

/**
 * The `lockAdapterTestSuite` function simplifies the process of testing your custom implementation of {@link ISharedLockAdapter | `ISharedLockAdapter`} with `vitest`.
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/test-utilities"`
 * @group Utilities
 * @example
 * ```ts
 * import { afterEach, beforeEach, describe, expect, test } from "vitest";
 * import { lockAdapterTestSuite } from "@daiso-tech/core/shared-lock/test-utilities";
 * import { RedisSharedLockAdapter } from "@daiso-tech/core/shared-lock/adapters";
 * import { Redis } from "ioredis";
 * import {
 *     RedisContainer,
 *     type StartedRedisContainer,
 * } from "@testcontainers/redis";
 * import { TimeSpan } from "@daiso-tech/core/utilities";
 *
 * const timeout = TimeSpan.fromMinutes(2);
 * describe("class: RedisSharedLockAdapter", () => {
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
 *     lockAdapterTestSuite({
 *         createAdapter: () =>
 *             new RedisSharedLockAdapter(client),
 *         test,
 *         beforeEach,
 *         expect,
 *         describe,
 *     });
 * });
 * ```
 */
export function sharedLockAdapterTestSuite(
    settings: SharedLockAdapterTestSuiteSettings,
): void {
    const { expect, test, createAdapter, describe, beforeEach } = settings;
    let adapter: ISharedLockAdapter;
    beforeEach(async () => {
        adapter = await createAdapter();
    });

    async function delay(time: TimeSpan): Promise<void> {
        await LazyPromise.delay(time.addMilliseconds(10));
    }

    describe("Reusable tests:", () => {
        test.todo("Write tests!!!");
    });
}
