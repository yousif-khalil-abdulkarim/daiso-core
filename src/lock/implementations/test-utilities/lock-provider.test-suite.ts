/**
 * @module Lock
 */
import {
    type TestAPI,
    type SuiteAPI,
    type ExpectStatic,
    type beforeEach,
} from "vitest";
import type {
    ILockProvider,
    IGroupableLockProvider,
    ILock,
} from "@/lock/contracts/_module-exports.js";
import {
    UnownedRefreshLockEvent,
    KeyForceReleasedLockEvent,
    KeyAlreadyAcquiredLockEvent,
    UnownedReleaseLockEvent,
    KeyReleasedLockEvent,
    KeyAcquiredLockEvent,
    KeyAlreadyAcquiredLockError,
    UnownedRefreshLockError,
    UnownedReleaseLockError,
    KeyRefreshedLockEvent,
} from "@/lock/contracts/_module-exports.js";
import { type Promisable } from "@/utilities/_module-exports.js";
import { TimeSpan } from "@/utilities/_module-exports.js";
import { LazyPromise } from "@/async/_module-exports.js";
import type { ISerde } from "@/serde/contracts/_module-exports.js";
import { NoOpSerdeAdapter } from "@/serde/implementations/adapters/_module-exports.js";
import { Serde } from "@/serde/implementations/derivables/_module-exports.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/test-utilities"```
 * @group Utilities
 */
export type LockProviderTestSuiteSettings = {
    expect: ExpectStatic;
    test: TestAPI;
    describe: SuiteAPI;
    beforeEach: typeof beforeEach;
    createLockProvider: () => Promisable<IGroupableLockProvider>;
    serde?: ISerde;
};

/**
 * The <i>lockProviderTestSuite</i> function simplifies the process of testing your custom implementation of <i>{@link ILock}</i> with <i>vitest</i>.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/test-utilities"```
 * @group Utilities
 * @example
 * ```ts
 * import { describe, expect, test, beforeEach } from "vitest";
 * import { MemoryLockAdapter } from "@daiso-tech/core/lock/adapters";
 * import { LockProvider } from "@daiso-tech/core/lock";
 * import { EventBus } from "@daiso-tech/core/event-bus";
 * import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/adapters";
 * import { lockProviderTestSuite } from "@daiso-tech/core/lock/test-utilities";
 * import { Serde } from "@daiso-tech/core/serde";
 * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";
 * import type { ILockData } from "@daiso-tech/core/lock/contracts";
 * import { KeyPrefixer } from "@daiso-tech/core/utilities";
 *
 * describe("class: LockProvider", () => {
 *     const eventBus = new EventBus({
 *         keyPrefixer: new KeyPrefixer("event-bus"),
 *         adapter: new MemoryEventBusAdapter(),
 *     });
 *     const serde = new Serde(new SuperJsonSerdeAdapter());
 *     let map: Map<string, ILockData>;
 *     lockProviderTestSuite({
 *         createLockProvider: () => {
 *             const lockProvider = new LockProvider({
 *                 serde,
 *                 adapter: new MemoryLockAdapter(),
 *                 eventBus,
 *                 keyPrefixer: new KeyPrefixer("lock"),
 *             });
 *             return lockProvider;
 *         },
 *         beforeEach,
 *         describe,
 *         expect,
 *         test,
 *         serde,
 *     });
 * });
 * ```
 */
export function lockProviderTestSuite(
    settings: LockProviderTestSuiteSettings,
): void {
    const {
        expect,
        test,
        createLockProvider,
        describe,
        beforeEach,
        serde = new Serde(new NoOpSerdeAdapter()),
    } = settings;
    let lockProviderA: ILockProvider;
    let lockProviderB: ILockProvider;
    beforeEach(async () => {
        const lockProvider = await createLockProvider();
        lockProviderA = lockProvider;
        lockProviderB = lockProvider.withGroup("b");
    });
    const TTL = TimeSpan.fromMilliseconds(50);
    const DELAY_TIME = TimeSpan.fromMilliseconds(50);
    describe("Api tests:", () => {
        describe("method: run", () => {
            test("Should return string when lock is available", async () => {
                const key = "a";
                const ttl = null;
                const lock = lockProviderA.create(key, {
                    ttl,
                });

                const [result, error] = await lock.run(async () => {
                    await LazyPromise.delay(DELAY_TIME);
                    return "a";
                });

                expect(result).toBe("a");
                expect(error).toBeNull();
            });
            test("Should return null when lock is already acquired", async () => {
                const key = "a";
                const ttl = null;
                const lock = lockProviderA.create(key, {
                    ttl,
                });

                await lock.acquire();
                const [result, error] = await lock.run(async () => {
                    await LazyPromise.delay(DELAY_TIME);
                    return "a";
                });

                expect(result).toBeNull();
                expect(error).toBeInstanceOf(KeyAlreadyAcquiredLockError);
            });
            test("Should work with LazyPromise", async () => {
                const key = "a";
                const ttl = null;
                const lock = lockProviderA.create(key, {
                    ttl,
                });

                const [result, error] = await lock.run(
                    new LazyPromise(async () => {
                        await LazyPromise.delay(DELAY_TIME);
                        return "a";
                    }),
                );

                expect(result).toBe("a");
                expect(error).toBeNull();
            });
        });
        describe("method: runOrFail", () => {
            test("Should return string when lock is available", async () => {
                const key = "a";
                const ttl = null;
                const lock = lockProviderA.create(key, {
                    ttl,
                });

                const result = await lock.runOrFail(async () => {
                    await LazyPromise.delay(DELAY_TIME);
                    return "a";
                });

                expect(result).toBe("a");
            });
            test("Should throw KeyAlreadyAcquiredLockError when lock is already acquired", async () => {
                const key = "a";
                const ttl = null;
                const lock = lockProviderA.create(key, {
                    ttl,
                });

                await lock.acquire();
                const result = lock.runOrFail(async () => {
                    await LazyPromise.delay(DELAY_TIME);
                    return "a";
                });

                await expect(result).rejects.toBeInstanceOf(
                    KeyAlreadyAcquiredLockError,
                );
            });
            test("Should work with LazyPromise", async () => {
                const key = "a";
                const ttl = null;
                const lock = lockProviderA.create(key, {
                    ttl,
                });

                const result = await lock.runOrFail(
                    new LazyPromise(async () => {
                        await LazyPromise.delay(DELAY_TIME);
                        return "a";
                    }),
                );

                expect(result).toBe("a");
            });
        });
        describe("method: runBlocking", () => {
            test("Should return string when lock is available", async () => {
                const key = "a";
                const ttl = null;
                const lock = lockProviderA.create(key, {
                    ttl,
                });

                const [result, error] = await lock.runBlocking(
                    async () => {
                        await LazyPromise.delay(DELAY_TIME);
                        return "a";
                    },
                    {
                        time: TimeSpan.fromMilliseconds(5),
                        interval: TimeSpan.fromMilliseconds(5),
                    },
                );

                expect(result).toBe("a");
                expect(error).toBeNull();
            });
            test("Should return null when lock is already acquired", async () => {
                const key = "a";
                const ttl = null;
                const lock = lockProviderA.create(key, {
                    ttl,
                });

                await lock.acquire();
                const [result, error] = await lock.runBlocking(
                    async () => {
                        await LazyPromise.delay(DELAY_TIME);
                        return "a";
                    },
                    {
                        time: TimeSpan.fromMilliseconds(5),
                        interval: TimeSpan.fromMilliseconds(5),
                    },
                );

                expect(result).toBeNull();
                expect(error).toBeInstanceOf(KeyAlreadyAcquiredLockError);
            });
            test("Should work with LazyPromise", async () => {
                const key = "a";
                const ttl = null;
                const lock = lockProviderA.create(key, {
                    ttl,
                });

                const [result, error] = await lock.runBlocking(
                    new LazyPromise(async () => {
                        await LazyPromise.delay(DELAY_TIME);
                        return "a";
                    }),
                    {
                        time: TimeSpan.fromMilliseconds(5),
                        interval: TimeSpan.fromMilliseconds(5),
                    },
                );

                expect(result).toBe("a");
                expect(error).toBeNull();
            });
            test("Should retry acquire the lock", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);
                const lock = lockProviderA.create(key, {
                    ttl,
                });

                await lock.acquire();
                let index = 0;
                await lockProviderA.addListener(
                    KeyAlreadyAcquiredLockEvent,
                    (_event) => {
                        index++;
                    },
                );
                await lock.runBlocking(
                    async () => {
                        await LazyPromise.delay(DELAY_TIME);
                    },
                    {
                        time: TimeSpan.fromMilliseconds(55),
                        interval: TimeSpan.fromMilliseconds(5),
                    },
                );

                expect(index).toBeGreaterThan(1);
            });
        });
        describe("method: runBlockingOrFail", () => {
            test("Should return string when lock is available", async () => {
                const key = "a";
                const ttl = null;
                const lock = lockProviderA.create(key, {
                    ttl,
                });

                const result = await lock.runBlockingOrFail(
                    async () => {
                        await LazyPromise.delay(DELAY_TIME);
                        return "a";
                    },
                    {
                        time: TimeSpan.fromMilliseconds(5),
                        interval: TimeSpan.fromMilliseconds(5),
                    },
                );

                expect(result).toBe("a");
            });
            test("Should throw KeyAlreadyAcquiredLockError when lock is already acquired", async () => {
                const key = "a";
                const ttl = null;
                const lock = lockProviderA.create(key, {
                    ttl,
                });

                await lock.acquire();
                const promise = lock.runBlockingOrFail(
                    async () => {
                        await LazyPromise.delay(DELAY_TIME);
                        return "a";
                    },
                    {
                        time: TimeSpan.fromMilliseconds(5),
                        interval: TimeSpan.fromMilliseconds(5),
                    },
                );

                await expect(promise).rejects.toBeInstanceOf(
                    KeyAlreadyAcquiredLockError,
                );
            });
            test("Should work with LazyPromise", async () => {
                const key = "a";
                const ttl = null;
                const lock = lockProviderA.create(key, {
                    ttl,
                });

                const result = await lock.runBlockingOrFail(
                    new LazyPromise(async () => {
                        await LazyPromise.delay(DELAY_TIME);
                        return "a";
                    }),
                    {
                        time: TimeSpan.fromMilliseconds(5),
                        interval: TimeSpan.fromMilliseconds(5),
                    },
                );

                expect(result).toBe("a");
            });
            test("Should retry acquire the lock", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);
                const lock = lockProviderA.create(key, {
                    ttl,
                });

                await lock.acquire();
                let index = 0;
                await lockProviderA.addListener(
                    KeyAlreadyAcquiredLockEvent,
                    (_event) => {
                        index++;
                    },
                );
                try {
                    await lock.runBlockingOrFail(
                        async () => {
                            await LazyPromise.delay(DELAY_TIME);
                        },
                        {
                            time: TimeSpan.fromMilliseconds(55),
                            interval: TimeSpan.fromMilliseconds(5),
                        },
                    );
                } catch {
                    /* Empty */
                }

                expect(index).toBeGreaterThan(1);
            });
        });
        describe("method: acquire", () => {
            test("Should return true when lock is available", async () => {
                const key = "a";
                const ttl = null;
                const lock = lockProviderA.create(key, {
                    ttl,
                });

                const result = await lock.acquire();

                expect(result).toBe(true);
            });
            test("Should return false when lock is already acquired", async () => {
                const key = "a";
                const ttl = null;
                const lock = lockProviderA.create(key, {
                    ttl,
                });

                await lock.acquire();
                const result = await lock.acquire();

                expect(result).toBe(false);
            });
            test("Should not be expired when released by same owner", async () => {
                const key = "a";
                const ttl = null;
                const owner = "b";
                const lock = lockProviderA.create(key, {
                    ttl,
                    owner,
                });

                await lock.acquire();
                const result = await lock.isExpired();

                expect(result).toBe(false);
            });
            test("Should be loked when released by same owner", async () => {
                const key = "a";
                const ttl = null;
                const owner = "b";
                const lock = lockProviderA.create(key, {
                    ttl,
                    owner,
                });

                await lock.acquire();
                const result = await lock.isLocked();

                expect(result).toBe(true);
            });
        });
        describe("method: acquireOrFail", () => {
            test("Should not throw KeyAlreadyAcquiredLockError when lock is available", async () => {
                const key = "a";
                const ttl = null;
                const lock = lockProviderA.create(key, {
                    ttl,
                });

                const result = lock.acquireOrFail();

                await expect(result).resolves.toBeUndefined();
            });
            test("Should throw KeyAlreadyAcquiredLockError when lock is already acquired", async () => {
                const key = "a";
                const ttl = null;
                const lock = lockProviderA.create(key, {
                    ttl,
                });

                await lock.acquireOrFail();
                const result = lock.acquireOrFail();

                await expect(result).rejects.toBeInstanceOf(
                    KeyAlreadyAcquiredLockError,
                );
            });
        });
        describe("method: acquireBlocking", () => {
            test("Should return true when lock is available", async () => {
                const key = "a";
                const ttl = null;
                const lock = lockProviderA.create(key, {
                    ttl,
                });

                const result = await lock.acquireBlocking({
                    time: TimeSpan.fromMilliseconds(5),
                    interval: TimeSpan.fromMilliseconds(5),
                });

                expect(result).toBe(true);
            });
            test("Should return false when lock is already acquired", async () => {
                const key = "a";
                const ttl = null;
                const lock = lockProviderA.create(key, {
                    ttl,
                });

                await lock.acquireBlocking({
                    time: TimeSpan.fromMilliseconds(5),
                    interval: TimeSpan.fromMilliseconds(5),
                });
                const result = await lock.acquireBlocking({
                    time: TimeSpan.fromMilliseconds(5),
                    interval: TimeSpan.fromMilliseconds(5),
                });

                expect(result).toBe(false);
            });
            test("Should not be expired when released by same owner", async () => {
                const key = "a";
                const ttl = null;
                const owner = "b";
                const lock = lockProviderA.create(key, {
                    ttl,
                    owner,
                });

                await lock.acquireBlocking({
                    time: TimeSpan.fromMilliseconds(5),
                    interval: TimeSpan.fromMilliseconds(5),
                });
                const result = await lock.isExpired();

                expect(result).toBe(false);
            });
            test("Should be loked when released by same owner", async () => {
                const key = "a";
                const ttl = null;
                const owner = "b";
                const lock = lockProviderA.create(key, {
                    ttl,
                    owner,
                });

                await lock.acquireBlocking({
                    time: TimeSpan.fromMilliseconds(5),
                    interval: TimeSpan.fromMilliseconds(5),
                });
                const result = await lock.isLocked();

                expect(result).toBe(true);
            });
            test("Should retry acquire the lock", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);
                const lock = lockProviderA.create(key, {
                    ttl,
                });

                await lock.acquire();
                let index = 0;
                await lockProviderA.addListener(
                    KeyAlreadyAcquiredLockEvent,
                    (_event) => {
                        index++;
                    },
                );
                await lock.acquireBlocking({
                    time: TimeSpan.fromMilliseconds(55),
                    interval: TimeSpan.fromMilliseconds(5),
                });

                expect(index).toBeGreaterThan(1);
            });
        });
        describe("method: acquireBlockingOrFail", () => {
            test("Should not throw KeyAlreadyAcquiredLockError when lock is available", async () => {
                const key = "a";
                const ttl = null;
                const lock = lockProviderA.create(key, {
                    ttl,
                });

                const promise = lock.acquireBlockingOrFail({
                    time: TimeSpan.fromMilliseconds(5),
                    interval: TimeSpan.fromMilliseconds(5),
                });

                await expect(promise).resolves.toBeUndefined();
            });
            test("Should throw KeyAlreadyAcquiredLockError when lock is already acquired", async () => {
                const key = "a";
                const ttl = null;
                const lock = lockProviderA.create(key, {
                    ttl,
                });

                await lock.acquireBlockingOrFail({
                    time: TimeSpan.fromMilliseconds(5),
                    interval: TimeSpan.fromMilliseconds(5),
                });
                const promise = lock.acquireBlockingOrFail({
                    time: TimeSpan.fromMilliseconds(5),
                    interval: TimeSpan.fromMilliseconds(5),
                });

                await expect(promise).rejects.toBeInstanceOf(
                    KeyAlreadyAcquiredLockError,
                );
            });
            test("Should not be expired when released by same owner", async () => {
                const key = "a";
                const ttl = null;
                const owner = "b";
                const lock = lockProviderA.create(key, {
                    ttl,
                    owner,
                });

                await lock.acquireBlockingOrFail({
                    time: TimeSpan.fromMilliseconds(5),
                    interval: TimeSpan.fromMilliseconds(5),
                });
                const result = await lock.isExpired();

                expect(result).toBe(false);
            });
            test("Should be loked when released by same owner", async () => {
                const key = "a";
                const ttl = null;
                const owner = "b";
                const lock = lockProviderA.create(key, {
                    ttl,
                    owner,
                });

                await lock.acquireBlockingOrFail({
                    time: TimeSpan.fromMilliseconds(5),
                    interval: TimeSpan.fromMilliseconds(5),
                });
                const result = await lock.isLocked();

                expect(result).toBe(true);
            });
            test("Should retry acquire the lock", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);
                const lock = lockProviderA.create(key, {
                    ttl,
                });

                await lock.acquire();
                let index = 0;
                await lockProviderA.addListener(
                    KeyAlreadyAcquiredLockEvent,
                    (_event) => {
                        index++;
                    },
                );
                try {
                    await lock.acquireBlockingOrFail({
                        time: TimeSpan.fromMilliseconds(55),
                        interval: TimeSpan.fromMilliseconds(5),
                    });
                } catch {
                    /* Empty */
                }

                expect(index).toBeGreaterThan(1);
            });
        });
        describe("method: release", () => {
            test("Should return true when released by same owner", async () => {
                const key = "a";
                const ttl = null;
                const owner = "b";
                const lock = lockProviderA.create(key, {
                    ttl,
                    owner,
                });

                await lock.acquire();
                const result = await lock.release();

                expect(result).toBe(true);
            });
            test("Should return false when released by different owner", async () => {
                const key = "a";
                const ttl = null;
                const owner1 = "b";
                const lock1 = lockProviderA.create(key, {
                    ttl,
                    owner: owner1,
                });

                await lock1.acquire();
                const owner2 = "c";
                const lock2 = lockProviderA.create(key, {
                    ttl,
                    owner: owner2,
                });
                const result = await lock2.release();

                expect(result).toBe(false);
            });
            test("Should be expired when released by same owner", async () => {
                const key = "a";
                const ttl = null;
                const owner = "b";
                const lock = lockProviderA.create(key, {
                    ttl,
                    owner,
                });

                await lock.acquire();
                await lock.release();
                const result = await lock.isExpired();

                expect(result).toBe(true);
            });
            test("Should be not loked when released by same owner", async () => {
                const key = "a";
                const ttl = null;
                const owner = "b";
                const lock = lockProviderA.create(key, {
                    ttl,
                    owner,
                });

                await lock.acquire();
                await lock.release();
                const result = await lock.isLocked();

                expect(result).toBe(false);
            });
        });
        describe("method: releaseOrFail", () => {
            test("Should not throw UnownedReleaseLockError when released by same owner", async () => {
                const key = "a";
                const ttl = null;
                const owner = "b";
                const lock = lockProviderA.create(key, {
                    ttl,
                    owner,
                });

                await lock.acquire();
                const result = lock.releaseOrFail();

                await expect(result).resolves.toBeUndefined();
            });
            test("Should throw UnownedReleaseLockError when released by different owner", async () => {
                const key = "a";
                const ttl = null;
                const owner1 = "b";
                const lock1 = lockProviderA.create(key, {
                    ttl,
                    owner: owner1,
                });

                await lock1.acquire();
                const owner2 = "c";
                const lock2 = lockProviderA.create(key, {
                    ttl,
                    owner: owner2,
                });
                const result = lock2.releaseOrFail();

                await expect(result).rejects.toBeInstanceOf(
                    UnownedReleaseLockError,
                );
            });
            test("Should be expired when released by same owner", async () => {
                const key = "a";
                const ttl = null;
                const owner = "b";
                const lock = lockProviderA.create(key, {
                    ttl,
                    owner,
                });

                await lock.acquire();
                await lock.releaseOrFail();
                const result = await lock.isExpired();

                expect(result).toBe(true);
            });
            test("Should be not loked when released by same owner", async () => {
                const key = "a";
                const ttl = null;
                const owner = "b";
                const lock = lockProviderA.create(key, {
                    ttl,
                    owner,
                });

                await lock.acquire();
                await lock.releaseOrFail();
                const result = await lock.isLocked();

                expect(result).toBe(false);
            });
        });
        describe("method: forceRelease", () => {
            test("Should release lock no regardless of the owner", async () => {
                const key = "a";
                const ttl = null;
                const owner1 = "b";
                const lock1 = lockProviderA.create(key, {
                    ttl,
                    owner: owner1,
                });

                await lock1.acquire();
                const owner2 = "c";
                const lock2 = lockProviderA.create(key, {
                    ttl,
                    owner: owner2,
                });
                await lock2.forceRelease();
                const result = await lock1.acquire();

                expect(result).toBe(true);
            });
            test("Should be expired when released", async () => {
                const key = "a";
                const ttl = null;
                const owner = "b";
                const lock = lockProviderA.create(key, {
                    ttl,
                    owner,
                });

                await lock.acquire();
                await lock.forceRelease();
                const result = await lock.isExpired();

                expect(result).toBe(true);
            });
            test("Should be not loked when released", async () => {
                const key = "a";
                const ttl = null;
                const owner = "b";
                const lock = lockProviderA.create(key, {
                    ttl,
                    owner,
                });

                await lock.acquire();
                await lock.forceRelease();
                const result = await lock.isLocked();

                expect(result).toBe(false);
            });
        });
        describe("method: isExpired", () => {
            test("Should return false when lock has no expiration", async () => {
                const key = "a";
                const ttl = null;
                const owner = "b";
                const lock = lockProviderA.create(key, {
                    ttl,
                    owner,
                });

                await lock.acquire();
                const result = await lock.isExpired();

                expect(result).toBe(false);
            });
            test("Should return false when lock has not expired", async () => {
                const key = "a";
                const owner = "b";
                const ttl = TTL;
                const lock = lockProviderA.create(key, {
                    ttl,
                    owner,
                });

                await lock.acquire();
                const result = await lock.isExpired();

                expect(result).toBe(false);
            });
            test("Should return true when lock has expired", async () => {
                const key = "a";
                const owner = "b";
                const ttl = TTL;
                const lock = lockProviderA.create(key, {
                    ttl,
                    owner,
                });

                await lock.acquire();
                await LazyPromise.delay(ttl.addMilliseconds(25));
                const result = await lock.isExpired();

                expect(result).toBe(true);
            });
        });
        describe("method: isLocked", () => {
            test("Should return true when lock has no expiration", async () => {
                const key = "a";
                const ttl = null;
                const owner = "b";
                const lock = lockProviderA.create(key, {
                    ttl,
                    owner,
                });

                await lock.acquire();
                const result = await lock.isLocked();

                expect(result).toBe(true);
            });
            test("Should return true when lock has not expired", async () => {
                const key = "a";
                const owner = "b";
                const ttl = TTL;
                const lock = lockProviderA.create(key, {
                    ttl,
                    owner,
                });

                await lock.acquire();
                const result = await lock.isLocked();

                expect(result).toBe(true);
            });
            test("Should return false when lock has expired", async () => {
                const key = "a";
                const owner = "b";
                const ttl = TTL;
                const lock = lockProviderA.create(key, {
                    ttl,
                    owner,
                });

                await lock.acquire();
                await LazyPromise.delay(ttl.addMilliseconds(25));
                const result = await lock.isLocked();

                expect(result).toBe(false);
            });
        });
        describe("method: refresh", () => {
            test("Should return true when refreshed by same owner", async () => {
                const key = "a";
                const ttl = TTL;
                const owner = "b";
                const lock = lockProviderA.create(key, {
                    ttl,
                    owner,
                });

                await lock.acquire();
                await LazyPromise.delay(ttl);

                const result = await lock.refresh();

                expect(result).toBe(true);
            });
            test("Should return false when refreshed by different owner", async () => {
                const key = "a";
                const ttl = TTL;
                const owner1 = "b";
                const lock1 = lockProviderA.create(key, {
                    ttl,
                    owner: owner1,
                });

                await lock1.acquire();
                const owner2 = "c";
                const lock2 = lockProviderA.create(key, {
                    ttl,
                    owner: owner2,
                });

                const result = await lock2.refresh();
                expect(result).toBe(false);
            });
            test("Should refresh expiration by same owner", async () => {
                const key = "a";
                const ttl = TTL;
                const owner = "b";
                const lock = lockProviderA.create(key, {
                    ttl,
                    owner,
                });

                await lock.acquire();
                await LazyPromise.delay(ttl.subtractMilliseconds(10));
                await lock.refresh();
                const time = await lock.getRemainingTime();

                expect(time?.toMilliseconds()).toBeGreaterThan(0);
            });
        });
        describe("method: refreshOrFail", () => {
            test("Should not throw UnownedRefreshLockError when refreshed by same owner", async () => {
                const key = "a";
                const ttl = TTL;
                const owner = "b";
                const lock = lockProviderA.create(key, {
                    ttl,
                    owner,
                });

                await lock.acquire();
                await LazyPromise.delay(ttl);

                const result = lock.refreshOrFail();

                await expect(result).resolves.toBeUndefined();
            });
            test("Should throw UnownedRefreshLockError when refreshed by different owner", async () => {
                const key = "a";
                const ttl = TTL;
                const owner1 = "b";
                const lock1 = lockProviderA.create(key, {
                    ttl,
                    owner: owner1,
                });

                await lock1.acquire();
                const owner2 = "c";
                const lock2 = lockProviderA.create(key, {
                    ttl,
                    owner: owner2,
                });

                const result = lock2.refreshOrFail();
                await expect(result).rejects.toBeInstanceOf(
                    UnownedRefreshLockError,
                );
            });
            test("Should refresh expiration by same owner", async () => {
                const key = "a";
                const ttl = TTL;
                const owner = "b";
                const lock = lockProviderA.create(key, {
                    ttl,
                    owner,
                });

                await lock.acquireOrFail();
                await LazyPromise.delay(ttl.subtractMilliseconds(10));
                await lock.refresh();
                const time = await lock.getRemainingTime();

                expect(time?.toMilliseconds()).toBeGreaterThan(0);
            });
        });
        describe("method: getRemainingTime", () => {
            test("Should return null when lock is not acquired", async () => {
                const key = "a";
                const ttl = null;
                const owner = "b";
                const lock = lockProviderA.create(key, {
                    ttl,
                    owner,
                });

                const result = await lock.getRemainingTime();

                expect(result).toBeNull();
            });
            test("Should return null when lock is acquired and has expiration", async () => {
                const key = "a";
                const ttl = null;
                const owner = "b";
                const lock = lockProviderA.create(key, {
                    ttl,
                    owner,
                });

                await lock.acquire();
                const result = await lock.getRemainingTime();

                expect(result).toBeNull();
            });
            test("Should return remaining time when lock is not acquired", async () => {
                const key = "a";
                const ttl = TTL;
                const owner = "b";
                const lock = lockProviderA.create(key, {
                    ttl,
                    owner,
                });

                await lock.acquire();
                const result = await lock.getRemainingTime();

                expect(result?.toMilliseconds()).toBe(ttl.toMilliseconds());
            });
        });
        describe("method: getOwner", () => {
            test("Should return the owner", async () => {
                const key = "a";
                const owner = "b";
                const lock = lockProviderA.create(key, {
                    owner,
                });

                const result = await lock.getOwner();

                expect(result).toBe(owner);
            });
            test("Should return the auto generated owner", async () => {
                const key = "a";
                const lock = lockProviderA.create(key);

                const result = await lock.getOwner();

                expect(result).toBeDefined();
                expect(typeof result).toBe("string");
            });
        });
    });
    describe("Event tests:", () => {
        describe("calss: Lock", () => {
            describe("method: run", () => {
                test("Should dispatch KeyAcquiredLockEvent when lock is not acquired", async () => {
                    const key = "a";
                    const owner = "b";
                    const lock = lockProviderA.create(key, {
                        owner,
                        ttl: TTL,
                    });
                    let event_ = null as KeyAcquiredLockEvent | null;
                    const unsubscribe = await lockProviderA.subscribe(
                        KeyAcquiredLockEvent,
                        (event) => {
                            event_ = event;
                        },
                    );

                    await lock.run(async () => {
                        await LazyPromise.delay(DELAY_TIME);
                    });
                    await LazyPromise.delay(DELAY_TIME);

                    expect(event_?.fields.key).toBe("a");
                    expect(event_?.fields.owner).toBe(owner);
                    expect(event_?.fields.ttl?.toMilliseconds()).toBe(
                        TTL.toMilliseconds(),
                    );
                    await unsubscribe();
                });
                test("Should dispatch KeyReleasedLockEvent when lock is not acquired", async () => {
                    const key = "a";
                    const owner = "b";
                    const lock = lockProviderA.create(key, {
                        owner,
                        ttl: TTL,
                    });
                    let event_ = null as KeyReleasedLockEvent | null;
                    const unsubscribe = await lockProviderA.subscribe(
                        KeyReleasedLockEvent,
                        (event) => {
                            event_ = event;
                        },
                    );

                    await lock.run(async () => {
                        await LazyPromise.delay(DELAY_TIME);
                    });
                    await LazyPromise.delay(DELAY_TIME);

                    expect(event_?.fields.key).toBe(key);
                    expect(event_?.fields.owner).toBe(owner);
                    await unsubscribe();
                });
                test("Should dispatch KeyAlreadyAcquiredLockEvent when lock is acquired", async () => {
                    const key = "a";
                    const owner = "b";
                    const lock = lockProviderA.create(key, {
                        owner,
                    });
                    let event_ = null as KeyAlreadyAcquiredLockEvent | null;

                    await lock.acquire();
                    const unsubscribe = await lockProviderA.subscribe(
                        KeyAlreadyAcquiredLockEvent,
                        (event) => {
                            event_ = event;
                        },
                    );

                    await lock.run(async () => {
                        await LazyPromise.delay(DELAY_TIME);
                    });
                    await LazyPromise.delay(DELAY_TIME);

                    expect(event_?.fields.key).toBe("a");
                    expect(event_?.fields.owner).toBe(owner);
                    await unsubscribe();
                });
            });
            describe("method: runBlocking", () => {
                test("Should dispatch KeyAcquiredLockEvent when lock is not acquired", async () => {
                    const key = "a";
                    const owner = "b";
                    const lock = lockProviderA.create(key, {
                        owner,
                        ttl: TTL,
                    });
                    let event_ = null as KeyAcquiredLockEvent | null;
                    const unsubscribe = await lockProviderA.subscribe(
                        KeyAcquiredLockEvent,
                        (event) => {
                            event_ = event;
                        },
                    );

                    await lock.runBlocking(
                        async () => {
                            await LazyPromise.delay(DELAY_TIME);
                        },
                        {
                            time: TimeSpan.fromMilliseconds(5),
                            interval: TimeSpan.fromMilliseconds(5),
                        },
                    );
                    await LazyPromise.delay(DELAY_TIME);

                    expect(event_?.fields.key).toBe("a");
                    expect(event_?.fields.owner).toBe(owner);
                    expect(event_?.fields.ttl?.toMilliseconds()).toBe(
                        TTL.toMilliseconds(),
                    );
                    await unsubscribe();
                });
                test("Should dispatch KeyReleasedLockEvent when lock is not acquired", async () => {
                    const key = "a";
                    const owner = "b";
                    const lock = lockProviderA.create(key, {
                        owner,
                        ttl: TTL,
                    });
                    let event_ = null as KeyReleasedLockEvent | null;
                    const unsubscribe = await lockProviderA.subscribe(
                        KeyReleasedLockEvent,
                        (event) => {
                            event_ = event;
                        },
                    );

                    await lock.runBlocking(
                        async () => {
                            await LazyPromise.delay(DELAY_TIME);
                        },
                        {
                            time: TimeSpan.fromMilliseconds(5),
                            interval: TimeSpan.fromMilliseconds(5),
                        },
                    );
                    await LazyPromise.delay(DELAY_TIME);

                    expect(event_?.fields.key).toBe(key);
                    expect(event_?.fields.owner).toBe(owner);
                    await unsubscribe();
                });
                test("Should dispatch KeyAlreadyAcquiredLockEvent when lock is acquired", async () => {
                    const key = "a";
                    const owner = "b";
                    const lock = lockProviderA.create(key, {
                        owner,
                    });
                    let event_ = null as KeyAlreadyAcquiredLockEvent | null;

                    await lock.acquire();
                    const unsubscribe = await lockProviderA.subscribe(
                        KeyAlreadyAcquiredLockEvent,
                        (event) => {
                            event_ = event;
                        },
                    );

                    await lock.runBlocking(
                        async () => {
                            await LazyPromise.delay(DELAY_TIME);
                        },
                        {
                            time: TimeSpan.fromMilliseconds(5),
                            interval: TimeSpan.fromMilliseconds(5),
                        },
                    );
                    await LazyPromise.delay(DELAY_TIME);

                    expect(event_?.fields.key).toBe("a");
                    expect(event_?.fields.owner).toBe(owner);
                    await unsubscribe();
                });
            });
            describe("method: runOrFail", () => {
                test("Should dispatch KeyAcquiredLockEvent when lock is not acquired", async () => {
                    const key = "a";
                    const owner = "b";
                    const lock = lockProviderA.create(key, {
                        owner,
                        ttl: TTL,
                    });
                    let event_ = null as KeyAcquiredLockEvent | null;
                    const unsubscribe = await lockProviderA.subscribe(
                        KeyAcquiredLockEvent,
                        (event) => {
                            event_ = event;
                        },
                    );

                    await lock.runOrFail(async () => {
                        await LazyPromise.delay(DELAY_TIME);
                    });
                    await LazyPromise.delay(DELAY_TIME);

                    expect(event_?.fields.key).toBe("a");
                    expect(event_?.fields.owner).toBe(owner);
                    expect(event_?.fields.ttl?.toMilliseconds()).toBe(
                        TTL.toMilliseconds(),
                    );
                    await unsubscribe();
                });
                test("Should dispatch KeyReleasedLockEvent when lock is not acquired", async () => {
                    const key = "a";
                    const owner = "b";
                    const lock = lockProviderA.create(key, {
                        owner,
                        ttl: TTL,
                    });
                    let event_ = null as KeyReleasedLockEvent | null;
                    const unsubscribe = await lockProviderA.subscribe(
                        KeyReleasedLockEvent,
                        (event) => {
                            event_ = event;
                        },
                    );

                    await lock.runOrFail(async () => {
                        await LazyPromise.delay(DELAY_TIME);
                    });
                    await LazyPromise.delay(DELAY_TIME);

                    expect(event_?.fields.key).toBe(key);
                    expect(event_?.fields.owner).toBe(owner);
                    await unsubscribe();
                });
                test("Should dispatch KeyAlreadyAcquiredLockEvent when lock is acquired", async () => {
                    const key = "a";
                    const owner = "b";
                    const lock = lockProviderA.create(key, {
                        owner,
                    });
                    let event_ = null as KeyAlreadyAcquiredLockEvent | null;

                    await lock.acquire();
                    const unsubscribe = await lockProviderA.subscribe(
                        KeyAlreadyAcquiredLockEvent,
                        (event) => {
                            event_ = event;
                        },
                    );

                    try {
                        await lock.runOrFail(async () => {
                            await LazyPromise.delay(DELAY_TIME);
                        });
                        await LazyPromise.delay(DELAY_TIME);
                    } catch {
                        /* Empty */
                    }

                    expect(event_?.fields.key).toBe("a");
                    expect(event_?.fields.owner).toBe(owner);
                    await unsubscribe();
                });
            });
            describe("method: acquire", () => {
                test("Should dispatch KeyAcquiredLockEvent when lock is not acquired", async () => {
                    const key = "a";
                    const owner = "b";
                    const lock = lockProviderA.create(key, {
                        owner,
                        ttl: TTL,
                    });
                    let event_ = null as KeyAcquiredLockEvent | null;
                    const unsubscribe = await lockProviderA.subscribe(
                        KeyAcquiredLockEvent,
                        (event) => {
                            event_ = event;
                        },
                    );

                    await lock.acquire();
                    await LazyPromise.delay(DELAY_TIME);

                    expect(event_?.fields.key).toBe("a");
                    expect(event_?.fields.owner).toBe(owner);
                    expect(event_?.fields.ttl?.toMilliseconds()).toBe(
                        TTL.toMilliseconds(),
                    );
                    await unsubscribe();
                });
                test("Should dispatch KeyAlreadyAcquiredLockEvent when lock is acquired", async () => {
                    const key = "a";
                    const owner = "b";
                    const lock = lockProviderA.create(key, {
                        owner,
                    });
                    let event_ = null as KeyAlreadyAcquiredLockEvent | null;

                    await lock.acquire();
                    const unsubscribe = await lockProviderA.subscribe(
                        KeyAlreadyAcquiredLockEvent,
                        (event) => {
                            event_ = event;
                        },
                    );

                    await lock.acquire();
                    await LazyPromise.delay(DELAY_TIME);

                    expect(event_?.fields.key).toBe("a");
                    expect(event_?.fields.owner).toBe(owner);
                    await unsubscribe();
                });
            });
            describe("method: acquireBlocking", () => {
                test("Should dispatch KeyAcquiredLockEvent when lock is not acquired", async () => {
                    const key = "a";
                    const owner = "b";
                    const lock = lockProviderA.create(key, {
                        owner,
                        ttl: TTL,
                    });
                    let event_ = null as KeyAcquiredLockEvent | null;
                    const unsubscribe = await lockProviderA.subscribe(
                        KeyAcquiredLockEvent,
                        (event) => {
                            event_ = event;
                        },
                    );

                    await lock.acquireBlocking({
                        time: TimeSpan.fromMilliseconds(5),
                        interval: TimeSpan.fromMilliseconds(5),
                    });
                    await LazyPromise.delay(DELAY_TIME);

                    expect(event_?.fields.key).toBe("a");
                    expect(event_?.fields.owner).toBe(owner);
                    expect(event_?.fields.ttl?.toMilliseconds()).toBe(
                        TTL.toMilliseconds(),
                    );
                    await unsubscribe();
                });
                test("Should dispatch KeyAlreadyAcquiredLockEvent when lock is acquired", async () => {
                    const key = "a";
                    const owner = "b";
                    const lock = lockProviderA.create(key, {
                        owner,
                    });
                    let event_ = null as KeyAlreadyAcquiredLockEvent | null;

                    await lock.acquireBlocking({
                        time: TimeSpan.fromMilliseconds(5),
                        interval: TimeSpan.fromMilliseconds(5),
                    });
                    const unsubscribe = await lockProviderA.subscribe(
                        KeyAlreadyAcquiredLockEvent,
                        (event) => {
                            event_ = event;
                        },
                    );

                    await lock.acquireBlocking({
                        time: TimeSpan.fromMilliseconds(5),
                        interval: TimeSpan.fromMilliseconds(5),
                    });
                    await LazyPromise.delay(DELAY_TIME);

                    expect(event_?.fields.key).toBe("a");
                    expect(event_?.fields.owner).toBe(owner);
                    await unsubscribe();
                });
            });
            describe("method: acquireOrFail", () => {
                test("Should dispatch KeyAcquiredLockEvent when lock is not acquired", async () => {
                    const key = "a";
                    const owner = "b";
                    const lock = lockProviderA.create(key, {
                        owner,
                        ttl: TTL,
                    });
                    let event_ = null as KeyAcquiredLockEvent | null;
                    const unsubscribe = await lockProviderA.subscribe(
                        KeyAcquiredLockEvent,
                        (event) => {
                            event_ = event;
                        },
                    );

                    await lock.acquireOrFail();
                    await LazyPromise.delay(DELAY_TIME);

                    expect(event_?.fields.key).toBe("a");
                    expect(event_?.fields.owner).toBe(owner);
                    expect(event_?.fields.ttl?.toMilliseconds()).toBe(
                        TTL.toMilliseconds(),
                    );
                    await unsubscribe();
                });
                test("Should dispatch KeyAlreadyAcquiredLockEvent when lock is acquired", async () => {
                    const key = "a";
                    const owner = "b";
                    const lock = lockProviderA.create(key, {
                        owner,
                    });
                    let event_ = null as KeyAlreadyAcquiredLockEvent | null;

                    await lock.acquireOrFail();
                    const unsubscribe = await lockProviderA.subscribe(
                        KeyAlreadyAcquiredLockEvent,
                        (event) => {
                            event_ = event;
                        },
                    );

                    try {
                        await lock.acquireOrFail();
                        await LazyPromise.delay(DELAY_TIME);
                    } catch {
                        /* Empty */
                    }

                    expect(event_?.fields.key).toBe("a");
                    expect(event_?.fields.owner).toBe(owner);
                    await unsubscribe();
                });
            });
            describe("method: release", () => {
                test("Should dispatch KeyReleasedLockEvent when released by same owner", async () => {
                    const key = "a";
                    const owner = "b";
                    const lock = lockProviderA.create(key, {
                        owner,
                    });

                    await lock.acquire();
                    let event_ = null as KeyReleasedLockEvent | null;
                    const unsubscribe = await lockProviderA.subscribe(
                        KeyReleasedLockEvent,
                        (event) => {
                            event_ = event;
                        },
                    );
                    await lock.release();
                    await LazyPromise.delay(DELAY_TIME);

                    expect(event_?.fields.key).toBe(key);
                    expect(event_?.fields.owner).toBe(owner);
                    await unsubscribe();
                });
                test("Should dispatch UnownedReleaseLockEvent when released by same owner", async () => {
                    const key = "a";
                    const owner1 = "b";
                    const lock1 = lockProviderA.create(key, {
                        owner: owner1,
                    });
                    await lock1.acquire();

                    const owner2 = "c";
                    const lock2 = lockProviderA.create(key, {
                        owner: owner2,
                    });
                    let event_ = null as UnownedReleaseLockEvent | null;
                    const unsubscribe = await lockProviderA.subscribe(
                        UnownedReleaseLockEvent,
                        (event) => {
                            event_ = event;
                        },
                    );
                    await lock2.release();
                    await LazyPromise.delay(DELAY_TIME);

                    expect(event_?.fields.key).toBe(key);
                    expect(event_?.fields.owner).toBe(owner2);
                    await unsubscribe();
                });
            });
            describe("method: releaseOrFail", () => {
                test("Should dispatch KeyReleasedLockEvent when released by same owner", async () => {
                    const key = "a";
                    const owner = "b";
                    const lock = lockProviderA.create(key, {
                        owner,
                    });

                    await lock.acquire();
                    let event_ = null as KeyReleasedLockEvent | null;
                    const unsubscribe = await lockProviderA.subscribe(
                        KeyReleasedLockEvent,
                        (event) => {
                            event_ = event;
                        },
                    );
                    await lock.releaseOrFail();
                    await LazyPromise.delay(DELAY_TIME);

                    expect(event_?.fields.key).toBe(key);
                    expect(event_?.fields.owner).toBe(owner);
                    await unsubscribe();
                });
                test("Should dispatch UnownedReleaseLockEvent when released by same owner", async () => {
                    const key = "a";
                    const owner1 = "b";
                    const lock1 = lockProviderA.create(key, {
                        owner: owner1,
                    });
                    await lock1.acquire();

                    const owner2 = "c";
                    const lock2 = lockProviderA.create(key, {
                        owner: owner2,
                    });
                    let event_ = null as UnownedReleaseLockEvent | null;
                    const unsubscribe = await lockProviderA.subscribe(
                        UnownedReleaseLockEvent,
                        (event) => {
                            event_ = event;
                        },
                    );
                    try {
                        await lock2.releaseOrFail();
                        await LazyPromise.delay(DELAY_TIME);
                    } catch {
                        /* Empty */
                    }

                    expect(event_?.fields.key).toBe(key);
                    expect(event_?.fields.owner).toBe(owner2);
                    await unsubscribe();
                });
            });
            describe("method: forceRelease", () => {
                test("Should dispatch KeyForceReleasedLockEvent when lock forcefully released", async () => {
                    const key = "a";
                    const owner1 = "b";
                    const lock1 = lockProviderA.create(key, {
                        owner: owner1,
                    });
                    await lock1.acquire();

                    const owner2 = "c";
                    const lock2 = lockProviderA.create(key, {
                        owner: owner2,
                    });
                    let event_ = null as KeyForceReleasedLockEvent | null;
                    const unsubscribe = await lockProviderA.subscribe(
                        KeyForceReleasedLockEvent,
                        (event) => {
                            event_ = event;
                        },
                    );
                    await lock2.forceRelease();
                    await LazyPromise.delay(DELAY_TIME);

                    expect(event_?.fields.key).toBe(key);
                    await unsubscribe();
                });
            });
            describe("method: refresh", () => {
                test("Should dispatch KeyRefreshedLockEvent when refreshed by same owner", async () => {
                    const key = "a";
                    const owner = "b";
                    const lock = lockProviderA.create(key, {
                        owner,
                        ttl: TTL,
                    });

                    await lock.acquire();
                    let event_ = null as KeyRefreshedLockEvent | null;
                    const unsubscribe = await lockProviderA.subscribe(
                        KeyRefreshedLockEvent,
                        (event) => {
                            event_ = event;
                        },
                    );
                    await LazyPromise.delay(TTL.divide(2));
                    const newTTL = TTL.multiply(2);
                    await lock.refresh(newTTL);
                    await LazyPromise.delay(DELAY_TIME);

                    expect(event_?.fields.key).toBe(key);
                    expect(event_?.fields.owner).toBe(owner);
                    expect(event_?.fields.ttl.toMilliseconds()).toBe(
                        newTTL.toMilliseconds(),
                    );
                    await unsubscribe();
                });
                test("Should dispatch UnownedRefreshLockEvent when refreshed by different owner", async () => {
                    const key = "a";
                    const owner1 = "b";
                    const lock1 = lockProviderA.create(key, {
                        owner: owner1,
                        ttl: TTL,
                    });
                    await lock1.acquire();

                    const owner2 = "c";
                    const lock2 = lockProviderA.create(key, {
                        owner: owner2,
                    });
                    let event_ = null as UnownedRefreshLockEvent | null;
                    const unsubscribe = await lockProviderA.subscribe(
                        UnownedRefreshLockEvent,
                        (event) => {
                            event_ = event;
                        },
                    );
                    await LazyPromise.delay(TTL.divide(2));
                    const newTTL = TTL.multiply(2);
                    await lock2.refresh(newTTL);
                    await LazyPromise.delay(DELAY_TIME);

                    expect(event_?.fields.key).toBe(key);
                    expect(event_?.fields.owner).toBe(owner2);
                    await unsubscribe();
                });
            });
            describe("method: refreshOrFail", () => {
                test("Should dispatch KeyRefreshedLockEvent when refreshed by same owner", async () => {
                    const key = "a";
                    const owner = "b";
                    const lock = lockProviderA.create(key, {
                        owner,
                        ttl: TTL,
                    });

                    await lock.acquire();
                    let event_ = null as KeyRefreshedLockEvent | null;
                    const unsubscribe = await lockProviderA.subscribe(
                        KeyRefreshedLockEvent,
                        (event) => {
                            event_ = event;
                        },
                    );
                    await LazyPromise.delay(TTL.divide(2));
                    const newTTL = TTL.multiply(2);
                    await lock.refreshOrFail(newTTL);
                    await LazyPromise.delay(DELAY_TIME);

                    expect(event_?.fields.key).toBe(key);
                    expect(event_?.fields.owner).toBe(owner);
                    expect(event_?.fields.ttl.toMilliseconds()).toBe(
                        newTTL.toMilliseconds(),
                    );
                    await unsubscribe();
                });
                test("Should dispatch UnownedRefreshLockEvent when refreshed by different owner", async () => {
                    const key = "a";
                    const owner1 = "b";
                    const lock1 = lockProviderA.create(key, {
                        owner: owner1,
                        ttl: TTL,
                    });
                    await lock1.acquire();

                    const owner2 = "c";
                    const lock2 = lockProviderA.create(key, {
                        owner: owner2,
                    });
                    let event_ = null as UnownedRefreshLockEvent | null;
                    const unsubscribe = await lockProviderA.subscribe(
                        UnownedRefreshLockEvent,
                        (event) => {
                            event_ = event;
                        },
                    );
                    await LazyPromise.delay(TTL.divide(2));
                    const newTTL = TTL.multiply(2);
                    try {
                        await lock2.refreshOrFail(newTTL);
                        await LazyPromise.delay(DELAY_TIME);
                    } catch {
                        /* Empty */
                    }

                    expect(event_?.fields.key).toBe(key);
                    expect(event_?.fields.owner).toBe(owner2);
                    await unsubscribe();
                });
            });
        });
        describe("LockProvider:", () => {
            describe("method: run", () => {
                test("Should dispatch KeyAcquiredLockEvent when lock is not acquired", async () => {
                    const key = "a";
                    const owner = "b";
                    const lock = lockProviderA.create(key, {
                        owner,
                        ttl: TTL,
                    });
                    let event_ = null as KeyAcquiredLockEvent | null;
                    const unsubscribe = await lockProviderA.subscribe(
                        KeyAcquiredLockEvent,
                        (event) => {
                            event_ = event;
                        },
                    );

                    await lock.run(async () => {
                        await LazyPromise.delay(DELAY_TIME);
                    });
                    await LazyPromise.delay(DELAY_TIME);

                    expect(event_?.fields.key).toBe("a");
                    expect(event_?.fields.owner).toBe(owner);
                    expect(event_?.fields.ttl?.toMilliseconds()).toBe(
                        TTL.toMilliseconds(),
                    );
                    await unsubscribe();
                });
                test("Should dispatch KeyReleasedLockEvent when lock is not acquired", async () => {
                    const key = "a";
                    const owner = "b";
                    const lock = lockProviderA.create(key, {
                        owner,
                        ttl: TTL,
                    });
                    let event_ = null as KeyReleasedLockEvent | null;
                    const unsubscribe = await lockProviderA.subscribe(
                        KeyReleasedLockEvent,
                        (event) => {
                            event_ = event;
                        },
                    );

                    await lock.run(async () => {
                        await LazyPromise.delay(DELAY_TIME);
                    });
                    await LazyPromise.delay(DELAY_TIME);

                    expect(event_?.fields.key).toBe(key);
                    expect(event_?.fields.owner).toBe(owner);
                    await unsubscribe();
                });
                test("Should dispatch KeyAlreadyAcquiredLockEvent when lock is acquired", async () => {
                    const key = "a";
                    const owner = "b";
                    const lock = lockProviderA.create(key, {
                        owner,
                    });
                    let event_ = null as KeyAlreadyAcquiredLockEvent | null;

                    await lock.acquire();
                    const unsubscribe = await lockProviderA.subscribe(
                        KeyAlreadyAcquiredLockEvent,
                        (event) => {
                            event_ = event;
                        },
                    );

                    await lock.run(async () => {
                        await LazyPromise.delay(DELAY_TIME);
                    });
                    await LazyPromise.delay(DELAY_TIME);

                    expect(event_?.fields.key).toBe("a");
                    expect(event_?.fields.owner).toBe(owner);
                    await unsubscribe();
                });
            });
            describe("method: runBlocking", () => {
                test("Should dispatch KeyAcquiredLockEvent when lock is not acquired", async () => {
                    const key = "a";
                    const owner = "b";
                    const lock = lockProviderA.create(key, {
                        owner,
                        ttl: TTL,
                    });
                    let event_ = null as KeyAcquiredLockEvent | null;
                    const unsubscribe = await lockProviderA.subscribe(
                        KeyAcquiredLockEvent,
                        (event) => {
                            event_ = event;
                        },
                    );

                    await lock.runBlocking(
                        async () => {
                            await LazyPromise.delay(DELAY_TIME);
                        },
                        {
                            time: TimeSpan.fromMilliseconds(5),
                            interval: TimeSpan.fromMilliseconds(5),
                        },
                    );
                    await LazyPromise.delay(DELAY_TIME);

                    expect(event_?.fields.key).toBe("a");
                    expect(event_?.fields.owner).toBe(owner);
                    expect(event_?.fields.ttl?.toMilliseconds()).toBe(
                        TTL.toMilliseconds(),
                    );
                    await unsubscribe();
                });
                test("Should dispatch KeyReleasedLockEvent when lock is not acquired", async () => {
                    const key = "a";
                    const owner = "b";
                    const lock = lockProviderA.create(key, {
                        owner,
                        ttl: TTL,
                    });
                    let event_ = null as KeyReleasedLockEvent | null;
                    const unsubscribe = await lockProviderA.subscribe(
                        KeyReleasedLockEvent,
                        (event) => {
                            event_ = event;
                        },
                    );

                    await lock.runBlocking(
                        async () => {
                            await LazyPromise.delay(DELAY_TIME);
                        },
                        {
                            time: TimeSpan.fromMilliseconds(5),
                            interval: TimeSpan.fromMilliseconds(5),
                        },
                    );
                    await LazyPromise.delay(DELAY_TIME);

                    expect(event_?.fields.key).toBe(key);
                    expect(event_?.fields.owner).toBe(owner);
                    await unsubscribe();
                });
                test("Should dispatch KeyAlreadyAcquiredLockEvent when lock is acquired", async () => {
                    const key = "a";
                    const owner = "b";
                    const lock = lockProviderA.create(key, {
                        owner,
                    });
                    let event_ = null as KeyAlreadyAcquiredLockEvent | null;

                    await lock.acquire();
                    const unsubscribe = await lockProviderA.subscribe(
                        KeyAlreadyAcquiredLockEvent,
                        (event) => {
                            event_ = event;
                        },
                    );

                    await lock.runBlocking(
                        async () => {
                            await LazyPromise.delay(DELAY_TIME);
                        },
                        {
                            time: TimeSpan.fromMilliseconds(5),
                            interval: TimeSpan.fromMilliseconds(5),
                        },
                    );
                    await LazyPromise.delay(DELAY_TIME);

                    expect(event_?.fields.key).toBe("a");
                    expect(event_?.fields.owner).toBe(owner);
                    await unsubscribe();
                });
            });
            describe("method: runOrFail", () => {
                test("Should dispatch KeyAcquiredLockEvent when lock is not acquired", async () => {
                    const key = "a";
                    const owner = "b";
                    const lock = lockProviderA.create(key, {
                        owner,
                        ttl: TTL,
                    });
                    let event_ = null as KeyAcquiredLockEvent | null;
                    const unsubscribe = await lockProviderA.subscribe(
                        KeyAcquiredLockEvent,
                        (event) => {
                            event_ = event;
                        },
                    );

                    await lock.runOrFail(async () => {
                        await LazyPromise.delay(DELAY_TIME);
                    });
                    await LazyPromise.delay(DELAY_TIME);

                    expect(event_?.fields.key).toBe("a");
                    expect(event_?.fields.owner).toBe(owner);
                    expect(event_?.fields.ttl?.toMilliseconds()).toBe(
                        TTL.toMilliseconds(),
                    );
                    await unsubscribe();
                });
                test("Should dispatch KeyReleasedLockEvent when lock is not acquired", async () => {
                    const key = "a";
                    const owner = "b";
                    const lock = lockProviderA.create(key, {
                        owner,
                        ttl: TTL,
                    });
                    let event_ = null as KeyReleasedLockEvent | null;
                    const unsubscribe = await lockProviderA.subscribe(
                        KeyReleasedLockEvent,
                        (event) => {
                            event_ = event;
                        },
                    );

                    await lock.runOrFail(async () => {
                        await LazyPromise.delay(DELAY_TIME);
                    });
                    await LazyPromise.delay(DELAY_TIME);

                    expect(event_?.fields.key).toBe(key);
                    expect(event_?.fields.owner).toBe(owner);
                    await unsubscribe();
                });
                test("Should dispatch KeyAlreadyAcquiredLockEvent when lock is acquired", async () => {
                    const key = "a";
                    const owner = "b";
                    const lock = lockProviderA.create(key, {
                        owner,
                    });
                    let event_ = null as KeyAlreadyAcquiredLockEvent | null;

                    await lock.acquire();
                    const unsubscribe = await lockProviderA.subscribe(
                        KeyAlreadyAcquiredLockEvent,
                        (event) => {
                            event_ = event;
                        },
                    );

                    try {
                        await lock.runOrFail(async () => {
                            await LazyPromise.delay(DELAY_TIME);
                        });
                        await LazyPromise.delay(DELAY_TIME);
                    } catch {
                        /* Empty */
                    }

                    expect(event_?.fields.key).toBe("a");
                    expect(event_?.fields.owner).toBe(owner);
                    await unsubscribe();
                });
            });
            describe("method: acquire", () => {
                test("Should dispatch KeyAcquiredLockEvent when lock is not acquired", async () => {
                    const key = "a";
                    const owner = "b";
                    const lock = lockProviderA.create(key, {
                        owner,
                        ttl: TTL,
                    });
                    let event_ = null as KeyAcquiredLockEvent | null;
                    const unsubscribe = await lockProviderA.subscribe(
                        KeyAcquiredLockEvent,
                        (event) => {
                            event_ = event;
                        },
                    );

                    await lock.acquire();
                    await LazyPromise.delay(DELAY_TIME);

                    expect(event_?.fields.key).toBe("a");
                    expect(event_?.fields.owner).toBe(owner);
                    expect(event_?.fields.ttl?.toMilliseconds()).toBe(
                        TTL.toMilliseconds(),
                    );
                    await unsubscribe();
                });
                test("Should dispatch KeyAlreadyAcquiredLockEvent when lock is acquired", async () => {
                    const key = "a";
                    const owner = "b";
                    const lock = lockProviderA.create(key, {
                        owner,
                    });
                    let event_ = null as KeyAlreadyAcquiredLockEvent | null;

                    await lock.acquire();
                    const unsubscribe = await lockProviderA.subscribe(
                        KeyAlreadyAcquiredLockEvent,
                        (event) => {
                            event_ = event;
                        },
                    );

                    await lock.acquire();
                    await LazyPromise.delay(DELAY_TIME);

                    expect(event_?.fields.key).toBe("a");
                    expect(event_?.fields.owner).toBe(owner);
                    await unsubscribe();
                });
            });
            describe("method: acquireBlocking", () => {
                test("Should dispatch KeyAcquiredLockEvent when lock is not acquired", async () => {
                    const key = "a";
                    const owner = "b";
                    const lock = lockProviderA.create(key, {
                        owner,
                        ttl: TTL,
                    });
                    let event_ = null as KeyAcquiredLockEvent | null;
                    const unsubscribe = await lockProviderA.subscribe(
                        KeyAcquiredLockEvent,
                        (event) => {
                            event_ = event;
                        },
                    );

                    await lock.acquire();
                    await LazyPromise.delay(DELAY_TIME);

                    expect(event_?.fields.key).toBe("a");
                    expect(event_?.fields.owner).toBe(owner);
                    expect(event_?.fields.ttl?.toMilliseconds()).toBe(
                        TTL.toMilliseconds(),
                    );
                    await unsubscribe();
                });
                test("Should dispatch KeyAlreadyAcquiredLockEvent when lock is acquired", async () => {
                    const key = "a";
                    const owner = "b";
                    const lock = lockProviderA.create(key, {
                        owner,
                    });
                    let event_ = null as KeyAlreadyAcquiredLockEvent | null;

                    await lock.acquire();
                    const unsubscribe = await lockProviderA.subscribe(
                        KeyAlreadyAcquiredLockEvent,
                        (event) => {
                            event_ = event;
                        },
                    );

                    await lock.acquire();
                    await LazyPromise.delay(DELAY_TIME);

                    expect(event_?.fields.key).toBe("a");
                    expect(event_?.fields.owner).toBe(owner);
                    await unsubscribe();
                });
            });
            describe("method: acquireOrFail", () => {
                test("Should dispatch KeyAcquiredLockEvent when lock is not acquired", async () => {
                    const key = "a";
                    const owner = "b";
                    const lock = lockProviderA.create(key, {
                        owner,
                        ttl: TTL,
                    });
                    let event_ = null as KeyAcquiredLockEvent | null;
                    const unsubscribe = await lockProviderA.subscribe(
                        KeyAcquiredLockEvent,
                        (event) => {
                            event_ = event;
                        },
                    );

                    await lock.acquireOrFail();
                    await LazyPromise.delay(DELAY_TIME);

                    expect(event_?.fields.key).toBe("a");
                    expect(event_?.fields.owner).toBe(owner);
                    expect(event_?.fields.ttl?.toMilliseconds()).toBe(
                        TTL.toMilliseconds(),
                    );
                    await unsubscribe();
                });
                test("Should dispatch KeyAlreadyAcquiredLockEvent when lock is acquired", async () => {
                    const key = "a";
                    const owner = "b";
                    const lock = lockProviderA.create(key, {
                        owner,
                    });
                    let event_ = null as KeyAlreadyAcquiredLockEvent | null;

                    await lock.acquireOrFail();
                    const unsubscribe = await lockProviderA.subscribe(
                        KeyAlreadyAcquiredLockEvent,
                        (event) => {
                            event_ = event;
                        },
                    );

                    try {
                        await lock.acquireOrFail();
                        await LazyPromise.delay(DELAY_TIME);
                    } catch {
                        /* Empty */
                    }

                    expect(event_?.fields.key).toBe("a");
                    expect(event_?.fields.owner).toBe(owner);
                    await unsubscribe();
                });
            });
            describe("method: release", () => {
                test("Should dispatch KeyReleasedLockEvent when released by same owner", async () => {
                    const key = "a";
                    const owner = "b";
                    const lock = lockProviderA.create(key, {
                        owner,
                    });

                    await lock.acquire();
                    let event_ = null as KeyReleasedLockEvent | null;
                    const unsubscribe = await lockProviderA.subscribe(
                        KeyReleasedLockEvent,
                        (event) => {
                            event_ = event;
                        },
                    );
                    await lock.release();
                    await LazyPromise.delay(DELAY_TIME);

                    expect(event_?.fields.key).toBe(key);
                    expect(event_?.fields.owner).toBe(owner);
                    await unsubscribe();
                });
                test("Should dispatch UnownedReleaseLockEvent when released by same owner", async () => {
                    const key = "a";
                    const owner1 = "b";
                    const lock1 = lockProviderA.create(key, {
                        owner: owner1,
                    });
                    await lock1.acquire();

                    const owner2 = "c";
                    const lock2 = lockProviderA.create(key, {
                        owner: owner2,
                    });
                    let event_ = null as UnownedReleaseLockEvent | null;
                    const unsubscribe = await lockProviderA.subscribe(
                        UnownedReleaseLockEvent,
                        (event) => {
                            event_ = event;
                        },
                    );
                    await lock2.release();
                    await LazyPromise.delay(DELAY_TIME);

                    expect(event_?.fields.key).toBe(key);
                    expect(event_?.fields.owner).toBe(owner2);
                    await unsubscribe();
                });
            });
            describe("method: releaseOrFail", () => {
                test("Should dispatch KeyReleasedLockEvent when released by same owner", async () => {
                    const key = "a";
                    const owner = "b";
                    const lock = lockProviderA.create(key, {
                        owner,
                    });

                    await lock.acquire();
                    let event_ = null as KeyReleasedLockEvent | null;
                    const unsubscribe = await lockProviderA.subscribe(
                        KeyReleasedLockEvent,
                        (event) => {
                            event_ = event;
                        },
                    );
                    await lock.releaseOrFail();
                    await LazyPromise.delay(DELAY_TIME);

                    expect(event_?.fields.key).toBe(key);
                    expect(event_?.fields.owner).toBe(owner);
                    await unsubscribe();
                });
                test("Should dispatch UnownedReleaseLockEvent when released by same owner", async () => {
                    const key = "a";
                    const owner1 = "b";
                    const lock1 = lockProviderA.create(key, {
                        owner: owner1,
                    });
                    await lock1.acquire();

                    const owner2 = "c";
                    const lock2 = lockProviderA.create(key, {
                        owner: owner2,
                    });
                    let event_ = null as UnownedReleaseLockEvent | null;
                    const unsubscribe = await lockProviderA.subscribe(
                        UnownedReleaseLockEvent,
                        (event) => {
                            event_ = event;
                        },
                    );
                    try {
                        await lock2.releaseOrFail();
                        await LazyPromise.delay(DELAY_TIME);
                    } catch {
                        /* Empty */
                    }

                    expect(event_?.fields.key).toBe(key);
                    expect(event_?.fields.owner).toBe(owner2);
                    await unsubscribe();
                });
            });
            describe("method: forceRelease", () => {
                test("Should dispatch KeyForceReleasedLockEvent when lock forcefully released", async () => {
                    const key = "a";
                    const owner1 = "b";
                    const lock1 = lockProviderA.create(key, {
                        owner: owner1,
                    });
                    await lock1.acquire();

                    const owner2 = "c";
                    const lock2 = lockProviderA.create(key, {
                        owner: owner2,
                    });
                    let event_ = null as KeyForceReleasedLockEvent | null;
                    const unsubscribe = await lockProviderA.subscribe(
                        KeyForceReleasedLockEvent,
                        (event) => {
                            event_ = event;
                        },
                    );
                    await lock2.forceRelease();
                    await LazyPromise.delay(DELAY_TIME);

                    expect(event_?.fields.key).toBe(key);
                    await unsubscribe();
                });
            });
            describe("method: refresh", () => {
                test("Should dispatch KeyRefreshedLockEvent when refreshed by same owner", async () => {
                    const key = "a";
                    const owner = "b";
                    const lock = lockProviderA.create(key, {
                        owner,
                        ttl: TTL,
                    });

                    await lock.acquire();
                    let event_ = null as KeyRefreshedLockEvent | null;
                    const unsubscribe = await lockProviderA.subscribe(
                        KeyRefreshedLockEvent,
                        (event) => {
                            event_ = event;
                        },
                    );
                    await LazyPromise.delay(TTL.divide(2));
                    const newTTL = TTL.multiply(2);
                    await lock.refresh(newTTL);
                    await LazyPromise.delay(DELAY_TIME);

                    expect(event_?.fields.key).toBe(key);
                    expect(event_?.fields.owner).toBe(owner);
                    expect(event_?.fields.ttl.toMilliseconds()).toBe(
                        newTTL.toMilliseconds(),
                    );
                    await unsubscribe();
                });
                test("Should dispatch UnownedRefreshLockEvent when refreshed by different owner", async () => {
                    const key = "a";
                    const owner1 = "b";
                    const lock1 = lockProviderA.create(key, {
                        owner: owner1,
                        ttl: TTL,
                    });
                    await lock1.acquire();

                    const owner2 = "c";
                    const lock2 = lockProviderA.create(key, {
                        owner: owner2,
                    });
                    let event_ = null as UnownedRefreshLockEvent | null;
                    const unsubscribe = await lockProviderA.subscribe(
                        UnownedRefreshLockEvent,
                        (event) => {
                            event_ = event;
                        },
                    );
                    await LazyPromise.delay(TTL.divide(2));
                    const newTTL = TTL.multiply(2);
                    await lock2.refresh(newTTL);
                    await LazyPromise.delay(DELAY_TIME);

                    expect(event_?.fields.key).toBe(key);
                    expect(event_?.fields.owner).toBe(owner2);
                    await unsubscribe();
                });
            });
            describe("method: refreshOrFail", () => {
                test("Should dispatch KeyRefreshedLockEvent when refreshed by same owner", async () => {
                    const key = "a";
                    const owner = "b";
                    const lock = lockProviderA.create(key, {
                        owner,
                        ttl: TTL,
                    });

                    await lock.acquire();
                    let event_ = null as KeyRefreshedLockEvent | null;
                    const unsubscribe = await lockProviderA.subscribe(
                        KeyRefreshedLockEvent,
                        (event) => {
                            event_ = event;
                        },
                    );
                    await LazyPromise.delay(TTL.divide(2));
                    const newTTL = TTL.multiply(2);
                    await lock.refreshOrFail(newTTL);
                    await LazyPromise.delay(DELAY_TIME);

                    expect(event_?.fields.key).toBe(key);
                    expect(event_?.fields.owner).toBe(owner);
                    expect(event_?.fields.ttl.toMilliseconds()).toBe(
                        newTTL.toMilliseconds(),
                    );
                    await unsubscribe();
                });
                test("Should dispatch UnownedRefreshLockEvent when refreshed by different owner", async () => {
                    const key = "a";
                    const owner1 = "b";
                    const lock1 = lockProviderA.create(key, {
                        owner: owner1,
                        ttl: TTL,
                    });
                    await lock1.acquire();

                    const owner2 = "c";
                    const lock2 = lockProviderA.create(key, {
                        owner: owner2,
                    });
                    let event_ = null as UnownedRefreshLockEvent | null;
                    const unsubscribe = await lockProviderA.subscribe(
                        UnownedRefreshLockEvent,
                        (event) => {
                            event_ = event;
                        },
                    );
                    await LazyPromise.delay(TTL.divide(2));
                    const newTTL = TTL.multiply(2);
                    try {
                        await lock2.refreshOrFail(newTTL);
                        await LazyPromise.delay(DELAY_TIME);
                    } catch {
                        /* Empty */
                    }

                    expect(event_?.fields.key).toBe(key);
                    expect(event_?.fields.owner).toBe(owner2);
                    await unsubscribe();
                });
            });
        });
    });
    describe("Group tests:", () => {
        test("method: run", async () => {
            const key = "a";

            const ownerA = "b";
            const lockA = lockProviderA.create(key, {
                owner: ownerA,
            });
            const promiseA = lockA.run(async () => {
                await LazyPromise.delay(DELAY_TIME);
                return "a";
            });

            const ownerB = "c";
            const lockB = lockProviderB.create(key, {
                owner: ownerB,
            });
            const promiseB = lockB.run(async () => {
                await LazyPromise.delay(DELAY_TIME);
                return "a";
            });

            const [[resultA, errorA], [resultB, errorB]] = await Promise.all([
                promiseA,
                promiseB,
            ]);
            expect(resultA).toBe("a");
            expect(errorA).toBeNull();
            expect(resultB).toBe("a");
            expect(errorB).toBeNull();
        });
        test("method: runBlocking", async () => {
            const key = "a";

            const ownerA = "b";
            const lockA = lockProviderA.create(key, {
                owner: ownerA,
            });
            const promiseA = lockA.run(async () => {
                await LazyPromise.delay(DELAY_TIME);
                return "a";
            });

            const ownerB = "c";
            const lockB = lockProviderB.create(key, {
                owner: ownerB,
            });
            const promiseB = lockB.runBlocking(
                async () => {
                    await LazyPromise.delay(DELAY_TIME);
                    return "a";
                },
                {
                    time: TimeSpan.fromMilliseconds(5),
                    interval: TimeSpan.fromMilliseconds(5),
                },
            );

            const [[resultA, errorA], [resultB, errorB]] = await Promise.all([
                promiseA,
                promiseB,
            ]);
            expect(resultA).toBe("a");
            expect(errorA).toBeNull();
            expect(resultB).toBe("a");
            expect(errorB).toBeNull();
        });
        test("method: runOrFail", async () => {
            const key = "a";

            const ownerA = "b";
            const lockA = lockProviderA.create(key, {
                owner: ownerA,
            });
            const promiseA = lockA.runOrFail(async () => {
                await LazyPromise.delay(DELAY_TIME);
                return "a";
            });

            const ownerB = "c";
            const lockB = lockProviderB.create(key, {
                owner: ownerB,
            });
            const promiseB = lockB.runOrFail(async () => {
                await LazyPromise.delay(DELAY_TIME);
                return "a";
            });

            const [resultA, resultB] = await Promise.all([promiseA, promiseB]);
            expect(resultA).toBe("a");
            expect(resultB).toBe("a");
        });
        test("method: acquire", async () => {
            const key = "a";

            const ownerA = "b";
            const lockA = lockProviderA.create(key, {
                owner: ownerA,
            });
            const resultA = await lockA.acquire();

            const ownerB = "c";
            const lockB = lockProviderB.create(key, {
                owner: ownerB,
            });
            const resultB = await lockB.acquire();

            expect(resultA).toBe(true);
            expect(resultB).toBe(true);
        });
        test("method: acquireBlocking", async () => {
            const key = "a";

            const ownerA = "b";
            const lockA = lockProviderA.create(key, {
                owner: ownerA,
            });
            const resultA = await lockA.acquireBlocking({
                time: TimeSpan.fromMilliseconds(5),
                interval: TimeSpan.fromMilliseconds(5),
            });

            const ownerB = "c";
            const lockB = lockProviderB.create(key, {
                owner: ownerB,
            });
            const resultB = await lockB.acquire();

            expect(resultA).toBe(true);
            expect(resultB).toBe(true);
        });
        test("method: acquireOrFail", async () => {
            const key = "a";

            const ownerA = "b";
            const lockA = lockProviderA.create(key, {
                owner: ownerA,
            });
            const promiseA = lockA.acquireOrFail();

            const ownerB = "c";
            const lockB = lockProviderB.create(key, {
                owner: ownerB,
            });
            const promiseB = lockB.acquireOrFail();

            await expect(promiseA).resolves.toBeUndefined();
            await expect(promiseB).resolves.toBeUndefined();
        });
        test("method: release", async () => {
            const key = "a";
            const owner = "b";

            const lockA = lockProviderA.create(key, {
                owner,
            });
            await lockA.acquire();

            const lockB = lockProviderB.create(key, {
                owner,
            });
            await lockB.acquire();

            await lockA.release();
            const resultA = await lockA.isLocked();
            const resultB = await lockB.isLocked();

            expect(resultA).toBe(false);
            expect(resultB).toBe(true);
        });
        test("method: releaseOrFail", async () => {
            const key = "a";
            const owner = "b";

            const lockA = lockProviderA.create(key, {
                owner,
            });
            await lockA.acquire();

            const lockB = lockProviderB.create(key, {
                owner,
            });
            await lockB.acquire();

            await lockA.releaseOrFail();
            const resultA = await lockA.isLocked();
            const resultB = await lockB.isLocked();

            expect(resultA).toBe(false);
            expect(resultB).toBe(true);
        });
        test("method: forceRelease", async () => {
            const key = "a";
            const owner = "b";

            const lockA = lockProviderA.create(key, {
                owner,
            });
            await lockA.acquire();

            const lockB = lockProviderB.create(key, {
                owner,
            });
            await lockB.acquire();

            await lockA.forceRelease();
            const resultA = await lockA.isLocked();
            const resultB = await lockB.isLocked();

            expect(resultA).toBe(false);
            expect(resultB).toBe(true);
        });
        test("method: isExpired", async () => {
            const key = "a";
            const owner = "b";
            const lockA = lockProviderA.create(key, { owner });
            const lockB = lockProviderB.create(key, { owner });
            await lockA.acquire();
            await lockB.acquire();

            await lockA.release();
            const resultA = await lockA.isExpired();
            const resultB = await lockB.isExpired();

            expect(resultA).toBe(true);
            expect(resultB).toBe(false);
        });
        test("method: isLocked", async () => {
            const key = "a";
            const owner = "b";
            const lockA = lockProviderA.create(key, { owner });
            const lockB = lockProviderB.create(key, { owner });
            await lockA.acquire();
            await lockB.acquire();

            await lockA.release();
            const resultA = await lockA.isLocked();
            const resultB = await lockB.isLocked();

            expect(resultA).toBe(false);
            expect(resultB).toBe(true);
        });
        test("method: refresh", async () => {
            const key = "a";
            const owner = "b";
            const ttl = TTL;
            const lockA = lockProviderA.create(key, {
                owner,
                ttl,
            });
            const lockB = lockProviderB.create(key, {
                owner,
                ttl,
            });
            await Promise.all([lockA.acquire(), lockB.acquire()]);

            await LazyPromise.delay(ttl.divide(2));
            await lockA.refresh();
            await LazyPromise.delay(ttl.divide(2));

            const resultA = await lockA.isExpired();
            const resultB = await lockB.isExpired();

            expect(resultA).toBe(false);
            expect(resultB).toBe(true);
        });
        test("method: refreshOrFail", async () => {
            const key = "a";
            const owner = "b";
            const ttl = TTL;
            const lockA = lockProviderA.create(key, {
                owner,
                ttl,
            });
            const lockB = lockProviderB.create(key, {
                owner,
                ttl,
            });
            await Promise.all([lockA.acquire(), lockB.acquire()]);

            await LazyPromise.delay(ttl.divide(2));
            await lockA.refreshOrFail();
            await LazyPromise.delay(ttl.divide(2));

            const resultA = await lockA.isExpired();
            const resultB = await lockB.isExpired();

            expect(resultA).toBe(false);
            expect(resultB).toBe(true);
        });
        test("method: addListener / dispatch", async () => {
            let result_a: KeyAcquiredLockEvent | null = null;
            const key = "a";
            const lockA = lockProviderA.create(key);
            await lockProviderA.addListener(KeyAcquiredLockEvent, (event) => {
                result_a = event;
            });

            let result_b: KeyAcquiredLockEvent | null = null;
            await lockProviderB.addListener(KeyAcquiredLockEvent, (event) => {
                result_b = event;
            });

            await lockA.acquire();
            await LazyPromise.delay(DELAY_TIME);

            expect(result_a).toBeInstanceOf(KeyAcquiredLockEvent);
            expect(result_b).toBeNull();
        });
        test("method: removeListener / addListener / dispatch", async () => {
            let result_a: KeyAcquiredLockEvent | null = null;
            const key = "a";
            const lockA = lockProviderA.create(key);
            await lockProviderA.addListener(KeyAcquiredLockEvent, (event) => {
                result_a = event;
            });

            let result_b: KeyAcquiredLockEvent | null = null;
            const listenerB = (event: KeyAcquiredLockEvent) => {
                result_b = event;
            };
            const lockB = lockProviderB.create(key);
            await lockProviderB.addListener(KeyAcquiredLockEvent, listenerB);
            await lockProviderB.removeListener(KeyAcquiredLockEvent, listenerB);

            await lockA.acquire();
            await lockB.acquire();
            await LazyPromise.delay(DELAY_TIME);

            expect(result_a).toBeInstanceOf(KeyAcquiredLockEvent);
            expect(result_b).toBeNull();
        });
        test("method: subscribe / dispatch", async () => {
            let result_a: KeyAcquiredLockEvent | null = null;
            const key = "a";
            const lockA = lockProviderA.create(key);
            await lockProviderA.subscribe(KeyAcquiredLockEvent, (event) => {
                result_a = event;
            });

            let result_b: KeyAcquiredLockEvent | null = null;
            const listenerB = (event: KeyAcquiredLockEvent) => {
                result_b = event;
            };
            const lockB = lockProviderB.create(key);
            const unsubscribe = await lockProviderB.subscribe(
                KeyAcquiredLockEvent,
                listenerB,
            );
            await unsubscribe();

            await lockA.acquire();
            await lockB.acquire();
            await LazyPromise.delay(DELAY_TIME);

            expect(result_a).toBeInstanceOf(KeyAcquiredLockEvent);
            expect(result_b).toBeNull();
        });
    });
    describe("Serde tests:", () => {
        test("Should preserve state", async () => {
            const key = "a";
            const owner = "b";
            const lock = lockProviderA.create(key, {
                owner,
            });

            await lock.acquire();
            const deserializedLock = serde.deserialize<ILock>(
                serde.serialize(lock),
            );

            expect(await deserializedLock.isLocked()).toBe(true);
            expect(await deserializedLock.isExpired()).toBe(false);
        });
        test("Should preserve owner", async () => {
            const key = "a";
            const owner = "b";
            const lock = lockProviderA.create(key, {
                owner,
            });

            const deserializedLock = serde.deserialize<ILock>(
                serde.serialize(lock),
            );

            expect(await deserializedLock.getOwner()).toBe(owner);
        });
        test("Should preserve ttl", async () => {
            const key = "a";
            const owner = "b";
            const ttl = TTL.multiply(2);
            const lock = lockProviderA.create(key, {
                owner,
                ttl,
            });
            await lock.acquire();

            const deserializedLock = serde.deserialize<ILock>(
                serde.serialize(lock),
            );
            const delayTime = TTL;
            await LazyPromise.delay(delayTime);

            expect(await deserializedLock.isLocked()).toBe(true);
            await LazyPromise.delay(delayTime);

            expect(await deserializedLock.isLocked()).toBe(false);
        });
    });
}
