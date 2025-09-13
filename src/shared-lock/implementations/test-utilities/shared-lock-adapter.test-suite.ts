/**
 * @module SharedLock
 */
import {
    type TestAPI,
    type SuiteAPI,
    type ExpectStatic,
    type beforeEach,
} from "vitest";
import {
    type ISharedLockAdapter,
    type ISharedLockAdapterState,
} from "@/shared-lock/contracts/_module-exports.js";
import { type Promisable } from "@/utilities/_module-exports.js";
import { TimeSpan } from "@/utilities/_module-exports.js";
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

    async function delay(time: TimeSpan): Promise<void> {
        await LazyPromise.delay(time.addMilliseconds(10));
    }

    describe("Reusable tests:", () => {
        beforeEach(async () => {
            adapter = await createAdapter();
        });
        describe("method: acquireWriter", () => {
            test("Should return true when key doesnt exists", async () => {
                const key = "a";
                const owner = "b";
                const ttl = null;

                const result = await adapter.acquireWriter(key, owner, ttl);

                expect(result).toBe(true);
            });
            test("Should return true when key is expired", async () => {
                const key = "a";
                const owner = "b";
                const ttl = TimeSpan.fromMilliseconds(50);

                await adapter.acquireWriter(key, owner, ttl);
                await delay(ttl);

                const result = await adapter.acquireWriter(key, owner, null);
                expect(result).toBe(true);
            });
            test("Should return true when key is unexpireable and acquired by same owner", async () => {
                const key = "a";
                const owner = "b";
                const ttl = null;

                await adapter.acquireWriter(key, owner, ttl);
                const result = await adapter.acquireWriter(key, owner, ttl);

                expect(result).toBe(true);
            });
            test("Should return true when key is unexpired and acquired by same owner", async () => {
                const key = "a";
                const owner = "b";
                const ttl = TimeSpan.fromMilliseconds(50);

                await adapter.acquireWriter(key, owner, ttl);
                const result = await adapter.acquireWriter(key, owner, ttl);

                expect(result).toBe(true);
            });
            test("Should return false when key is unexpireable and acquired by different owner", async () => {
                const key = "a";
                const owner1 = "b";
                const ttl = null;

                await adapter.acquireWriter(key, owner1, ttl);
                const owner2 = "c";
                const result = await adapter.acquireWriter(key, owner2, ttl);

                expect(result).toBe(false);
            });
            test("Should return false when key is unexpired and acquired by different owner", async () => {
                const key = "a";
                const owner1 = "b";
                const ttl = TimeSpan.fromMilliseconds(50);

                await adapter.acquireWriter(key, owner1, ttl);
                const owner2 = "c";
                const result = await adapter.acquireWriter(key, owner2, ttl);

                expect(result).toBe(false);
            });
            test("Should return false when key is acquired as reader", async () => {
                const key = "a";
                const lockId = "1";
                const limit = 2;
                const ttl = null;

                await adapter.acquireReader({
                    key,
                    lockId,
                    limit,
                    ttl,
                });

                const hasAcquired = await adapter.acquireWriter(
                    key,
                    lockId,
                    ttl,
                );
                expect(hasAcquired).toBe(false);
            });
            test("Should not update state when key is acquired as reader", async () => {
                const key = "a";
                const lockId = "1";
                const limit = 2;
                const ttl = null;

                await adapter.acquireReader({
                    key,
                    lockId,
                    limit,
                    ttl,
                });

                await adapter.acquireWriter(key, lockId, ttl);

                const state = await adapter.getState(key);

                expect({
                    ...state,
                    reader: {
                        ...state,
                        acquiredSlots: Object.fromEntries(
                            state?.reader?.acquiredSlots.entries() ?? [],
                        ),
                    },
                }).toEqual({
                    writer: null,
                    reader: {
                        limit,
                        acquiredSlots: {
                            [lockId]: ttl,
                        },
                    },
                });
            });
        });
        describe("method: releaseWriter", () => {
            test("Should return false when key doesnt exists", async () => {
                const key = "a";
                const owner = "b";

                const result = await adapter.releaseWriter(key, owner);

                expect(result).toBe(false);
            });
            test("Should return false when key is unexpireable and released by different owner", async () => {
                const key = "a";
                const owner1 = "b";
                const ttl = null;
                await adapter.acquireWriter(key, owner1, ttl);

                const owner2 = "c";
                const result = await adapter.releaseWriter(key, owner2);

                expect(result).toBe(false);
            });
            test("Should return false when key is unexpired and released by different owner", async () => {
                const key = "a";
                const owner1 = "b";
                const ttl = TimeSpan.fromMilliseconds(50);
                await adapter.acquireWriter(key, owner1, ttl);

                const owner2 = "c";
                const result = await adapter.releaseWriter(key, owner2);

                expect(result).toBe(false);
            });
            test("Should return false when key is expired and released by different owner", async () => {
                const key = "a";
                const owner1 = "b";
                const ttl = TimeSpan.fromMilliseconds(50);
                await adapter.acquireWriter(key, owner1, ttl);

                const owner2 = "c";
                const result = await adapter.releaseWriter(key, owner2);
                await delay(ttl);

                expect(result).toBe(false);
            });
            test("Should return false when key is expired and released by same owner", async () => {
                const key = "a";
                const owner = "b";
                const ttl = TimeSpan.fromMilliseconds(50);
                await adapter.acquireWriter(key, owner, ttl);
                await delay(ttl);

                const result = await adapter.releaseWriter(key, owner);

                expect(result).toBe(false);
            });
            test("Should return true when key is unexpireable and released by same owner", async () => {
                const key = "a";
                const owner = "b";
                const ttl = null;
                await adapter.acquireWriter(key, owner, ttl);

                const result = await adapter.releaseWriter(key, owner);

                expect(result).toBe(true);
            });
            test("Should return true when key is unexpired and released by same owner", async () => {
                const key = "a";
                const owner = "b";
                const ttl = TimeSpan.fromMilliseconds(50);
                await adapter.acquireWriter(key, owner, ttl);

                const result = await adapter.releaseWriter(key, owner);

                expect(result).toBe(true);
            });
            test("Should not be reacquirable when key is unexpireable and released by different owner", async () => {
                const key = "a";
                const owner1 = "b";
                const ttl = null;
                await adapter.acquireWriter(key, owner1, ttl);
                const owner2 = "c";

                await adapter.releaseWriter(key, owner2);
                const result = await adapter.acquireWriter(key, owner2, ttl);

                expect(result).toBe(false);
            });
            test("Should not be reacquirable when key is unexpired and released by different owner", async () => {
                const key = "a";
                const owner1 = "b";
                const ttl = TimeSpan.fromMilliseconds(50);
                await adapter.acquireWriter(key, owner1, ttl);

                const owner2 = "c";
                await adapter.releaseWriter(key, owner2);
                const result = await adapter.acquireWriter(key, owner2, ttl);

                expect(result).toBe(false);
            });
            test("Should be reacquirable when key is unexpireable and released by same owner", async () => {
                const key = "a";
                const owner1 = "b";
                const ttl = null;
                await adapter.acquireWriter(key, owner1, ttl);
                await adapter.releaseWriter(key, owner1);

                const owner2 = "c";
                const result = await adapter.acquireWriter(key, owner2, ttl);

                expect(result).toBe(true);
            });
            test("Should be reacquirable when key is unexpired and released by same owner", async () => {
                const key = "a";
                const owner1 = "b";
                const ttl = TimeSpan.fromMilliseconds(50);
                await adapter.acquireWriter(key, owner1, ttl);
                await adapter.releaseWriter(key, owner1);

                const owner2 = "c";
                const result = await adapter.acquireWriter(key, owner2, ttl);

                expect(result).toBe(true);
            });
            test("Should return false when key is acquired as reader", async () => {
                const key = "a";
                const lockId = "1";
                const limit = 2;
                const ttl = TimeSpan.fromSeconds(10);

                await adapter.acquireReader({
                    key,
                    lockId,
                    limit,
                    ttl,
                });

                const hasAcquired = await adapter.releaseWriter(key, lockId);

                expect(hasAcquired).toBe(false);
            });
            test("Should not update state when key is acquired as reader", async () => {
                const key = "a";
                const lockId = "1";
                const limit = 2;
                const ttl = null;

                await adapter.acquireReader({
                    key,
                    lockId,
                    limit,
                    ttl,
                });

                await adapter.releaseWriter(key, lockId);

                const state = await adapter.getState(key);

                expect({
                    ...state,
                    reader: {
                        ...state,
                        acquiredSlots: Object.fromEntries(
                            state?.reader?.acquiredSlots.entries() ?? [],
                        ),
                    },
                }).toEqual({
                    writer: null,
                    reader: {
                        limit,
                        acquiredSlots: {
                            [lockId]: ttl,
                        },
                    },
                });
            });
        });
        describe("method: forceReleaseWriter", () => {
            test("Should return false when key doesnt exists", async () => {
                const key = "a";

                const result = await adapter.forceReleaseWriter(key);

                expect(result).toBe(false);
            });
            test("Should return false when key is expired", async () => {
                const key = "a";
                const owner = "b";
                const ttl = TimeSpan.fromMilliseconds(50);

                await adapter.acquireWriter(key, owner, ttl);
                await delay(ttl);

                const result = await adapter.forceReleaseWriter(key);

                expect(result).toBe(false);
            });
            test("Should return true when key is uenxpired", async () => {
                const key = "a";
                const owner = "b";
                const ttl = TimeSpan.fromMilliseconds(50);

                await adapter.acquireWriter(key, owner, ttl);

                const result = await adapter.forceReleaseWriter(key);

                expect(result).toBe(true);
            });
            test("Should return true when key is unexpireable", async () => {
                const key = "a";
                const owner = "b";
                const ttl = null;

                await adapter.acquireWriter(key, owner, ttl);

                const result = await adapter.forceReleaseWriter(key);

                expect(result).toBe(true);
            });
            test("Should be reacquirable when key is force released", async () => {
                const key = "a";
                const owner1 = "b";
                const ttl = null;
                await adapter.acquireWriter(key, owner1, ttl);

                await adapter.forceReleaseWriter(key);

                const owner2 = "c";
                const result = await adapter.acquireWriter(key, owner2, ttl);
                expect(result).toBe(true);
            });
            test("Should return false when key is acquired as reader", async () => {
                const key = "a";
                const lockId = "1";
                const limit = 2;
                const ttl = TimeSpan.fromSeconds(10);

                await adapter.acquireReader({
                    key,
                    lockId,
                    limit,
                    ttl,
                });

                const hasAcquired = await adapter.forceReleaseWriter(key);

                expect(hasAcquired).toBe(false);
            });
            test("Should not update state when key is acquired as reader", async () => {
                const key = "a";
                const lockId = "1";
                const limit = 2;
                const ttl = null;

                await adapter.acquireReader({
                    key,
                    lockId,
                    limit,
                    ttl,
                });

                await adapter.forceReleaseWriter(key);

                const state = await adapter.getState(key);

                expect({
                    ...state,
                    reader: {
                        ...state,
                        acquiredSlots: Object.fromEntries(
                            state?.reader?.acquiredSlots.entries() ?? [],
                        ),
                    },
                }).toEqual({
                    writer: null,
                    reader: {
                        limit,
                        acquiredSlots: {
                            [lockId]: ttl,
                        },
                    },
                });
            });
        });
        describe("method: refreshWriter", () => {
            test("Should return false when key doesnt exists", async () => {
                const key = "a";
                const owner = "b";

                const newTtl = TimeSpan.fromMinutes(1);
                const result = await adapter.refreshWriter(key, owner, newTtl);

                expect(result).toBe(false);
            });
            test("Should return false when key is unexpireable and refreshed by different owner", async () => {
                const key = "a";
                const owner1 = "b";
                const ttl = null;
                await adapter.acquireWriter(key, owner1, ttl);

                const newTtl = TimeSpan.fromMinutes(1);
                const owner2 = "c";
                const result = await adapter.refreshWriter(key, owner2, newTtl);

                expect(result).toBe(false);
            });
            test("Should return false when key is unexpired and refreshed by different owner", async () => {
                const key = "a";
                const owner1 = "b";
                const ttl = TimeSpan.fromMilliseconds(50);
                await adapter.acquireWriter(key, owner1, ttl);

                const newTtl = TimeSpan.fromMinutes(1);
                const owner2 = "c";
                const result = await adapter.refreshWriter(key, owner2, newTtl);

                expect(result).toBe(false);
            });
            test("Should return false when key is expired and refreshed by different owner", async () => {
                const key = "a";
                const owner1 = "b";
                const ttl = TimeSpan.fromMilliseconds(50);
                await adapter.acquireWriter(key, owner1, ttl);
                await delay(ttl);

                const newTtl = TimeSpan.fromMinutes(1);
                const owner2 = "c";
                const result = await adapter.refreshWriter(key, owner2, newTtl);

                expect(result).toBe(false);
            });
            test("Should return false when key is expired and refreshed by same owner", async () => {
                const key = "a";
                const owner = "b";
                const ttl = TimeSpan.fromMilliseconds(50);
                await adapter.acquireWriter(key, owner, ttl);
                await delay(ttl);

                const newTtl = TimeSpan.fromMinutes(1);
                const result = await adapter.refreshWriter(key, owner, newTtl);

                expect(result).toBe(false);
            });
            test("Should return false when key is unexpireable and refreshed by same owner", async () => {
                const key = "a";
                const owner = "b";
                const ttl = null;
                await adapter.acquireWriter(key, owner, ttl);

                const newTtl = TimeSpan.fromMinutes(1);
                const result = await adapter.refreshWriter(key, owner, newTtl);

                expect(result).toBe(false);
            });
            test("Should return true when key is unexpired and refreshed by same owner", async () => {
                const key = "a";
                const owner = "b";
                const ttl = TimeSpan.fromMilliseconds(50);
                await adapter.acquireWriter(key, owner, ttl);

                const newTtl = TimeSpan.fromMinutes(1);
                const result = await adapter.refreshWriter(key, owner, newTtl);

                expect(result).toBe(true);
            });
            test("Should not update expiration when key is unexpireable and refreshed by same owner", async () => {
                const key = "a";
                const owner1 = "b";
                const ttl = null;
                await adapter.acquireWriter(key, owner1, ttl);

                const newTtl = TimeSpan.fromMilliseconds(50);
                await adapter.refreshWriter(key, owner1, newTtl);
                await delay(newTtl);
                const owner2 = "b";
                const result = await adapter.acquireWriter(key, owner2, ttl);

                expect(result).toBe(true);
            });
            test("Should update expiration when key is unexpired and refreshed by same owner", async () => {
                const key = "a";
                const owner1 = "b";
                const ttl = TimeSpan.fromMilliseconds(50);
                await adapter.acquireWriter(key, owner1, ttl);

                const newTtl = TimeSpan.fromMilliseconds(100);
                await adapter.refreshWriter(key, owner1, newTtl);
                await delay(newTtl.divide(2));

                const owner2 = "c";
                const result1 = await adapter.acquireWriter(key, owner2, ttl);
                expect(result1).toBe(false);

                await delay(newTtl.divide(2));
                const result2 = await adapter.acquireWriter(key, owner2, ttl);
                expect(result2).toBe(true);
            });
            test("Should return false when key is acquired as reader", async () => {
                const key = "a";
                const lockId = "1";
                const limit = 2;
                const ttl = TimeSpan.fromSeconds(10);

                await adapter.acquireReader({
                    key,
                    lockId,
                    limit,
                    ttl,
                });

                const newTtl = TimeSpan.fromSeconds(20);
                const hasAcquired = await adapter.refreshWriter(
                    key,
                    lockId,
                    newTtl,
                );

                expect(hasAcquired).toBe(false);
            });
            test("Should not update state when key is acquired as reader", async () => {
                const key = "a";
                const lockId = "1";
                const limit = 2;
                const ttl = null;

                await adapter.acquireReader({
                    key,
                    lockId,
                    limit,
                    ttl,
                });

                const newTtl = TimeSpan.fromSeconds(20);
                await adapter.refreshWriter(key, lockId, newTtl);

                const state = await adapter.getState(key);

                expect({
                    ...state,
                    reader: {
                        ...state,
                        acquiredSlots: Object.fromEntries(
                            state?.reader?.acquiredSlots.entries() ?? [],
                        ),
                    },
                }).toEqual({
                    writer: null,
                    reader: {
                        limit,
                        acquiredSlots: {
                            [lockId]: ttl,
                        },
                    },
                });
            });
        });
        describe("method: acquireReader", () => {
            test("Should return true when key doesnt exists", async () => {
                const key = "a";
                const lockId = "b";
                const limit = 2;
                const ttl = null;

                const result = await adapter.acquireReader({
                    key,
                    lockId,
                    limit,
                    ttl,
                });

                expect(result).toBe(true);
            });
            test("Should return true when key exists and slot is expired", async () => {
                const key = "a";
                const lockId = "b";
                const limit = 2;
                const ttl = TimeSpan.fromMilliseconds(50);

                await adapter.acquireReader({
                    key,
                    lockId,
                    limit,
                    ttl,
                });
                await delay(ttl);

                const result = await adapter.acquireReader({
                    key,
                    lockId,
                    limit,
                    ttl,
                });

                expect(result).toBe(true);
            });
            test("Should return true when limit is not reached", async () => {
                const key = "a";
                const limit = 2;
                const ttl = null;

                const lockId1 = "1";
                await adapter.acquireReader({
                    key,
                    lockId: lockId1,
                    limit,
                    ttl,
                });
                const lockId2 = "2";
                const result = await adapter.acquireReader({
                    key,
                    lockId: lockId2,
                    limit,
                    ttl,
                });

                expect(result).toBe(true);
            });
            test("Should return false when limit is reached", async () => {
                const key = "a";
                const limit = 2;
                const ttl = null;

                const lockId1 = "1";
                await adapter.acquireReader({
                    key,
                    lockId: lockId1,
                    limit,
                    ttl,
                });
                const lockId2 = "2";
                await adapter.acquireReader({
                    key,
                    lockId: lockId2,
                    limit,
                    ttl,
                });
                const lockId3 = "3";
                const result = await adapter.acquireReader({
                    key,
                    lockId: lockId3,
                    limit,
                    ttl,
                });

                expect(result).toBe(false);
            });
            test("Should return true when one slot is expired", async () => {
                const key = "a";
                const limit = 2;

                const lockId1 = "1";
                const ttl1 = null;
                await adapter.acquireReader({
                    key,
                    lockId: lockId1,
                    limit,
                    ttl: ttl1,
                });
                const lockId2 = "2";
                const ttl2 = TimeSpan.fromMilliseconds(50);
                await adapter.acquireReader({
                    key,
                    lockId: lockId2,
                    limit,
                    ttl: ttl2,
                });
                await delay(ttl2);

                const lockId3 = "3";
                const ttl3 = null;
                const result = await adapter.acquireReader({
                    key,
                    lockId: lockId3,
                    limit,
                    ttl: ttl3,
                });

                expect(result).toBe(true);
            });
            test("Should return true when slot exists, is unexpireable and acquired multiple times", async () => {
                const key = "a";
                const lockId = "b";
                const limit = 2;
                const ttl = null;

                await adapter.acquireReader({
                    key,
                    lockId,
                    limit,
                    ttl,
                });
                const result = await adapter.acquireReader({
                    key,
                    lockId,
                    limit,
                    ttl,
                });

                expect(result).toBe(true);
            });
            test("Should return true when slot exists, is unexpired and acquired multiple times", async () => {
                const key = "a";
                const lockId = "b";
                const limit = 2;
                const ttl = TimeSpan.fromMilliseconds(50);

                await adapter.acquireReader({
                    key,
                    lockId,
                    limit,
                    ttl,
                });
                const result = await adapter.acquireReader({
                    key,
                    lockId,
                    limit,
                    ttl,
                });

                expect(result).toBe(true);
            });
            test("Should not acquire a slot when slot exists, is unexpireable and acquired multiple times", async () => {
                const key = "a";
                const limit = 2;
                const ttl = null;

                const lockId1 = "1";
                await adapter.acquireReader({
                    key,
                    lockId: lockId1,
                    limit,
                    ttl,
                });
                await adapter.acquireReader({
                    key,
                    lockId: lockId1,
                    limit,
                    ttl,
                });

                const lockId2 = "2";
                const result = await adapter.acquireReader({
                    key,
                    lockId: lockId2,
                    limit,
                    ttl,
                });

                expect(result).toBe(true);
            });
            test("Should not acquire a slot when slot exists, is unexpired and acquired multiple times", async () => {
                const key = "a";
                const limit = 2;
                const ttl = TimeSpan.fromMilliseconds(50);

                const lockId1 = "1";
                await adapter.acquireReader({
                    key,
                    lockId: lockId1,
                    limit,
                    ttl,
                });
                await adapter.acquireReader({
                    key,
                    lockId: lockId1,
                    limit,
                    ttl,
                });

                const lockId2 = "2";
                const result = await adapter.acquireReader({
                    key,
                    lockId: lockId2,
                    limit,
                    ttl,
                });

                expect(result).toBe(true);
            });
            test("Should not update limit when slot count is more than 0", async () => {
                const key = "a";
                const limit = 2;
                const ttl = null;

                const lockId1 = "1";
                await adapter.acquireReader({
                    key,
                    lockId: lockId1,
                    limit,
                    ttl,
                });
                const lockId2 = "2";
                const newLimit = 3;
                await adapter.acquireReader({
                    key,
                    lockId: lockId2,
                    limit: newLimit,
                    ttl,
                });
                const lockId3 = "3";

                const result1 = await adapter.getState(key);
                expect(result1?.reader?.limit).toBe(limit);

                const result2 = await adapter.acquireReader({
                    key,
                    lockId: lockId3,
                    limit: newLimit,
                    ttl,
                });
                expect(result2).toBe(false);
            });
            test("Should return false when key is acquired as writer", async () => {
                const key = "a";
                const lockId = "1";
                const ttl = null;
                await adapter.acquireWriter(key, lockId, ttl);

                const limit = 3;
                const hasAcquired = await adapter.acquireReader({
                    key,
                    lockId,
                    ttl,
                    limit,
                });

                expect(hasAcquired).toBe(false);
            });
            test("Should not update state when key is acquired as writer", async () => {
                const key = "a";
                const lockId = "1";
                const ttl = null;
                await adapter.acquireWriter(key, lockId, ttl);

                const limit = 3;
                await adapter.acquireReader({
                    key,
                    lockId,
                    ttl,
                    limit,
                });

                const state = await adapter.getState(key);

                expect(state).toEqual({
                    writer: {
                        owner: lockId,
                        expiration: ttl,
                    },
                    reader: null,
                } satisfies ISharedLockAdapterState);
            });
        });
        describe("method: releaseReader", () => {
            test("Should return false when key doesnt exists", async () => {
                const key = "a";
                const lockId = "b";
                const limit = 2;
                const ttl = null;
                await adapter.acquireReader({
                    key,
                    lockId,
                    limit,
                    ttl,
                });

                const noneExistingKey = "c";
                const result = await adapter.releaseReader(
                    noneExistingKey,
                    lockId,
                );

                expect(result).toBe(false);
            });
            test("Should return false when slot doesnt exists", async () => {
                const key = "a";
                const ttl = null;
                const limit = 2;

                const lockId = "1";
                await adapter.acquireReader({
                    key,
                    lockId,
                    ttl,
                    limit,
                });

                const noneExistingSlotId = "2";
                const result = await adapter.releaseReader(
                    key,
                    noneExistingSlotId,
                );

                expect(result).toBe(false);
            });
            test("Should return false when slot is expired", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);
                const limit = 2;

                const lockId1 = "1";
                await adapter.acquireReader({
                    key,
                    lockId: lockId1,
                    ttl,
                    limit,
                });
                await delay(ttl);

                const lockId2 = "2";
                const result = await adapter.releaseReader(key, lockId2);

                expect(result).toBe(false);
            });
            test("Should return false when slot exists, is expired", async () => {
                const key = "a";
                const lockId = "b";
                const ttl = TimeSpan.fromMilliseconds(50);
                const limit = 2;

                await adapter.acquireReader({
                    key,
                    lockId,
                    ttl,
                    limit,
                });
                await delay(ttl);
                const result = await adapter.releaseReader(key, lockId);

                expect(result).toBe(false);
            });
            test("Should return true when slot exists, is unexpired", async () => {
                const key = "a";
                const lockId = "b";
                const ttl = TimeSpan.fromMilliseconds(50);
                const limit = 2;

                await adapter.acquireReader({
                    key,
                    lockId,
                    ttl,
                    limit,
                });
                const result = await adapter.releaseReader(key, lockId);

                expect(result).toBe(true);
            });
            test("Should return true when slot exists, is unexpireable", async () => {
                const key = "a";
                const lockId = "b";
                const ttl = null;
                const limit = 2;

                await adapter.acquireReader({
                    key,
                    lockId,
                    ttl,
                    limit,
                });
                const result = await adapter.releaseReader(key, lockId);

                expect(result).toBe(true);
            });
            test("Should update limit when slot count is 0", async () => {
                const key = "a";
                const limit = 2;
                const ttl = null;

                const lockId1 = "1";
                await adapter.acquireReader({
                    key,
                    lockId: lockId1,
                    limit,
                    ttl,
                });
                const lockId2 = "2";
                await adapter.acquireReader({
                    key,
                    lockId: lockId2,
                    limit,
                    ttl,
                });
                await adapter.releaseReader(key, lockId1);
                await adapter.releaseReader(key, lockId2);

                const newLimit = 3;
                const lockId3 = "3";
                await adapter.acquireReader({
                    key,
                    lockId: lockId3,
                    limit: newLimit,
                    ttl,
                });

                const result1 = await adapter.getState(key);
                expect(result1?.reader?.limit).toBe(newLimit);

                const lockId4 = "4";
                await adapter.acquireReader({
                    key,
                    lockId: lockId4,
                    limit: newLimit,
                    ttl,
                });

                const lockId5 = "5";
                const result2 = await adapter.acquireReader({
                    key,
                    lockId: lockId5,
                    limit: newLimit,
                    ttl,
                });
                expect(result2).toBe(true);

                const lockId6 = "6";
                const result3 = await adapter.acquireReader({
                    key,
                    lockId: lockId6,
                    limit,
                    ttl,
                });
                expect(result3).toBe(false);
            });
            test("Should decrement slot count when one slot is released", async () => {
                const key = "a";
                const limit = 2;
                const ttl = null;

                const lockId1 = "1";
                await adapter.acquireReader({
                    key,
                    lockId: lockId1,
                    limit,
                    ttl,
                });
                const lockId2 = "2";
                await adapter.acquireReader({
                    key,
                    lockId: lockId2,
                    limit,
                    ttl,
                });
                await adapter.releaseReader(key, lockId1);

                const result1 = await adapter.getState(key);
                expect(result1?.reader?.acquiredSlots.size).toBe(1);

                await adapter.releaseReader(key, lockId2);

                const lockId3 = "3";
                const result2 = await adapter.acquireReader({
                    key,
                    lockId: lockId3,
                    limit,
                    ttl,
                });
                expect(result2).toBe(true);

                const lockId4 = "4";
                const result3 = await adapter.acquireReader({
                    key,
                    lockId: lockId4,
                    limit,
                    ttl,
                });
                expect(result3).toBe(true);
            });
            test("Should return false when key is acquired as writer", async () => {
                const key = "a";
                const lockId = "1";
                const ttl = null;
                await adapter.acquireWriter(key, lockId, ttl);

                const hasAcquired = await adapter.releaseReader(key, lockId);

                expect(hasAcquired).toBe(false);
            });
            test("Should not update state when key is acquired as writer", async () => {
                const key = "a";
                const lockId = "1";
                const ttl = null;
                await adapter.acquireWriter(key, lockId, ttl);

                await adapter.releaseReader(key, lockId);

                const state = await adapter.getState(key);

                expect(state).toEqual({
                    writer: {
                        owner: lockId,
                        expiration: ttl,
                    },
                    reader: null,
                } satisfies ISharedLockAdapterState);
            });
        });
        describe("method: forceReleaseAllReaders", () => {
            test("Should return false when key doesnt exists", async () => {
                const key = "a";
                const lockId = "b";
                const limit = 2;
                const ttl = null;
                await adapter.acquireReader({
                    key,
                    lockId,
                    limit,
                    ttl,
                });

                const noneExistingKey = "c";
                const result =
                    await adapter.forceReleaseAllReaders(noneExistingKey);

                expect(result).toBe(false);
            });
            test("Should return false when slot is expired", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);
                const limit = 2;
                const lockId = "1";

                await adapter.acquireReader({
                    key,
                    lockId,
                    limit,
                    ttl,
                });
                await delay(ttl);

                const result = await adapter.forceReleaseAllReaders(key);

                expect(result).toBe(false);
            });
            test("Should return false when no slots are acquired", async () => {
                const key = "a";
                const ttl = null;
                const lockId1 = "1";
                const limit = 2;

                await adapter.acquireReader({
                    key,
                    lockId: lockId1,
                    limit,
                    ttl,
                });
                const lockId2 = "2";
                await adapter.acquireReader({
                    key,
                    lockId: lockId2,
                    limit,
                    ttl,
                });
                await adapter.releaseReader(key, lockId1);
                await adapter.releaseReader(key, lockId2);

                const result = await adapter.forceReleaseAllReaders(key);

                expect(result).toBe(false);
            });
            test("Should return true when at least 1 slot is acquired", async () => {
                const key = "a";
                const ttl = null;
                const limit = 2;
                const lockId = "1";

                await adapter.acquireReader({
                    key,
                    lockId,
                    limit,
                    ttl,
                });

                const result = await adapter.forceReleaseAllReaders(key);

                expect(result).toBe(true);
            });
            test("Should make all slots reacquirable", async () => {
                const key = "a";
                const limit = 2;
                const lockId1 = "1";
                const ttl1 = null;
                await adapter.acquireReader({
                    key,
                    lockId: lockId1,
                    limit,
                    ttl: ttl1,
                });
                const lockId2 = "2";
                const ttl2 = TimeSpan.fromMilliseconds(50);
                await adapter.acquireReader({
                    key,
                    lockId: lockId2,
                    limit,
                    ttl: ttl2,
                });

                await adapter.forceReleaseAllReaders(key);

                const lockId3 = "3";
                const ttl3 = null;
                const result1 = await adapter.acquireReader({
                    key,
                    lockId: lockId3,
                    limit,
                    ttl: ttl3,
                });
                expect(result1).toBe(true);
                const lockId4 = "4";
                const ttl4 = null;
                const result2 = await adapter.acquireReader({
                    key,
                    lockId: lockId4,
                    limit,
                    ttl: ttl4,
                });
                expect(result2).toBe(true);
            });
            test("Should update limit when slot count is 0", async () => {
                const key = "a";
                const limit = 2;
                const ttl = null;

                const lockId1 = "1";
                await adapter.acquireReader({
                    key,
                    lockId: lockId1,
                    limit,
                    ttl,
                });
                const lockId2 = "2";
                await adapter.acquireReader({
                    key,
                    lockId: lockId2,
                    limit,
                    ttl,
                });
                await adapter.forceReleaseAllReaders(key);

                const newLimit = 3;
                const lockId3 = "3";
                await adapter.acquireReader({
                    key,
                    lockId: lockId3,
                    limit: newLimit,
                    ttl,
                });

                const result1 = await adapter.getState(key);
                expect(result1?.reader?.limit).toBe(newLimit);

                const lockId4 = "4";
                await adapter.acquireReader({
                    key,
                    lockId: lockId4,
                    limit: newLimit,
                    ttl,
                });

                const lockId5 = "5";
                const result2 = await adapter.acquireReader({
                    key,
                    lockId: lockId5,
                    limit: newLimit,
                    ttl,
                });
                expect(result2).toBe(true);

                const lockId6 = "6";
                const result3 = await adapter.acquireReader({
                    key,
                    lockId: lockId6,
                    limit,
                    ttl,
                });
                expect(result3).toBe(false);
            });
            test("Should return false when key is acquired as writer", async () => {
                const key = "a";
                const lockId = "1";
                const ttl = null;
                await adapter.acquireWriter(key, lockId, ttl);

                const hasAcquired = await adapter.forceReleaseAllReaders(key);

                expect(hasAcquired).toBe(false);
            });
            test("Should not update state when key is acquired as writer", async () => {
                const key = "a";
                const lockId = "1";
                const ttl = null;
                await adapter.acquireWriter(key, lockId, ttl);

                await adapter.forceReleaseAllReaders(key);

                const state = await adapter.getState(key);

                expect(state).toEqual({
                    writer: {
                        owner: lockId,
                        expiration: ttl,
                    },
                    reader: null,
                } satisfies ISharedLockAdapterState);
            });
        });
        describe("method: refreshReader", () => {
            test("Should return false when key doesnt exists", async () => {
                const key = "a";
                const lockId = "b";
                const limit = 2;
                const ttl = null;
                await adapter.acquireReader({
                    key,
                    lockId,
                    limit,
                    ttl,
                });

                const newTtl = TimeSpan.fromMilliseconds(100);
                const noneExistingKey = "c";
                const result = await adapter.refreshReader(
                    noneExistingKey,
                    lockId,
                    newTtl,
                );

                expect(result).toBe(false);
            });
            test("Should return false when slot doesnt exists", async () => {
                const key = "a";
                const ttl = null;
                const limit = 2;

                const lockId = "b";
                await adapter.acquireReader({
                    key,
                    lockId,
                    ttl,
                    limit,
                });

                const noneExistingSlotId = "c";
                const newTtl = TimeSpan.fromMilliseconds(100);
                const result = await adapter.refreshReader(
                    key,
                    noneExistingSlotId,
                    newTtl,
                );

                expect(result).toBe(false);
            });
            test("Should return false when slot is expired", async () => {
                const key = "a";
                const lockId = "b";
                const limit = 2;
                const ttl = TimeSpan.fromMilliseconds(50);
                await adapter.acquireReader({
                    key,
                    lockId,
                    limit,
                    ttl,
                });
                await delay(ttl);

                const newTtl = TimeSpan.fromMilliseconds(100);
                const result = await adapter.refreshReader(key, lockId, newTtl);

                expect(result).toBe(false);
            });
            test("Should return false when slot exists, is expired", async () => {
                const key = "a";
                const lockId = "b";
                const ttl = TimeSpan.fromMilliseconds(50);
                const limit = 2;

                await adapter.acquireReader({
                    key,
                    lockId,
                    ttl,
                    limit,
                });
                await delay(ttl);
                const newTtl = TimeSpan.fromMilliseconds(100);
                const result = await adapter.refreshReader(key, lockId, newTtl);

                expect(result).toBe(false);
            });
            test("Should return false when slot exists, is unexpireable", async () => {
                const key = "a";
                const lockId = "b";
                const ttl = null;
                const limit = 2;

                await adapter.acquireReader({
                    key,
                    lockId,
                    ttl,
                    limit,
                });
                const newTtl = TimeSpan.fromMilliseconds(100);
                const result = await adapter.refreshReader(key, lockId, newTtl);

                expect(result).toBe(false);
            });
            test("Should return true when slot exists, is unexpired", async () => {
                const key = "a";
                const lockId = "b";
                const ttl = TimeSpan.fromMilliseconds(50);
                const limit = 2;

                await adapter.acquireReader({
                    key,
                    lockId,
                    ttl,
                    limit,
                });
                const newTtl = TimeSpan.fromMilliseconds(100);
                const result = await adapter.refreshReader(key, lockId, newTtl);

                expect(result).toBe(true);
            });
            test("Should not update expiration when slot exists, is unexpireable", async () => {
                const key = "a";
                const limit = 2;

                const ttl1 = null;
                const lockId1 = "1";
                await adapter.acquireReader({
                    key,
                    lockId: lockId1,
                    ttl: ttl1,
                    limit,
                });

                const ttl2 = null;
                const lockId2 = "2";
                await adapter.acquireReader({
                    key,
                    lockId: lockId2,
                    ttl: ttl2,
                    limit,
                });

                const newTtl = TimeSpan.fromMilliseconds(100);
                await adapter.refreshReader(key, lockId2, newTtl);
                await delay(newTtl);

                const lockId3 = "3";
                const result1 = await adapter.acquireReader({
                    key,
                    lockId: lockId3,
                    ttl: ttl2,
                    limit,
                });
                expect(result1).toBe(false);
            });
            test("Should update expiration when slot exists, is unexpired", async () => {
                const key = "a";
                const limit = 2;

                const ttl1 = null;
                const lockId1 = "1";
                await adapter.acquireReader({
                    key,
                    lockId: lockId1,
                    ttl: ttl1,
                    limit,
                });

                const ttl2 = TimeSpan.fromMilliseconds(50);
                const lockId2 = "2";
                await adapter.acquireReader({
                    key,
                    lockId: lockId2,
                    ttl: ttl2,
                    limit,
                });

                const newTtl = TimeSpan.fromMilliseconds(100);
                await adapter.refreshReader(key, lockId2, newTtl);
                await delay(newTtl.divide(2));

                const lockId3 = "3";
                const result1 = await adapter.acquireReader({
                    key,
                    lockId: lockId3,
                    ttl: ttl2,
                    limit,
                });
                expect(result1).toBe(false);

                await delay(newTtl.divide(2));
                const result2 = await adapter.acquireReader({
                    key,
                    lockId: lockId3,
                    ttl: ttl2,
                    limit,
                });
                expect(result2).toBe(true);
            });
            test("Should return false when key is acquired as writer", async () => {
                const key = "a";
                const lockId = "1";
                const ttl = null;
                await adapter.acquireWriter(key, lockId, ttl);

                const newTtl = TimeSpan.fromSeconds(20);
                const hasAcquired = await adapter.refreshReader(
                    key,
                    lockId,
                    newTtl,
                );

                expect(hasAcquired).toBe(false);
            });
            test("Should not update state when key is acquired as writer", async () => {
                const key = "a";
                const lockId = "1";
                const ttl = null;
                await adapter.acquireWriter(key, lockId, ttl);

                const newTtl = TimeSpan.fromSeconds(20);
                await adapter.refreshReader(key, lockId, newTtl);

                const state = await adapter.getState(key);

                expect(state).toEqual({
                    writer: {
                        owner: lockId,
                        expiration: ttl,
                    },
                    reader: null,
                } satisfies ISharedLockAdapterState);
            });
        });
        describe("method: forceRelease", () => {
            test("Should return false when key doesnt exists", async () => {
                const key = "a";

                const result = await adapter.forceRelease(key);

                expect(result).toBe(false);
            });
            test("Should return false when key is in writer mode and is expired", async () => {
                const key = "a";
                const owner = "b";
                const ttl = TimeSpan.fromMilliseconds(50);

                await adapter.acquireWriter(key, owner, ttl);
                await delay(ttl);

                const result = await adapter.forceRelease(key);

                expect(result).toBe(false);
            });
            test("Should return true when key is in writer mode and is uenxpired", async () => {
                const key = "a";
                const owner = "b";
                const ttl = TimeSpan.fromMilliseconds(50);

                await adapter.acquireWriter(key, owner, ttl);

                const result = await adapter.forceRelease(key);

                expect(result).toBe(true);
            });
            test("Should return true when key is in writer mode and is unexpireable", async () => {
                const key = "a";
                const owner = "b";
                const ttl = null;

                await adapter.acquireWriter(key, owner, ttl);

                const result = await adapter.forceRelease(key);

                expect(result).toBe(true);
            });
            test("Should be reacquirable when key is in writer mode and is force released", async () => {
                const key = "a";
                const owner1 = "b";
                const ttl = null;
                await adapter.acquireWriter(key, owner1, ttl);

                await adapter.forceRelease(key);

                const owner2 = "c";
                const result = await adapter.acquireWriter(key, owner2, ttl);
                expect(result).toBe(true);
            });
            test("Should return false when key is in reader mode and slot is expired", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);
                const limit = 2;
                const lockId = "1";

                await adapter.acquireReader({
                    key,
                    lockId,
                    limit,
                    ttl,
                });
                await delay(ttl);

                const result = await adapter.forceRelease(key);

                expect(result).toBe(false);
            });
            test("Should return false when key is in reader mode and no slots are acquired", async () => {
                const key = "a";
                const ttl = null;
                const lockId1 = "1";
                const limit = 2;

                await adapter.acquireReader({
                    key,
                    lockId: lockId1,
                    limit,
                    ttl,
                });
                const lockId2 = "2";
                await adapter.acquireReader({
                    key,
                    lockId: lockId2,
                    limit,
                    ttl,
                });
                await adapter.releaseReader(key, lockId1);
                await adapter.releaseReader(key, lockId2);

                const result = await adapter.forceRelease(key);

                expect(result).toBe(false);
            });
            test("Should return true when key is in reader mode and at least 1 slot is acquired", async () => {
                const key = "a";
                const ttl = null;
                const limit = 2;
                const lockId = "1";

                await adapter.acquireReader({
                    key,
                    lockId,
                    limit,
                    ttl,
                });

                const result = await adapter.forceRelease(key);

                expect(result).toBe(true);
            });
            test("Should make all slots reacquirable when key is in reader mode", async () => {
                const key = "a";
                const limit = 2;
                const lockId1 = "1";
                const ttl1 = null;
                await adapter.acquireReader({
                    key,
                    lockId: lockId1,
                    limit,
                    ttl: ttl1,
                });
                const lockId2 = "2";
                const ttl2 = TimeSpan.fromMilliseconds(50);
                await adapter.acquireReader({
                    key,
                    lockId: lockId2,
                    limit,
                    ttl: ttl2,
                });

                await adapter.forceRelease(key);

                const lockId3 = "3";
                const ttl3 = null;
                const result1 = await adapter.acquireReader({
                    key,
                    lockId: lockId3,
                    limit,
                    ttl: ttl3,
                });
                expect(result1).toBe(true);
                const lockId4 = "4";
                const ttl4 = null;
                const result2 = await adapter.acquireReader({
                    key,
                    lockId: lockId4,
                    limit,
                    ttl: ttl4,
                });
                expect(result2).toBe(true);
            });
            test("Should update limit when key is reader mode and slot count is 0", async () => {
                const key = "a";
                const limit = 2;
                const ttl = null;

                const lockId1 = "1";
                await adapter.acquireReader({
                    key,
                    lockId: lockId1,
                    limit,
                    ttl,
                });
                const lockId2 = "2";
                await adapter.acquireReader({
                    key,
                    lockId: lockId2,
                    limit,
                    ttl,
                });
                await adapter.forceRelease(key);

                const newLimit = 3;
                const lockId3 = "3";
                await adapter.acquireReader({
                    key,
                    lockId: lockId3,
                    limit: newLimit,
                    ttl,
                });

                const result1 = await adapter.getState(key);
                expect(result1?.reader?.limit).toBe(newLimit);

                const lockId4 = "4";
                await adapter.acquireReader({
                    key,
                    lockId: lockId4,
                    limit: newLimit,
                    ttl,
                });

                const lockId5 = "5";
                const result2 = await adapter.acquireReader({
                    key,
                    lockId: lockId5,
                    limit: newLimit,
                    ttl,
                });
                expect(result2).toBe(true);

                const lockId6 = "6";
                const result3 = await adapter.acquireReader({
                    key,
                    lockId: lockId6,
                    limit,
                    ttl,
                });
                expect(result3).toBe(false);
            });
        });
        describe("method: getState", () => {
            test.todo("Write tests!!!");
        });
    });
}
