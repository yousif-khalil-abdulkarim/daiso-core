/**
 * @module Cache
 */

import {
    type TestAPI,
    type SuiteAPI,
    type ExpectStatic,
    type beforeEach,
} from "vitest";
import { type ICacheAdapter } from "@/new-cache/contracts/_module.js";
import { type Promisable } from "@/utilities/_module.js";
import { Task } from "@/task/implementations/_module.js";
import { TimeSpan } from "@/time-span/implementations/_module.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/test-utilities"`
 * @group TestUtilities
 */
export type CacheAdapterTestSuiteSettings = {
    expect: ExpectStatic;
    test: TestAPI;
    describe: SuiteAPI;
    beforeEach: typeof beforeEach;
    createAdapter: () => Promisable<ICacheAdapter>;
};

/**
 * The `cacheAdapterTestSuite` function simplifies the process of testing your custom implementation of {@link ICacheAdapter | `ICacheAdapter`} with `vitest`.
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/test-utilities"`
 * @group TestUtilities
 * @example
 * ```ts
 * import { afterEach, beforeEach, describe, expect, test } from "vitest";
 * import { Redis } from "ioredis";
 * import {
 *   RedisContainer,
 *   type StartedRedisContainer,
 * } from "@testcontainers/redis";
 * import { cacheAdapterTestSuite } from "@daiso-tech/core/cache/test-utilities";
 * import { RedisCacheAdapter } from "@daiso-tech/core/cache/redis-cache-adapter";
 * import { TimeSpan } from "@daiso-tech/core/time-span" from "@daiso-tech/core/time-span";
 * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/super-json-serde-adapter";
 * import { Serde } from "@daiso-tech/core/serde";
 *
 * const timeout = TimeSpan.fromMinutes(2);
 * describe("class: RedisCacheAdapter", () => {
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
 *     cacheAdapterTestSuite({
 *         createAdapter: () =>
 *             new RedisCacheAdapter({
 *                 database: client,
 *                 serde: new Serde(new SuperJsonSerdeAdapter()),
 *             }),
 *         test,
 *         beforeEach,
 *         expect,
 *         describe,
 *     });
 * });
 * ```
 */
export function cacheAdapterTestSuite(
    settings: CacheAdapterTestSuiteSettings,
): void {
    const { expect, test, createAdapter, describe, beforeEach } = settings;
    let adapter: ICacheAdapter<any>;
    beforeEach(async () => {
        adapter = await createAdapter();
    });

    const TTL = TimeSpan.fromMilliseconds(50);
    describe("Reusable tests:", () => {
        test.todo("Write tests!!!");
    });
}
