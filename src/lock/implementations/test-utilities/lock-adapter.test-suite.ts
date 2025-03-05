/**
 * @module Lock
 */
import {
    type TestAPI,
    type SuiteAPI,
    type ExpectStatic,
    type beforeEach,
} from "vitest";
import { type ILockAdapter } from "@/lock/contracts/_module-exports.js";
import { type Promisable } from "@/utilities/_module-exports.js";
import { TimeSpan } from "@/utilities/_module-exports.js";
import { LazyPromise } from "@/async/_module-exports.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/implementations/test-utilities"```
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
 * The <i>lockAdapterTestSuite</i> function simplifies the process of testing your custom implementation of <i>{@link ILockAdapter}</i> with <i>vitest</i>.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/implementations/test-utilities"```
 * @group Utilities
 * @example
 * ```ts
 * import { afterEach, beforeEach, describe, expect, test } from "vitest";
 * import { lockAdapterTestSuite } from "@daiso-tech/core/lock/implementations/test-utilities";
 * import { RedisLockAdapter } from "@daiso-tech/core/lock/implementations/adapters";
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
 *
 * ```
 */
export function lockAdapterTestSuite(
    settings: LockAdapterTestSuiteSettings,
): void {
    const { expect, test, createAdapter, describe, beforeEach } = settings;
    let lockAdapterA: ILockAdapter;
    beforeEach(async () => {
        lockAdapterA = await createAdapter();
    });

    const ttl = TimeSpan.fromMilliseconds(50);
    describe("method: acquire", () => {
        test("Should return true when key is not acquired", async () => {
            const key = "a";
            const owner = "b";
            const result = await lockAdapterA.acquire(key, owner, null);
            expect(result).toBe(true);
        });
        test("Should return true when key is expired", async () => {
            const key = "a";
            const owner = "b";
            await lockAdapterA.acquire(key, owner, ttl);
            await LazyPromise.delay(ttl);
            const result = await lockAdapterA.acquire(key, owner, null);
            expect(result).toBe(true);
        });
        test("Should return false when key is already acquired by same owner", async () => {
            const key = "a";
            const owner = "b";
            await lockAdapterA.acquire(key, owner, null);
            const result = await lockAdapterA.acquire(key, owner, null);
            expect(result).toBe(false);
        });
        test("Should return false when key is already acquired by different owner", async () => {
            const key = "a";
            const owner1 = "b";
            await lockAdapterA.acquire(key, owner1, null);
            const owner2 = "c";
            const result = await lockAdapterA.acquire(key, owner2, null);
            expect(result).toBe(false);
        });
        test("Should return false when key is already acquired and not expired", async () => {
            const key = "a";
            const owner = "b";
            await lockAdapterA.acquire(key, owner, ttl);
            await LazyPromise.delay(ttl.divide(2));
            const result = await lockAdapterA.acquire(key, owner, null);
            expect(result).toBe(false);
        });
    });
    describe("method: release", () => {
        test("Should return true when key is released by same owner", async () => {
            const key = "a";
            const owner = "b";
            await lockAdapterA.acquire(key, owner, null);
            const result = await lockAdapterA.release(key, owner);
            expect(result).toBe(true);
        });
        test("Should return false when key is tried to be released by different owner", async () => {
            const key = "a";
            const owner1 = "b";
            await lockAdapterA.acquire(key, owner1, null);
            const owner2 = "c";
            const result = await lockAdapterA.release(key, owner2);
            expect(result).toBe(false);
        });
        test("Should be reacquirable by new owner after release", async () => {
            const key = "a";
            const owner1 = "b";
            await lockAdapterA.acquire(key, owner1, null);
            await lockAdapterA.release(key, owner1);
            const owner2 = "c";
            const result = await lockAdapterA.acquire(key, owner2, null);
            expect(result).toBe(true);
        });
    });
    describe("method: forceRelease", () => {
        test("Should be reacquirable by new owner after release", async () => {
            const key = "a";
            const owner1 = "b";
            await lockAdapterA.acquire(key, owner1, null);
            await lockAdapterA.forceRelease(key);
            const owner2 = "c";
            const result = await lockAdapterA.acquire(key, owner2, null);
            expect(result).toBe(true);
        });
    });
    describe("method: refresh", () => {
        test("Should return true when extended by same owner", async () => {
            const key = "a";
            const owner = "b";

            await lockAdapterA.acquire(key, owner, ttl);
            const result = await lockAdapterA.refresh(
                key,
                owner,
                ttl.multiply(2),
            );

            expect(result).toBe(true);
        });
        test("Should return false when extended by different owner", async () => {
            const key = "a";
            const owner1 = "b";

            await lockAdapterA.acquire(key, owner1, ttl);
            const owner2 = "c";
            const result = await lockAdapterA.refresh(
                key,
                owner2,
                ttl.multiply(2),
            );

            expect(result).toBe(false);
        });
    });
}
