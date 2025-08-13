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
import { TimeSpan } from "@/utilities/_module-exports.js";
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
        await LazyPromise.delay(time.addMilliseconds(10));
    }

    describe("method: acquire", () => {
        test("Should return true when key doesnt exists", async () => {
            const key = "a";
            const slotId = "b";
            const limit = 2;
            const ttl = null;

            const result = await adapter.acquire({
                key,
                slotId,
                limit,
                ttl,
            });

            expect(result).toBe(true);
        });
        test("Should return true when limit is not reached", async () => {
            const key = "a";
            const limit = 2;
            const ttl = null;

            const slotId1 = "b";
            await adapter.acquire({
                key,
                slotId: slotId1,
                limit,
                ttl,
            });
            const slotId2 = "c";
            const result = await adapter.acquire({
                key,
                slotId: slotId2,
                limit,
                ttl,
            });

            expect(result).toBe(true);
        });
        test("Should return false when limit is reached", async () => {
            const key = "a";
            const limit = 2;
            const ttl = null;

            const slotId1 = "b";
            await adapter.acquire({
                key,
                slotId: slotId1,
                limit,
                ttl,
            });
            const slotId2 = "c";
            await adapter.acquire({
                key,
                slotId: slotId2,
                limit,
                ttl,
            });
            const slotId3 = "d";
            const result = await adapter.acquire({
                key,
                slotId: slotId3,
                limit,
                ttl,
            });

            expect(result).toBe(false);
        });
        test("Should return true when one slot is expired", async () => {
            const key = "a";
            const limit = 2;

            const slotId1 = "b";
            const ttl1 = null;
            await adapter.acquire({
                key,
                slotId: slotId1,
                limit,
                ttl: ttl1,
            });
            const slotId2 = "c";
            const ttl2 = TimeSpan.fromMilliseconds(50);
            await adapter.acquire({
                key,
                slotId: slotId2,
                limit,
                ttl: ttl2,
            });
            await delay(ttl2);

            const slotId3 = "d";
            const ttl3 = null;
            const result = await adapter.acquire({
                key,
                slotId: slotId3,
                limit,
                ttl: ttl3,
            });

            expect(result).toBe(true);
        });
        test("Should return false when slot exists, is unexpireable and acquired multiple times", async () => {
            const key = "a";
            const slotId = "b";
            const limit = 2;
            const ttl = null;

            await adapter.acquire({
                key,
                slotId,
                limit,
                ttl,
            });
            const result = await adapter.acquire({
                key,
                slotId,
                limit,
                ttl,
            });

            expect(result).toBe(false);
        });
        test("Should return false when slot exists, is unexpired and acquired multiple times", async () => {
            const key = "a";
            const slotId = "b";
            const limit = 2;
            const ttl = TimeSpan.fromMilliseconds(50);

            await adapter.acquire({
                key,
                slotId,
                limit,
                ttl,
            });
            const result = await adapter.acquire({
                key,
                slotId,
                limit,
                ttl,
            });

            expect(result).toBe(false);
        });
        test("Should not acquire a slot when slot exists, is unexpireable and acquired multiple times", async () => {
            const key = "a";
            const limit = 2;
            const ttl = null;

            const slotId1 = "b";
            await adapter.acquire({
                key,
                slotId: slotId1,
                limit,
                ttl,
            });
            await adapter.acquire({
                key,
                slotId: slotId1,
                limit,
                ttl,
            });

            const slotId2 = "c";
            const result = await adapter.acquire({
                key,
                slotId: slotId2,
                limit,
                ttl,
            });

            expect(result).toBe(true);
        });
        test("Should not acquire a slot when slot exists, is unexpired and acquired multiple times", async () => {
            const key = "a";
            const limit = 2;
            const ttl = TimeSpan.fromMilliseconds(50);

            const slotId1 = "b";
            await adapter.acquire({
                key,
                slotId: slotId1,
                limit,
                ttl,
            });
            await adapter.acquire({
                key,
                slotId: slotId1,
                limit,
                ttl,
            });

            const slotId2 = "c";
            const result = await adapter.acquire({
                key,
                slotId: slotId2,
                limit,
                ttl,
            });

            expect(result).toBe(true);
        });
        test("Should not update limit when slot count is more than 0", async () => {
            const key = "a";
            const limit = 2;
            const ttl = null;

            const slotId1 = "b";
            await adapter.acquire({
                key,
                slotId: slotId1,
                limit,
                ttl,
            });
            const slotId2 = "c";
            const newLimit = 3;
            await adapter.acquire({
                key,
                slotId: slotId2,
                limit: newLimit,
                ttl,
            });
            const slotId3 = "b";
            const result = await adapter.acquire({
                key,
                slotId: slotId3,
                limit: newLimit,
                ttl,
            });

            expect(result).toBe(false);
        });
    });
    describe("method: release", () => {
        test("Should return false when key doesnt exists", async () => {
            const key = "a";
            const slotId = "b";

            const result = await adapter.release(key, slotId);

            expect(result).toBe(false);
        });
        test("Should return false when slot doesnt exists", async () => {
            const key = "a";
            const ttl = null;

            const slotId1 = "1";
            await adapter.acquire({
                key,
                slotId: slotId1,
                ttl,
                limit: 2,
            });

            const slotId2 = "2";
            const result = await adapter.release(key, slotId2);

            expect(result).toBe(false);
        });
        test("Should return false when slot exists, is expired", async () => {
            const key = "a";
            const slotId = "b";
            const ttl = TimeSpan.fromMilliseconds(50);
            const limit = 2;

            await adapter.acquire({
                key,
                slotId,
                ttl,
                limit,
            });
            await delay(ttl);
            const result = await adapter.release(key, slotId);

            expect(result).toBe(false);
        });
        test("Should return true when slot exists, is unexpired", async () => {
            const key = "a";
            const slotId = "b";
            const ttl = TimeSpan.fromMilliseconds(50);
            const limit = 2;

            await adapter.acquire({
                key,
                slotId,
                ttl,
                limit,
            });
            const result = await adapter.release(key, slotId);

            expect(result).toBe(true);
        });
        test("Should return true when slot exists, is unexpireable", async () => {
            const key = "a";
            const slotId = "b";
            const ttl = null;
            const limit = 2;

            await adapter.acquire({
                key,
                slotId,
                ttl,
                limit,
            });
            const result = await adapter.release(key, slotId);

            expect(result).toBe(true);
        });
        test("Should update limit when slot count is 0", async () => {
            const key = "a";
            const limit = 2;
            const ttl = null;

            const slotId1 = "b";
            await adapter.acquire({
                key,
                slotId: slotId1,
                limit,
                ttl,
            });
            const slotId2 = "c";
            await adapter.acquire({
                key,
                slotId: slotId2,
                limit,
                ttl,
            });
            await adapter.release(key, slotId1);
            await adapter.release(key, slotId2);

            const newLimit = 1;
            await adapter.acquire({
                key,
                slotId: slotId1,
                limit: newLimit,
                ttl,
            });
            const result = await adapter.acquire({
                key,
                slotId: slotId1,
                limit,
                ttl,
            });

            expect(result).toBe(false);
        });
        test("Should decrement slot count when one slot is released", async () => {
            const key = "a";
            const limit = 2;
            const ttl = null;

            const slotId1 = "1";
            await adapter.acquire({
                key,
                slotId: slotId1,
                limit,
                ttl,
            });
            const slotId2 = "2";
            await adapter.acquire({
                key,
                slotId: slotId2,
                limit,
                ttl,
            });
            await adapter.release(key, slotId1);
            await adapter.release(key, slotId2);

            const slotId3 = "3";
            const result1 = await adapter.acquire({
                key,
                slotId: slotId3,
                limit,
                ttl,
            });
            expect(result1).toBe(true);
            const slotId4 = "4";
            const result2 = await adapter.acquire({
                key,
                slotId: slotId4,
                limit,
                ttl,
            });
            expect(result2).toBe(true);
        });
    });
    describe("method: forceReleaseAll", () => {
        test("Should return false when key doesnt exists", async () => {
            const key = "a";

            const result = await adapter.forceReleaseAll(key);

            expect(result).toBe(false);
        });
        test("Should return false when no slots are acquired", async () => {
            const key = "a";
            const ttl = null;

            const slotId1 = "1";
            await adapter.acquire({
                key,
                slotId: slotId1,
                limit: 2,
                ttl,
            });
            const slotId2 = "2";
            await adapter.acquire({
                key,
                slotId: slotId2,
                limit: 2,
                ttl,
            });
            await adapter.release(key, slotId1);
            await adapter.release(key, slotId2);

            const result = await adapter.forceReleaseAll(key);

            expect(result).toBe(false);
        });
        test("Should return true when at least 1 slot is acquired", async () => {
            const key = "a";
            const ttl = null;

            const slotId1 = "1";
            await adapter.acquire({
                key,
                slotId: slotId1,
                limit: 2,
                ttl,
            });

            const result = await adapter.forceReleaseAll(key);

            expect(result).toBe(true);
        });
        test("Should make all slots reacquirable", async () => {
            const key = "a";
            const limit = 2;
            await adapter.acquire({
                key,
                slotId: "1",
                limit,
                ttl: null,
            });
            await adapter.acquire({
                key,
                slotId: "2",
                limit,
                ttl: TimeSpan.fromMilliseconds(50),
            });

            await adapter.forceReleaseAll(key);

            const result1 = await adapter.acquire({
                key,
                slotId: "3",
                limit,
                ttl: null,
            });
            expect(result1).toBe(true);
            const result2 = await adapter.acquire({
                key,
                slotId: "4",
                limit,
                ttl: null,
            });
            expect(result2).toBe(true);
        });
        test("Should update limit when slot count is 0", async () => {
            const key = "a";
            const limit = 2;
            const ttl = null;

            const slotId1 = "b";
            await adapter.acquire({
                key,
                slotId: slotId1,
                limit,
                ttl,
            });
            const slotId2 = "c";
            await adapter.acquire({
                key,
                slotId: slotId2,
                limit,
                ttl,
            });
            await adapter.forceReleaseAll(key);

            const newLimit = 1;
            await adapter.acquire({
                key,
                slotId: slotId1,
                limit: newLimit,
                ttl,
            });
            const result = await adapter.acquire({
                key,
                slotId: slotId1,
                limit,
                ttl,
            });

            expect(result).toBe(false);
        });
    });
    describe("method: refresh", () => {
        test("Should return false when key doesnt exists", async () => {
            const key = "a";
            const slotId = "b";

            const newTtl = TimeSpan.fromMilliseconds(100);
            const result = await adapter.refresh(key, slotId, newTtl);

            expect(result).toBe(false);
        });
        test("Should return false when slot doesnt exists", async () => {
            const key = "a";
            const ttl = null;

            const slotId1 = "1";
            await adapter.acquire({
                key,
                slotId: slotId1,
                ttl,
                limit: 2,
            });

            const slotId2 = "2";
            const newTtl = TimeSpan.fromMilliseconds(100);
            const result = await adapter.refresh(key, slotId2, newTtl);

            expect(result).toBe(false);
        });
        test("Should return false when slot exists, is expired", async () => {
            const key = "a";
            const slotId = "b";
            const ttl = TimeSpan.fromMilliseconds(50);
            const limit = 2;

            await adapter.acquire({
                key,
                slotId,
                ttl,
                limit,
            });
            await delay(ttl);
            const newTtl = TimeSpan.fromMilliseconds(100);
            const result = await adapter.refresh(key, slotId, newTtl);

            expect(result).toBe(false);
        });
        test("Should return false when slot exists, is unexpireable", async () => {
            const key = "a";
            const slotId = "b";
            const ttl = null;
            const limit = 2;

            await adapter.acquire({
                key,
                slotId,
                ttl,
                limit,
            });
            const newTtl = TimeSpan.fromMilliseconds(100);
            const result = await adapter.refresh(key, slotId, newTtl);

            expect(result).toBe(false);
        });
        test("Should return true when slot exists, is unexpired", async () => {
            const key = "a";
            const slotId = "b";
            const ttl = TimeSpan.fromMilliseconds(50);
            const limit = 2;

            await adapter.acquire({
                key,
                slotId,
                ttl,
                limit,
            });
            const newTtl = TimeSpan.fromMilliseconds(100);
            const result = await adapter.refresh(key, slotId, newTtl);

            expect(result).toBe(true);
        });
        test("Should not update expiration when slot exists, is unexpireable", async () => {
            const key = "a";
            const limit = 2;

            const ttl1 = null;
            const slotId1 = "1";
            await adapter.acquire({
                key,
                slotId: slotId1,
                ttl: ttl1,
                limit,
            });

            const ttl2 = null;
            const slotId2 = "2";
            await adapter.acquire({
                key,
                slotId: slotId2,
                ttl: ttl2,
                limit,
            });

            const newTtl = TimeSpan.fromMilliseconds(100);
            await adapter.refresh(key, slotId2, newTtl);
            await delay(newTtl);

            const slotId3 = "3";
            const result1 = await adapter.acquire({
                key,
                slotId: slotId3,
                ttl: ttl2,
                limit,
            });
            expect(result1).toBe(false);
        });
        test("Should update expiration when slot exists, is unexpired", async () => {
            const key = "a";
            const limit = 2;

            const ttl1 = null;
            const slotId1 = "1";
            await adapter.acquire({
                key,
                slotId: slotId1,
                ttl: ttl1,
                limit,
            });

            const ttl2 = TimeSpan.fromMilliseconds(50);
            const slotId2 = "2";
            await adapter.acquire({
                key,
                slotId: slotId2,
                ttl: ttl2,
                limit,
            });

            const newTtl = TimeSpan.fromMilliseconds(100);
            await adapter.refresh(key, slotId2, newTtl);
            await delay(newTtl.divide(2));

            const slotId3 = "3";
            const result1 = await adapter.acquire({
                key,
                slotId: slotId3,
                ttl: ttl2,
                limit,
            });
            expect(result1).toBe(false);

            await delay(newTtl.divide(2));
            const result2 = await adapter.acquire({
                key,
                slotId: slotId3,
                ttl: ttl2,
                limit,
            });
            expect(result2).toBe(true);
        });
    });
}
