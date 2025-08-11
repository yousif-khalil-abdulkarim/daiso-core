/**
 * @module Lock
 */
import {
    type TestAPI,
    type SuiteAPI,
    type ExpectStatic,
    type beforeEach,
} from "vitest";
import {
    LOCK_REFRESH_RESULT,
    type ILockAdapter,
} from "@/lock/contracts/_module-exports.js";
import { type Promisable } from "@/utilities/_module-exports.js";
import { TimeSpan } from "@/utilities/_module-exports.js";
import { LazyPromise } from "@/async/_module-exports.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/test-utilities"`
 * @group Utilities
 */
export type LockAdapterTestSuiteSettings = {
    expect: ExpectStatic;
    test: TestAPI;
    describe: SuiteAPI;
    beforeEach: typeof beforeEach;
    createAdapter: () => Promisable<ILockAdapter>;
};

/**
 * The `lockAdapterTestSuite` function simplifies the process of testing your custom implementation of {@link ILockAdapter | `ILockAdapter`} with `vitest`.
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/test-utilities"`
 * @group Utilities
 * @example
 * ```ts
 * import { afterEach, beforeEach, describe, expect, test } from "vitest";
 * import { lockAdapterTestSuite } from "@daiso-tech/core/lock/test-utilities";
 * import { RedisLockAdapter } from "@daiso-tech/core/lock/adapters";
 * import { Redis } from "ioredis";
 * import {
 *     RedisContainer,
 *     type StartedRedisContainer,
 * } from "@testcontainers/redis";
 * import { TimeSpan } from "@daiso-tech/core/utilities";
 *
 * const timeout = TimeSpan.fromMinutes(2);
 * describe("class: RedisLockAdapter", () => {
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
 *             new RedisLockAdapter(client),
 *         test,
 *         beforeEach,
 *         expect,
 *         describe,
 *     });
 * });
 * ```
 */
export function lockAdapterTestSuite(
    settings: LockAdapterTestSuiteSettings,
): void {
    const { expect, test, createAdapter, describe, beforeEach } = settings;
    let adapter: ILockAdapter;
    beforeEach(async () => {
        adapter = await createAdapter();
    });

    async function delay(time: TimeSpan): Promise<void> {
        await LazyPromise.delay(time.addMilliseconds(10));
    }

    describe("method: acquire", () => {
        test("Should return true when key doesnt exists", async () => {
            const key = "a";
            const owner = "b";
            const ttl = null;

            const result = await adapter.acquire(key, owner, ttl);

            expect(result).toBe(true);
        });
        test("Should return true when key is expired", async () => {
            const key = "a";
            const owner = "b";
            const ttl = TimeSpan.fromMilliseconds(50);

            await adapter.acquire(key, owner, ttl);
            await delay(ttl);

            const result = await adapter.acquire(key, owner, null);
            expect(result).toBe(true);
        });
        test("Should return false when key is unexpireable and acquired by same owner", async () => {
            const key = "a";
            const owner = "b";
            const ttl = null;

            await adapter.acquire(key, owner, ttl);
            const result = await adapter.acquire(key, owner, ttl);

            expect(result).toBe(false);
        });
        test("Should return false when key is unexpired and acquired by same owner", async () => {
            const key = "a";
            const owner = "b";
            const ttl = TimeSpan.fromMilliseconds(50);

            await adapter.acquire(key, owner, ttl);
            const result = await adapter.acquire(key, owner, ttl);

            expect(result).toBe(false);
        });
        test("Should return false when key is unexpireable and acquired by different owner", async () => {
            const key = "a";
            const owner1 = "b";
            const ttl = null;

            await adapter.acquire(key, owner1, ttl);
            const owner2 = "c";
            const result = await adapter.acquire(key, owner2, ttl);

            expect(result).toBe(false);
        });
        test("Should return false when key is unexpired and acquired by different owner", async () => {
            const key = "a";
            const owner1 = "b";
            const ttl = TimeSpan.fromMilliseconds(50);

            await adapter.acquire(key, owner1, ttl);
            const owner2 = "c";
            const result = await adapter.acquire(key, owner2, ttl);

            expect(result).toBe(false);
        });
    });
    describe("method: release", () => {
        test("Should return false when key doesnt exists", async () => {
            const key = "a";
            const owner = "b";

            const result = await adapter.release(key, owner);

            expect(result).toBe(false);
        });
        test("Should return false when key is unexpireable and released by different owner", async () => {
            const key = "a";
            const owner1 = "b";
            const ttl = null;
            await adapter.acquire(key, owner1, ttl);

            const owner2 = "c";
            const result = await adapter.release(key, owner2);

            expect(result).toBe(false);
        });
        test("Should return false when key is unexpired and released by different owner", async () => {
            const key = "a";
            const owner1 = "b";
            const ttl = TimeSpan.fromMilliseconds(50);
            await adapter.acquire(key, owner1, ttl);

            const owner2 = "c";
            const result = await adapter.release(key, owner2);

            expect(result).toBe(false);
        });
        test("Should return false when key is expired and released by different owner", async () => {
            const key = "a";
            const owner1 = "b";
            const ttl = TimeSpan.fromMilliseconds(50);
            await adapter.acquire(key, owner1, ttl);

            const owner2 = "c";
            const result = await adapter.release(key, owner2);
            await delay(ttl);

            expect(result).toBe(false);
        });
        test("Should return false when key is expired and released by same owner", async () => {
            const key = "a";
            const owner = "b";
            const ttl = TimeSpan.fromMilliseconds(50);
            await adapter.acquire(key, owner, ttl);
            await delay(ttl);

            const result = await adapter.release(key, owner);

            expect(result).toBe(false);
        });
        test("Should return true when key is unexpireable and released by same owner", async () => {
            const key = "a";
            const owner = "b";
            const ttl = null;
            await adapter.acquire(key, owner, ttl);

            const result = await adapter.release(key, owner);

            expect(result).toBe(true);
        });
        test("Should return true when key is unexpired and released by same owner", async () => {
            const key = "a";
            const owner = "b";
            const ttl = TimeSpan.fromMilliseconds(50);
            await adapter.acquire(key, owner, ttl);

            const result = await adapter.release(key, owner);

            expect(result).toBe(true);
        });
        test("Should not be reacquirable when key is unexpireable and released by different owner", async () => {
            const key = "a";
            const owner1 = "b";
            const ttl = null;
            await adapter.acquire(key, owner1, ttl);
            const owner2 = "c";

            await adapter.release(key, owner2);
            const result = await adapter.acquire(key, owner2, ttl);

            expect(result).toBe(false);
        });
        test("Should not be reacquirable when key is unexpired and released by different owner", async () => {
            const key = "a";
            const owner1 = "b";
            const ttl = TimeSpan.fromMilliseconds(50);
            await adapter.acquire(key, owner1, ttl);

            const owner2 = "c";
            await adapter.release(key, owner2);
            const result = await adapter.acquire(key, owner2, ttl);

            expect(result).toBe(false);
        });
        test("Should be reacquirable when key is unexpireable and released by same owner", async () => {
            const key = "a";
            const owner1 = "b";
            const ttl = null;
            await adapter.acquire(key, owner1, ttl);
            await adapter.release(key, owner1);

            const owner2 = "c";
            const result = await adapter.acquire(key, owner2, ttl);

            expect(result).toBe(true);
        });
        test("Should be reacquirable when key is unexpired and released by same owner", async () => {
            const key = "a";
            const owner1 = "b";
            const ttl = TimeSpan.fromMilliseconds(50);
            await adapter.acquire(key, owner1, ttl);
            await adapter.release(key, owner1);

            const owner2 = "c";
            const result = await adapter.acquire(key, owner2, ttl);

            expect(result).toBe(true);
        });
    });
    describe("method: forceRelease", () => {
        test("Should return false when key doesnt exists", async () => {
            const key = "a";

            const result = await adapter.forceRelease(key);

            expect(result).toBe(false);
        });
        test("Should return false when key is expired", async () => {
            const key = "a";
            const owner = "b";
            const ttl = TimeSpan.fromMilliseconds(50);

            await adapter.acquire(key, owner, ttl);
            await delay(ttl);

            const result = await adapter.forceRelease(key);

            expect(result).toBe(false);
        });
        test("Should return true when key is uenxpired", async () => {
            const key = "a";
            const owner = "b";
            const ttl = TimeSpan.fromMilliseconds(50);

            await adapter.acquire(key, owner, ttl);

            const result = await adapter.forceRelease(key);

            expect(result).toBe(true);
        });
        test("Should return true when key is unexpireable", async () => {
            const key = "a";
            const owner = "b";
            const ttl = null;

            await adapter.acquire(key, owner, ttl);

            const result = await adapter.forceRelease(key);

            expect(result).toBe(true);
        });
        test("Should be reacquirable when force released", async () => {
            const key = "a";
            const owner1 = "b";
            const ttl = null;
            await adapter.acquire(key, owner1, ttl);

            await adapter.forceRelease(key);

            const owner2 = "c";
            const result = await adapter.acquire(key, owner2, ttl);
            expect(result).toBe(true);
        });
    });
    describe("method: refresh", () => {
        test("Should return LOCK_REFRESH.UNOWNED_REFRESH when key doesnt exists", async () => {
            const key = "a";
            const owner = "b";

            const newTtl = TimeSpan.fromMinutes(1);
            const result = await adapter.refresh(key, owner, newTtl);

            expect(result).toBe(LOCK_REFRESH_RESULT.UNOWNED_REFRESH);
        });
        test("Should return LOCK_REFRESH.UNOWNED_REFRESH when key is unexpireable and refreshed by different owner", async () => {
            const key = "a";
            const owner1 = "b";
            const ttl = null;
            await adapter.acquire(key, owner1, ttl);

            const newTtl = TimeSpan.fromMinutes(1);
            const owner2 = "c";
            const result = await adapter.refresh(key, owner2, newTtl);

            expect(result).toBe(LOCK_REFRESH_RESULT.UNOWNED_REFRESH);
        });
        test("Should return LOCK_REFRESH.UNOWNED_REFRESH when key is unexpired and refreshed by different owner", async () => {
            const key = "a";
            const owner1 = "b";
            const ttl = TimeSpan.fromMilliseconds(50);
            await adapter.acquire(key, owner1, ttl);

            const newTtl = TimeSpan.fromMinutes(1);
            const owner2 = "c";
            const result = await adapter.refresh(key, owner2, newTtl);

            expect(result).toBe(LOCK_REFRESH_RESULT.UNOWNED_REFRESH);
        });
        test("Should return LOCK_REFRESH.UNOWNED_REFRESH when key is expired and refreshed by different owner", async () => {
            const key = "a";
            const owner1 = "b";
            const ttl = TimeSpan.fromMilliseconds(50);
            await adapter.acquire(key, owner1, ttl);
            await delay(ttl);

            const newTtl = TimeSpan.fromMinutes(1);
            const owner2 = "c";
            const result = await adapter.refresh(key, owner2, newTtl);

            expect(result).toBe(LOCK_REFRESH_RESULT.UNOWNED_REFRESH);
        });
        test("Should return LOCK_REFRESH.UNOWNED_REFRESH when key is expired and refreshed by same owner", async () => {
            const key = "a";
            const owner = "b";
            const ttl = TimeSpan.fromMilliseconds(50);
            await adapter.acquire(key, owner, ttl);
            await delay(ttl);

            const newTtl = TimeSpan.fromMinutes(1);
            const result = await adapter.refresh(key, owner, newTtl);

            expect(result).toBe(LOCK_REFRESH_RESULT.UNOWNED_REFRESH);
        });
        test("Should return LOCK_REFRESH.UNEXPIRABLE_KEY when key is unexpireable and refreshed by same owner", async () => {
            const key = "a";
            const owner = "b";
            const ttl = null;
            await adapter.acquire(key, owner, ttl);

            const newTtl = TimeSpan.fromMinutes(1);
            const result = await adapter.refresh(key, owner, newTtl);

            expect(result).toBe(LOCK_REFRESH_RESULT.UNEXPIRABLE_KEY);
        });
        test("Should return LOCK_REFRESH.REFRESHED when key is unexpired and refreshed by same owner", async () => {
            const key = "a";
            const owner = "b";
            const ttl = TimeSpan.fromMilliseconds(50);
            await adapter.acquire(key, owner, ttl);

            const newTtl = TimeSpan.fromMinutes(1);
            const result = await adapter.refresh(key, owner, newTtl);

            expect(result).toBe(LOCK_REFRESH_RESULT.REFRESHED);
        });
        test("Should not update expiration when key is unexpireable and refreshed by same owner", async () => {
            const key = "a";
            const owner1 = "b";
            const ttl = null;
            await adapter.acquire(key, owner1, ttl);

            const newTtl = TimeSpan.fromMilliseconds(50);
            await adapter.refresh(key, owner1, newTtl);
            await delay(newTtl);
            const owner2 = "b";
            const result = await adapter.acquire(key, owner2, ttl);

            expect(result).toBe(false);
        });
        test("Should update expiration when key is unexpired and refreshed by same owner", async () => {
            const key = "a";
            const owner1 = "b";
            const ttl = TimeSpan.fromMilliseconds(50);
            await adapter.acquire(key, owner1, ttl);

            const newTtl = TimeSpan.fromMilliseconds(100);
            await adapter.refresh(key, owner1, newTtl);
            await delay(newTtl.divide(2));

            const owner2 = "c";
            const result1 = await adapter.acquire(key, owner2, ttl);
            expect(result1).toBe(false);

            await delay(newTtl.divide(2));
            const result2 = await adapter.acquire(key, owner2, ttl);
            expect(result2).toBe(true);
        });
    });
}
