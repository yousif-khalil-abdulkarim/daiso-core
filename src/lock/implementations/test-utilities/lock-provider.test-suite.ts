/**
 * @module Lock
 */
import {
    type TestAPI,
    type SuiteAPI,
    type ExpectStatic,
    type beforeEach,
    vi,
} from "vitest";
import type { ILockProvider, ILock } from "@/lock/contracts/_module-exports.js";
import {
    type UnownedRefreshTryLockEvent,
    type ForceReleasedLockEvent,
    type UnavailableLockEvent,
    type UnownedReleaseTryLockEvent,
    type ReleasedLockEvent,
    type RefreshedLockEvent,
    type AcquiredLockEvent,
    KeyAlreadyAcquiredLockError,
    UnownedRefreshLockError,
    UnownedReleaseLockError,
    LOCK_EVENTS,
    UnrefreshableKeyLockError,
} from "@/lock/contracts/_module-exports.js";
import {
    RESULT,
    resultSuccess,
    type Promisable,
    type ResultFailure,
} from "@/utilities/_module-exports.js";
import { TimeSpan } from "@/utilities/_module-exports.js";
import type { ISerde } from "@/serde/contracts/_module-exports.js";
import { NoOpSerdeAdapter } from "@/serde/implementations/adapters/_module-exports.js";
import { Serde } from "@/serde/implementations/derivables/_module-exports.js";
import { LazyPromise } from "@/async/_module-exports.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/test-utilities"`
 * @group Utilities
 */
export type LockProviderTestSuiteSettings = {
    expect: ExpectStatic;
    test: TestAPI;
    describe: SuiteAPI;
    beforeEach: typeof beforeEach;
    createLockProvider: () => Promisable<ILockProvider>;
    serde?: ISerde;
};

/**
 * The `lockProviderTestSuite` function simplifies the process of testing your custom implementation of {@link ILock | `ILock`} with `vitest`.
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/test-utilities"`
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
 *
 * describe("class: LockProvider", () => {
 *     const serde = new Serde(new SuperJsonSerdeAdapter());
 *     let map: Map<string, ILockData>;
 *     lockProviderTestSuite({
 *         createLockProvider: () => {
 *             return new LockProvider({
 *                 serde,
 *                 adapter: new MemoryLockAdapter(),
 *             });
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

    let lockProvider: ILockProvider;
    beforeEach(async () => {
        lockProvider = await createLockProvider();
    });
    async function delay(time: TimeSpan): Promise<void> {
        await LazyPromise.delay(time.addMilliseconds(10));
    }
    const RETURN_VALUE = "RETURN_VALUE";

    describe("Api tests:", () => {
        describe("method: run", () => {
            test("Should call acquire method", async () => {
                const key = "a";
                const ttl = null;
                const lock = lockProvider.create(key, {
                    ttl,
                });

                const acquireSpy = vi.spyOn(lock, "acquire");

                await lock.run(() => {
                    return Promise.resolve(RETURN_VALUE);
                });

                expect(acquireSpy).toHaveBeenCalledTimes(1);
            });
            test("Should call acquire before release method", async () => {
                const key = "a";
                const ttl = null;
                const lock = lockProvider.create(key, {
                    ttl,
                });

                const acquireSpy = vi.spyOn(lock, "acquire");
                const releaseSpy = vi.spyOn(lock, "release");

                await lock.run(() => {
                    return Promise.resolve(RETURN_VALUE);
                });

                expect(acquireSpy).toHaveBeenCalledBefore(releaseSpy);
            });
            test("Should call release method", async () => {
                const key = "a";
                const ttl = null;
                const lock = lockProvider.create(key, {
                    ttl,
                });

                const releaseSpy = vi.spyOn(lock, "release");

                await lock.run(() => {
                    return Promise.resolve(RETURN_VALUE);
                });

                expect(releaseSpy).toHaveBeenCalledTimes(1);
            });
            test("Should call release after acquire method", async () => {
                const key = "a";
                const ttl = null;
                const lock = lockProvider.create(key, {
                    ttl,
                });

                const releaseSpy = vi.spyOn(lock, "release");
                const acquireSpy = vi.spyOn(lock, "acquire");

                await lock.run(() => {
                    return Promise.resolve(RETURN_VALUE);
                });

                expect(releaseSpy).toHaveBeenCalledAfter(acquireSpy);
            });
            test("Should call release when an error is thrown", async () => {
                const key = "a";
                const ttl = null;
                const lock = lockProvider.create(key, {
                    ttl,
                });

                const releaseSpy = vi.spyOn(lock, "release");

                try {
                    await lock.run(() => {
                        return Promise.reject(new Error());
                    });
                } catch {
                    /* EMPTY */
                }

                expect(releaseSpy).toHaveBeenCalledTimes(1);
            });
            test("Should propagate thrown error", async () => {
                const key = "a";
                const ttl = null;
                const lock = lockProvider.create(key, {
                    ttl,
                });

                class CustomError extends Error {}

                const error = lock.run(() => {
                    return Promise.reject(new CustomError());
                });

                await expect(error).rejects.toBeInstanceOf(CustomError);
            });
            test("Should call handler function when key doesnt exists", async () => {
                const key = "a";
                const ttl = null;

                const handlerFn = vi.fn(() => {
                    return Promise.resolve(RETURN_VALUE);
                });
                await lockProvider
                    .create(key, {
                        ttl,
                    })
                    .run(handlerFn);

                expect(handlerFn).toHaveBeenCalledTimes(1);
            });
            test("Should call handler function when key is expired", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);

                await lockProvider.create(key, { ttl }).acquire();
                await delay(ttl);

                const handlerFn = vi.fn(() => {
                    return Promise.resolve(RETURN_VALUE);
                });
                await lockProvider.create(key, { ttl }).run(handlerFn);

                expect(handlerFn).toHaveBeenCalledTimes(1);
            });
            test("Should call handler function when key is unexpireable and acquired by same owner", async () => {
                const key = "a";
                const ttl = null;

                const lock = lockProvider.create(key, { ttl });
                await lock.acquire();
                const handlerFn = vi.fn(() => {
                    return Promise.resolve(RETURN_VALUE);
                });
                await lock.run(handlerFn);

                expect(handlerFn).toHaveBeenCalledTimes(1);
            });
            test("Should call handler function when key is unexpired and acquired by same owner", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);

                const lock = lockProvider.create(key, {
                    ttl,
                });
                await lock.acquire();
                const handlerFn = vi.fn(() => {
                    return Promise.resolve(RETURN_VALUE);
                });
                await lock.run(handlerFn);

                expect(handlerFn).toHaveBeenCalledTimes(1);
            });
            test("Should not call handler function when key is unexpireable and acquired by different owner", async () => {
                const key = "a";
                const ttl = null;

                await lockProvider.create(key, { ttl }).acquire();
                const handlerFn = vi.fn(() => {
                    return Promise.resolve(RETURN_VALUE);
                });
                await lockProvider.create(key, { ttl }).run(handlerFn);

                expect(handlerFn).not.toHaveBeenCalled();
            });
            test("Should not call handler function when key is unexpired and acquired by different owner", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);

                await lockProvider.create(key, { ttl }).acquire();
                const handlerFn = vi.fn(() => {
                    return Promise.resolve(RETURN_VALUE);
                });
                await lockProvider.create(key, { ttl }).run(handlerFn);

                expect(handlerFn).not.toHaveBeenCalled();
            });
            test("Should return ResultSuccess<string> when key doesnt exists", async () => {
                const key = "a";
                const ttl = null;

                const result = await lockProvider
                    .create(key, {
                        ttl,
                    })
                    .run(() => {
                        return Promise.resolve(RETURN_VALUE);
                    });

                expect(result).toEqual(resultSuccess(RETURN_VALUE));
            });
            test("Should return ResultSuccess<string> when key is expired", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);

                await lockProvider.create(key, { ttl }).acquire();
                await delay(ttl);

                const result = await lockProvider
                    .create(key, { ttl })
                    .run(() => {
                        return Promise.resolve(RETURN_VALUE);
                    });

                expect(result).toEqual(resultSuccess(RETURN_VALUE));
            });
            test("Should return ResultSuccess<string> when key is unexpireable and acquired by same owner", async () => {
                const key = "a";
                const ttl = null;

                const lock = lockProvider.create(key, { ttl });
                await lock.acquire();
                const result = await lock.run(() => {
                    return Promise.resolve(RETURN_VALUE);
                });

                expect(result).toEqual(resultSuccess(RETURN_VALUE));
            });
            test("Should return ResultSuccess<string> when key is unexpired and acquired by same owner", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);

                const lock = lockProvider.create(key, {
                    ttl,
                });
                await lock.acquire();
                const result = await lock.run(() => {
                    return Promise.resolve(RETURN_VALUE);
                });

                expect(result).toEqual(resultSuccess(RETURN_VALUE));
            });
            test("Should return ResultFailure<KeyAlreadyAcquiredLockError> when key is unexpireable and acquired by different owner", async () => {
                const key = "a";
                const ttl = null;

                await lockProvider.create(key, { ttl }).acquire();
                const result = await lockProvider
                    .create(key, { ttl })
                    .run(() => {
                        return Promise.resolve(RETURN_VALUE);
                    });

                expect(result.type).toBe(RESULT.FAILURE);
                expect((result as ResultFailure).error).toBeInstanceOf(
                    KeyAlreadyAcquiredLockError,
                );
            });
            test("Should return ResultFailure<KeyAlreadyAcquiredLockError> when key is unexpired and acquired by different owner", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);

                await lockProvider.create(key, { ttl }).acquire();
                const result = await lockProvider
                    .create(key, { ttl })
                    .run(() => {
                        return Promise.resolve(RETURN_VALUE);
                    });

                expect(result.type).toBe(RESULT.FAILURE);
                expect((result as ResultFailure).error).toBeInstanceOf(
                    KeyAlreadyAcquiredLockError,
                );
            });
        });
        describe("method: runOrFail", () => {
            test("Should call acquireOrFail method", async () => {
                const key = "a";
                const ttl = null;
                const lock = lockProvider.create(key, {
                    ttl,
                });

                const acquireSpy = vi.spyOn(lock, "acquireOrFail");

                await lock.runOrFail(() => {
                    return Promise.resolve(RETURN_VALUE);
                });

                expect(acquireSpy).toHaveBeenCalledTimes(1);
            });
            test("Should call acquireOrFail before release method", async () => {
                const key = "a";
                const ttl = null;
                const lock = lockProvider.create(key, {
                    ttl,
                });

                const acquireSpy = vi.spyOn(lock, "acquireOrFail");
                const releaseSpy = vi.spyOn(lock, "release");

                await lock.runOrFail(() => {
                    return Promise.resolve(RETURN_VALUE);
                });

                expect(acquireSpy).toHaveBeenCalledBefore(releaseSpy);
            });
            test("Should call release method", async () => {
                const key = "a";
                const ttl = null;
                const lock = lockProvider.create(key, {
                    ttl,
                });

                const releaseSpy = vi.spyOn(lock, "release");

                await lock.runOrFail(() => {
                    return Promise.resolve(RETURN_VALUE);
                });

                expect(releaseSpy).toHaveBeenCalledTimes(1);
            });
            test("Should call release after acquireOrFail method", async () => {
                const key = "a";
                const ttl = null;
                const lock = lockProvider.create(key, {
                    ttl,
                });

                const releaseSpy = vi.spyOn(lock, "release");
                const acquireSpy = vi.spyOn(lock, "acquireOrFail");

                await lock.runOrFail(() => {
                    return Promise.resolve(RETURN_VALUE);
                });

                expect(releaseSpy).toHaveBeenCalledAfter(acquireSpy);
            });
            test("Should call release when an error is thrown", async () => {
                const key = "a";
                const ttl = null;
                const lock = lockProvider.create(key, {
                    ttl,
                });

                const releaseSpy = vi.spyOn(lock, "release");

                try {
                    await lock.runOrFail(() => {
                        return Promise.reject(new Error());
                    });
                } catch {
                    /* EMPTY */
                }

                expect(releaseSpy).toHaveBeenCalledTimes(1);
            });
            test("Should propagate thrown error", async () => {
                const key = "a";
                const ttl = null;
                const lock = lockProvider.create(key, {
                    ttl,
                });

                class CustomError extends Error {}

                const error = lock.runOrFail(() => {
                    return Promise.reject(new CustomError());
                });

                await expect(error).rejects.toBeInstanceOf(CustomError);
            });
            test("Should call handler function when key doesnt exists", async () => {
                const key = "a";
                const ttl = null;

                const handlerFn = vi.fn(() => {
                    return Promise.resolve(RETURN_VALUE);
                });
                await lockProvider
                    .create(key, {
                        ttl,
                    })
                    .runOrFail(handlerFn);

                expect(handlerFn).toHaveBeenCalledTimes(1);
            });
            test("Should call handler function when key is expired", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);

                await lockProvider.create(key, { ttl }).acquire();
                await delay(ttl);

                const handlerFn = vi.fn(() => {
                    return Promise.resolve(RETURN_VALUE);
                });
                await lockProvider.create(key, { ttl }).runOrFail(handlerFn);

                expect(handlerFn).toHaveBeenCalledTimes(1);
            });
            test("Should call handler function when key is unexpireable and acquired by same owner", async () => {
                const key = "a";
                const ttl = null;

                const lock = lockProvider.create(key, { ttl });
                await lock.acquire();
                const handlerFn = vi.fn(() => {
                    return Promise.resolve(RETURN_VALUE);
                });
                await lock.runOrFail(handlerFn);

                expect(handlerFn).toHaveBeenCalledTimes(1);
            });
            test("Should call handler function when key is unexpired and acquired by same owner", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);

                const lock = lockProvider.create(key, {
                    ttl,
                });
                await lock.acquire();
                const handlerFn = vi.fn(() => {
                    return Promise.resolve(RETURN_VALUE);
                });
                await lock.runOrFail(handlerFn);

                expect(handlerFn).toHaveBeenCalledTimes(1);
            });
            test("Should not call handler function when key is unexpireable and acquired by different owner", async () => {
                const key = "a";
                const ttl = null;

                await lockProvider.create(key, { ttl }).acquire();
                const handlerFn = vi.fn(() => {
                    return Promise.resolve(RETURN_VALUE);
                });
                try {
                    await lockProvider
                        .create(key, { ttl })
                        .runOrFail(handlerFn);
                } catch {
                    /* EMPTY */
                }

                expect(handlerFn).not.toHaveBeenCalled();
            });
            test("Should not call handler function when key is unexpired and acquired by different owner", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);

                await lockProvider.create(key, { ttl }).acquire();
                const handlerFn = vi.fn(() => {
                    return Promise.resolve(RETURN_VALUE);
                });
                try {
                    await lockProvider
                        .create(key, { ttl })
                        .runOrFail(handlerFn);
                } catch {
                    /* EMPTY */
                }

                expect(handlerFn).not.toHaveBeenCalled();
            });
            test("Should return value when key doesnt exists", async () => {
                const key = "a";
                const ttl = null;

                const result = await lockProvider
                    .create(key, {
                        ttl,
                    })
                    .runOrFail(() => {
                        return Promise.resolve(RETURN_VALUE);
                    });

                expect(result).toEqual(RETURN_VALUE);
            });
            test("Should return value when key is expired", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);

                await lockProvider.create(key, { ttl }).acquire();
                await delay(ttl);

                const result = await lockProvider
                    .create(key, { ttl })
                    .runOrFail(() => {
                        return Promise.resolve(RETURN_VALUE);
                    });

                expect(result).toEqual(RETURN_VALUE);
            });
            test("Should return value when key is unexpireable and acquired by same owner", async () => {
                const key = "a";
                const ttl = null;

                const lock = lockProvider.create(key, { ttl });
                await lock.acquire();
                const result = await lock.runOrFail(() => {
                    return Promise.resolve(RETURN_VALUE);
                });

                expect(result).toEqual(RETURN_VALUE);
            });
            test("Should return value when key is unexpired and acquired by same owner", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);

                const lock = lockProvider.create(key, {
                    ttl,
                });
                await lock.acquire();
                const result = await lock.runOrFail(() => {
                    return Promise.resolve(RETURN_VALUE);
                });

                expect(result).toEqual(RETURN_VALUE);
            });
            test("Should throw KeyAlreadyAcquiredLockError when key is unexpireable and acquired by different owner", async () => {
                const key = "a";
                const ttl = null;

                await lockProvider.create(key, { ttl }).acquire();
                const result = lockProvider
                    .create(key, { ttl })
                    .runOrFail(() => {
                        return Promise.resolve(RETURN_VALUE);
                    });

                await expect(result).rejects.toBeInstanceOf(
                    KeyAlreadyAcquiredLockError,
                );
            });
            test("Should throw KeyAlreadyAcquiredLockError when key is unexpired and acquired by different owner", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);

                await lockProvider.create(key, { ttl }).acquire();
                const result = lockProvider
                    .create(key, { ttl })
                    .runOrFail(() => {
                        return Promise.resolve(RETURN_VALUE);
                    });

                await expect(result).rejects.toBeInstanceOf(
                    KeyAlreadyAcquiredLockError,
                );
            });
        });
        describe("method: runBlocking", () => {
            test("Should call acquireBlocking method", async () => {
                const key = "a";
                const ttl = null;
                const lock = lockProvider.create(key, {
                    ttl,
                });

                const acquireSpy = vi.spyOn(lock, "acquireBlocking");

                await lock.runBlocking(
                    () => {
                        return Promise.resolve(RETURN_VALUE);
                    },
                    {
                        time: TimeSpan.fromMilliseconds(5),
                        interval: TimeSpan.fromMilliseconds(5),
                    },
                );

                expect(acquireSpy).toHaveBeenCalledTimes(1);
            });
            test("Should call acquireBlocking before release method", async () => {
                const key = "a";
                const ttl = null;
                const lock = lockProvider.create(key, {
                    ttl,
                });

                const acquireSpy = vi.spyOn(lock, "acquireBlocking");
                const releaseSpy = vi.spyOn(lock, "release");

                await lock.runBlocking(
                    () => {
                        return Promise.resolve(RETURN_VALUE);
                    },
                    {
                        time: TimeSpan.fromMilliseconds(5),
                        interval: TimeSpan.fromMilliseconds(5),
                    },
                );

                expect(acquireSpy).toHaveBeenCalledBefore(releaseSpy);
            });
            test("Should call release method", async () => {
                const key = "a";
                const ttl = null;
                const lock = lockProvider.create(key, {
                    ttl,
                });

                const releaseSpy = vi.spyOn(lock, "release");

                await lock.runBlocking(
                    () => {
                        return Promise.resolve(RETURN_VALUE);
                    },
                    {
                        time: TimeSpan.fromMilliseconds(5),
                        interval: TimeSpan.fromMilliseconds(5),
                    },
                );

                expect(releaseSpy).toHaveBeenCalledTimes(1);
            });
            test("Should call release after acquireBlocking method", async () => {
                const key = "a";
                const ttl = null;
                const lock = lockProvider.create(key, {
                    ttl,
                });

                const releaseSpy = vi.spyOn(lock, "release");
                const acquireSpy = vi.spyOn(lock, "acquireBlocking");

                await lock.runBlocking(
                    () => {
                        return Promise.resolve(RETURN_VALUE);
                    },
                    {
                        time: TimeSpan.fromMilliseconds(5),
                        interval: TimeSpan.fromMilliseconds(5),
                    },
                );

                expect(releaseSpy).toHaveBeenCalledAfter(acquireSpy);
            });
            test("Should call release when an error is thrown", async () => {
                const key = "a";
                const ttl = null;
                const lock = lockProvider.create(key, {
                    ttl,
                });

                const releaseSpy = vi.spyOn(lock, "release");

                try {
                    await lock.runBlocking(
                        () => {
                            return Promise.reject(new Error());
                        },
                        {
                            time: TimeSpan.fromMilliseconds(5),
                            interval: TimeSpan.fromMilliseconds(5),
                        },
                    );
                } catch {
                    /* EMPTY */
                }

                expect(releaseSpy).toHaveBeenCalledTimes(1);
            });
            test("Should propagate thrown error", async () => {
                const key = "a";
                const ttl = null;
                const lock = lockProvider.create(key, {
                    ttl,
                });

                class CustomError extends Error {}

                const error = lock.runBlocking(
                    () => {
                        return Promise.reject(new CustomError());
                    },
                    {
                        time: TimeSpan.fromMilliseconds(5),
                        interval: TimeSpan.fromMilliseconds(5),
                    },
                );

                await expect(error).rejects.toBeInstanceOf(CustomError);
            });
            test("Should call handler function when key doesnt exists", async () => {
                const key = "a";
                const ttl = null;

                const handlerFn = vi.fn(() => {
                    return Promise.resolve(RETURN_VALUE);
                });
                await lockProvider
                    .create(key, {
                        ttl,
                    })
                    .runBlocking(handlerFn, {
                        time: TimeSpan.fromMilliseconds(5),
                        interval: TimeSpan.fromMilliseconds(5),
                    });

                expect(handlerFn).toHaveBeenCalledTimes(1);
            });
            test("Should call handler function when key is expired", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);

                await lockProvider.create(key, { ttl }).acquire();
                await delay(ttl);

                const handlerFn = vi.fn(() => {
                    return Promise.resolve(RETURN_VALUE);
                });
                await lockProvider.create(key, { ttl }).runBlocking(handlerFn, {
                    time: TimeSpan.fromMilliseconds(5),
                    interval: TimeSpan.fromMilliseconds(5),
                });

                expect(handlerFn).toHaveBeenCalledTimes(1);
            });
            test("Should call handler function when key is unexpireable and acquired by same owner", async () => {
                const key = "a";
                const ttl = null;

                const lock = lockProvider.create(key, { ttl });
                await lock.acquire();
                const handlerFn = vi.fn(() => {
                    return Promise.resolve(RETURN_VALUE);
                });
                await lock.runBlocking(handlerFn, {
                    time: TimeSpan.fromMilliseconds(5),
                    interval: TimeSpan.fromMilliseconds(5),
                });

                expect(handlerFn).toHaveBeenCalledTimes(1);
            });
            test("Should call handler function when key is unexpired and acquired by same owner", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);

                const lock = lockProvider.create(key, {
                    ttl,
                });
                await lock.acquire();
                const handlerFn = vi.fn(() => {
                    return Promise.resolve(RETURN_VALUE);
                });
                await lock.runBlocking(handlerFn, {
                    time: TimeSpan.fromMilliseconds(5),
                    interval: TimeSpan.fromMilliseconds(5),
                });

                expect(handlerFn).toHaveBeenCalledTimes(1);
            });
            test("Should not call handler function when key is unexpireable and acquired by different owner", async () => {
                const key = "a";
                const ttl = null;

                await lockProvider.create(key, { ttl }).acquire();
                const handlerFn = vi.fn(() => {
                    return Promise.resolve(RETURN_VALUE);
                });
                await lockProvider.create(key, { ttl }).runBlocking(handlerFn, {
                    time: TimeSpan.fromMilliseconds(5),
                    interval: TimeSpan.fromMilliseconds(5),
                });

                expect(handlerFn).not.toHaveBeenCalled();
            });
            test("Should not call handler function when key is unexpired and acquired by different owner", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);

                await lockProvider.create(key, { ttl }).acquire();
                const handlerFn = vi.fn(() => {
                    return Promise.resolve(RETURN_VALUE);
                });
                await lockProvider.create(key, { ttl }).runBlocking(handlerFn, {
                    time: TimeSpan.fromMilliseconds(5),
                    interval: TimeSpan.fromMilliseconds(5),
                });

                expect(handlerFn).not.toHaveBeenCalled();
            });
            test("Should return ResultSuccess<string> when key doesnt exists", async () => {
                const key = "a";
                const ttl = null;

                const result = await lockProvider
                    .create(key, {
                        ttl,
                    })
                    .runBlocking(
                        () => {
                            return Promise.resolve(RETURN_VALUE);
                        },
                        {
                            time: TimeSpan.fromMilliseconds(5),
                            interval: TimeSpan.fromMilliseconds(5),
                        },
                    );

                expect(result).toEqual(resultSuccess(RETURN_VALUE));
            });
            test("Should return ResultSuccess<string> when key is expired", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);

                await lockProvider.create(key, { ttl }).acquire();
                await delay(ttl);

                const result = await lockProvider
                    .create(key, { ttl })
                    .runBlocking(
                        () => {
                            return Promise.resolve(RETURN_VALUE);
                        },
                        {
                            time: TimeSpan.fromMilliseconds(5),
                            interval: TimeSpan.fromMilliseconds(5),
                        },
                    );

                expect(result).toEqual(resultSuccess(RETURN_VALUE));
            });
            test("Should return ResultSuccess<string> when key is unexpireable and acquired by same owner", async () => {
                const key = "a";
                const ttl = null;

                const lock = lockProvider.create(key, { ttl });
                await lock.acquire();
                const result = await lock.runBlocking(
                    () => {
                        return Promise.resolve(RETURN_VALUE);
                    },
                    {
                        time: TimeSpan.fromMilliseconds(5),
                        interval: TimeSpan.fromMilliseconds(5),
                    },
                );

                expect(result).toEqual(resultSuccess(RETURN_VALUE));
            });
            test("Should return ResultSuccess<string> when key is unexpired and acquired by same owner", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);

                const lock = lockProvider.create(key, {
                    ttl,
                });
                await lock.acquire();
                const result = await lock.runBlocking(
                    () => {
                        return Promise.resolve(RETURN_VALUE);
                    },
                    {
                        time: TimeSpan.fromMilliseconds(5),
                        interval: TimeSpan.fromMilliseconds(5),
                    },
                );

                expect(result).toEqual(resultSuccess(RETURN_VALUE));
            });
            test("Should return ResultFailure<KeyAlreadyAcquiredLockError> when key is unexpireable and acquired by different owner", async () => {
                const key = "a";
                const ttl = null;

                await lockProvider.create(key, { ttl }).acquire();
                const result = await lockProvider
                    .create(key, { ttl })
                    .runBlocking(
                        () => {
                            return Promise.resolve(RETURN_VALUE);
                        },
                        {
                            time: TimeSpan.fromMilliseconds(5),
                            interval: TimeSpan.fromMilliseconds(5),
                        },
                    );

                expect(result.type).toBe(RESULT.FAILURE);
                expect((result as ResultFailure).error).toBeInstanceOf(
                    KeyAlreadyAcquiredLockError,
                );
            });
            test("Should return ResultFailure<KeyAlreadyAcquiredLockError> when key is unexpired and acquired by different owner", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);

                await lockProvider.create(key, { ttl }).acquire();
                const result = await lockProvider
                    .create(key, { ttl })
                    .runBlocking(
                        () => {
                            return Promise.resolve(RETURN_VALUE);
                        },
                        {
                            time: TimeSpan.fromMilliseconds(5),
                            interval: TimeSpan.fromMilliseconds(5),
                        },
                    );

                expect(result.type).toBe(RESULT.FAILURE);
                expect((result as ResultFailure).error).toBeInstanceOf(
                    KeyAlreadyAcquiredLockError,
                );
            });
            test("Should retry acquire the lock", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);
                const lock1 = lockProvider.create(key, {
                    ttl,
                });

                await lock1.acquire();
                let index = 0;
                await lockProvider.addListener(
                    LOCK_EVENTS.UNAVAILABLE,
                    (_event) => {
                        index++;
                    },
                );
                const lock2 = lockProvider.create(key, {
                    ttl,
                });
                await lock2.runBlocking(
                    () => {
                        return Promise.resolve(RETURN_VALUE);
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
            test("Should call acquireBlockingOrFail method", async () => {
                const key = "a";
                const ttl = null;
                const lock = lockProvider.create(key, {
                    ttl,
                });

                const acquireSpy = vi.spyOn(lock, "acquireBlockingOrFail");

                await lock.runBlockingOrFail(
                    () => {
                        return Promise.resolve(RETURN_VALUE);
                    },
                    {
                        time: TimeSpan.fromMilliseconds(5),
                        interval: TimeSpan.fromMilliseconds(5),
                    },
                );

                expect(acquireSpy).toHaveBeenCalledTimes(1);
            });
            test("Should call acquireBlockingOrFail before release method", async () => {
                const key = "a";
                const ttl = null;
                const lock = lockProvider.create(key, {
                    ttl,
                });

                const acquireSpy = vi.spyOn(lock, "acquireBlockingOrFail");
                const releaseSpy = vi.spyOn(lock, "release");

                await lock.runBlockingOrFail(
                    () => {
                        return Promise.resolve(RETURN_VALUE);
                    },
                    {
                        time: TimeSpan.fromMilliseconds(5),
                        interval: TimeSpan.fromMilliseconds(5),
                    },
                );

                expect(acquireSpy).toHaveBeenCalledBefore(releaseSpy);
            });
            test("Should call release method", async () => {
                const key = "a";
                const ttl = null;
                const lock = lockProvider.create(key, {
                    ttl,
                });

                const releaseSpy = vi.spyOn(lock, "release");

                await lock.runBlockingOrFail(
                    () => {
                        return Promise.resolve(RETURN_VALUE);
                    },
                    {
                        time: TimeSpan.fromMilliseconds(5),
                        interval: TimeSpan.fromMilliseconds(5),
                    },
                );

                expect(releaseSpy).toHaveBeenCalledTimes(1);
            });
            test("Should call release after acquireBlockingOrFail method", async () => {
                const key = "a";
                const ttl = null;
                const lock = lockProvider.create(key, {
                    ttl,
                });

                const releaseSpy = vi.spyOn(lock, "release");
                const acquireSpy = vi.spyOn(lock, "acquireBlockingOrFail");

                await lock.runBlockingOrFail(
                    () => {
                        return Promise.resolve(RETURN_VALUE);
                    },
                    {
                        time: TimeSpan.fromMilliseconds(5),
                        interval: TimeSpan.fromMilliseconds(5),
                    },
                );

                expect(releaseSpy).toHaveBeenCalledAfter(acquireSpy);
            });
            test("Should call release when an error is thrown", async () => {
                const key = "a";
                const ttl = null;
                const lock = lockProvider.create(key, {
                    ttl,
                });

                const releaseSpy = vi.spyOn(lock, "release");

                try {
                    await lock.runBlockingOrFail(
                        () => {
                            return Promise.reject(new Error());
                        },
                        {
                            time: TimeSpan.fromMilliseconds(5),
                            interval: TimeSpan.fromMilliseconds(5),
                        },
                    );
                } catch {
                    /* EMPTY */
                }

                expect(releaseSpy).toHaveBeenCalledTimes(1);
            });
            test("Should propagate thrown error", async () => {
                const key = "a";
                const ttl = null;
                const lock = lockProvider.create(key, {
                    ttl,
                });

                class CustomError extends Error {}

                const error = lock.runBlockingOrFail(
                    () => {
                        return Promise.reject(new CustomError());
                    },
                    {
                        time: TimeSpan.fromMilliseconds(5),
                        interval: TimeSpan.fromMilliseconds(5),
                    },
                );

                await expect(error).rejects.toBeInstanceOf(CustomError);
            });
            test("Should call handler function when key doesnt exists", async () => {
                const key = "a";
                const ttl = null;

                const handlerFn = vi.fn(() => {
                    return Promise.resolve(RETURN_VALUE);
                });
                await lockProvider
                    .create(key, {
                        ttl,
                    })
                    .runBlockingOrFail(handlerFn, {
                        time: TimeSpan.fromMilliseconds(5),
                        interval: TimeSpan.fromMilliseconds(5),
                    });

                expect(handlerFn).toHaveBeenCalledTimes(1);
            });
            test("Should call handler function when key is expired", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);

                await lockProvider.create(key, { ttl }).acquire();
                await delay(ttl);

                const handlerFn = vi.fn(() => {
                    return Promise.resolve(RETURN_VALUE);
                });
                await lockProvider
                    .create(key, { ttl })
                    .runBlockingOrFail(handlerFn, {
                        time: TimeSpan.fromMilliseconds(5),
                        interval: TimeSpan.fromMilliseconds(5),
                    });

                expect(handlerFn).toHaveBeenCalledTimes(1);
            });
            test("Should call handler function when key is unexpireable and acquired by same owner", async () => {
                const key = "a";
                const ttl = null;

                const lock = lockProvider.create(key, { ttl });
                await lock.acquire();
                const handlerFn = vi.fn(() => {
                    return Promise.resolve(RETURN_VALUE);
                });
                await lock.runBlockingOrFail(handlerFn, {
                    time: TimeSpan.fromMilliseconds(5),
                    interval: TimeSpan.fromMilliseconds(5),
                });

                expect(handlerFn).toHaveBeenCalledTimes(1);
            });
            test("Should call handler function when key is unexpired and acquired by same owner", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);

                const lock = lockProvider.create(key, {
                    ttl,
                });
                await lock.acquire();
                const handlerFn = vi.fn(() => {
                    return Promise.resolve(RETURN_VALUE);
                });
                await lock.runBlockingOrFail(handlerFn, {
                    time: TimeSpan.fromMilliseconds(5),
                    interval: TimeSpan.fromMilliseconds(5),
                });

                expect(handlerFn).toHaveBeenCalledTimes(1);
            });
            test("Should not call handler function when key is unexpireable and acquired by different owner", async () => {
                const key = "a";
                const ttl = null;

                await lockProvider.create(key, { ttl }).acquire();
                const handlerFn = vi.fn(() => {
                    return Promise.resolve(RETURN_VALUE);
                });
                try {
                    await lockProvider
                        .create(key, { ttl })
                        .runBlockingOrFail(handlerFn, {
                            time: TimeSpan.fromMilliseconds(5),
                            interval: TimeSpan.fromMilliseconds(5),
                        });
                } catch {
                    /* EMPTY */
                }

                expect(handlerFn).not.toHaveBeenCalled();
            });
            test("Should not call handler function when key is unexpired and acquired by different owner", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);

                await lockProvider.create(key, { ttl }).acquire();
                const handlerFn = vi.fn(() => {
                    return Promise.resolve(RETURN_VALUE);
                });
                try {
                    await lockProvider
                        .create(key, { ttl })
                        .runBlockingOrFail(handlerFn, {
                            time: TimeSpan.fromMilliseconds(5),
                            interval: TimeSpan.fromMilliseconds(5),
                        });
                } catch {
                    /* EMPTY */
                }

                expect(handlerFn).not.toHaveBeenCalled();
            });
            test("Should return value when key doesnt exists", async () => {
                const key = "a";
                const ttl = null;

                const result = await lockProvider
                    .create(key, {
                        ttl,
                    })
                    .runBlockingOrFail(
                        () => {
                            return Promise.resolve(RETURN_VALUE);
                        },
                        {
                            time: TimeSpan.fromMilliseconds(5),
                            interval: TimeSpan.fromMilliseconds(5),
                        },
                    );

                expect(result).toEqual(RETURN_VALUE);
            });
            test("Should return value when key is expired", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);

                await lockProvider.create(key, { ttl }).acquire();
                await delay(ttl);

                const result = await lockProvider
                    .create(key, { ttl })
                    .runBlockingOrFail(
                        () => {
                            return Promise.resolve(RETURN_VALUE);
                        },
                        {
                            time: TimeSpan.fromMilliseconds(5),
                            interval: TimeSpan.fromMilliseconds(5),
                        },
                    );

                expect(result).toEqual(RETURN_VALUE);
            });
            test("Should return value when key is unexpireable and acquired by same owner", async () => {
                const key = "a";
                const ttl = null;

                const lock = lockProvider.create(key, { ttl });
                await lock.acquire();
                const result = await lock.runBlockingOrFail(
                    () => {
                        return Promise.resolve(RETURN_VALUE);
                    },
                    {
                        time: TimeSpan.fromMilliseconds(5),
                        interval: TimeSpan.fromMilliseconds(5),
                    },
                );

                expect(result).toEqual(RETURN_VALUE);
            });
            test("Should return value when key is unexpired and acquired by same owner", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);

                const lock = lockProvider.create(key, {
                    ttl,
                });
                await lock.acquire();
                const result = await lock.runBlockingOrFail(
                    () => {
                        return Promise.resolve(RETURN_VALUE);
                    },
                    {
                        time: TimeSpan.fromMilliseconds(5),
                        interval: TimeSpan.fromMilliseconds(5),
                    },
                );

                expect(result).toEqual(RETURN_VALUE);
            });
            test("Should throw KeyAlreadyAcquiredLockError when key is unexpireable and acquired by different owner", async () => {
                const key = "a";
                const ttl = null;

                await lockProvider.create(key, { ttl }).acquire();
                const result = lockProvider
                    .create(key, { ttl })
                    .runBlockingOrFail(
                        () => {
                            return Promise.resolve(RETURN_VALUE);
                        },
                        {
                            time: TimeSpan.fromMilliseconds(5),
                            interval: TimeSpan.fromMilliseconds(5),
                        },
                    );

                await expect(result).rejects.toBeInstanceOf(
                    KeyAlreadyAcquiredLockError,
                );
            });
            test("Should throw KeyAlreadyAcquiredLockError when key is unexpired and acquired by different owner", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);

                await lockProvider.create(key, { ttl }).acquire();
                const result = lockProvider
                    .create(key, { ttl })
                    .runBlockingOrFail(
                        () => {
                            return Promise.resolve(RETURN_VALUE);
                        },
                        {
                            time: TimeSpan.fromMilliseconds(5),
                            interval: TimeSpan.fromMilliseconds(5),
                        },
                    );

                await expect(result).rejects.toBeInstanceOf(
                    KeyAlreadyAcquiredLockError,
                );
            });
            test("Should retry acquire the lock", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);
                const lock1 = lockProvider.create(key, {
                    ttl,
                });

                await lock1.acquire();
                let index = 0;
                await lockProvider.addListener(
                    LOCK_EVENTS.UNAVAILABLE,
                    (_event) => {
                        index++;
                    },
                );
                const lock2 = lockProvider.create(key, {
                    ttl,
                });
                try {
                    await lock2.runBlockingOrFail(
                        () => {
                            return Promise.resolve(RETURN_VALUE);
                        },
                        {
                            time: TimeSpan.fromMilliseconds(55),
                            interval: TimeSpan.fromMilliseconds(5),
                        },
                    );
                } catch {
                    /* EMPTY */
                }

                expect(index).toBeGreaterThan(1);
            });
        });
        describe("method: acquire", () => {
            test("Should return true when key doesnt exists", async () => {
                const key = "a";
                const ttl = null;

                const result = await lockProvider
                    .create(key, {
                        ttl,
                    })
                    .acquire();

                expect(result).toBe(true);
            });
            test("Should return true when key is expired", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);

                await lockProvider.create(key, { ttl }).acquire();
                await delay(ttl);

                const result = await lockProvider
                    .create(key, { ttl })
                    .acquire();
                expect(result).toBe(true);
            });
            test("Should return true when key is unexpireable and acquired by same owner", async () => {
                const key = "a";
                const ttl = null;

                const lock = lockProvider.create(key, { ttl });
                await lock.acquire();
                const result = await lock.acquire();

                expect(result).toBe(true);
            });
            test("Should return true when key is unexpired and acquired by same owner", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);

                const lock = lockProvider.create(key, {
                    ttl,
                });
                await lock.acquire();
                const result = await lock.acquire();

                expect(result).toBe(true);
            });
            test("Should return false when key is unexpireable and acquired by different owner", async () => {
                const key = "a";
                const ttl = null;

                await lockProvider.create(key, { ttl }).acquire();
                const result = await lockProvider
                    .create(key, { ttl })
                    .acquire();

                expect(result).toBe(false);
            });
            test("Should return false when key is unexpired and acquired by different owner", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);

                await lockProvider.create(key, { ttl }).acquire();
                const result = await lockProvider
                    .create(key, { ttl })
                    .acquire();

                expect(result).toBe(false);
            });
        });
        describe("method: acquireOrFail", () => {
            test("Should not throw error when key doesnt exists", async () => {
                const key = "a";
                const ttl = null;

                const result = lockProvider
                    .create(key, {
                        ttl,
                    })
                    .acquireOrFail();

                await expect(result).resolves.toBeUndefined();
            });
            test("Should not throw error when key is expired", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);

                await lockProvider.create(key, { ttl }).acquire();
                await delay(ttl);

                const result = lockProvider
                    .create(key, { ttl })
                    .acquireOrFail();

                await expect(result).resolves.toBeUndefined();
            });
            test("Should not throw error when key is unexpireable and acquired by same owner", async () => {
                const key = "a";
                const ttl = null;

                const lock = lockProvider.create(key, { ttl });
                await lock.acquire();
                const result = lock.acquireOrFail();

                await expect(result).resolves.toBeUndefined();
            });
            test("Should not throw error when key is unexpired and acquired by same owner", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);

                const lock = lockProvider.create(key, {
                    ttl,
                });
                await lock.acquire();
                const result = lock.acquireOrFail();

                await expect(result).resolves.toBeUndefined();
            });
            test("Should throw KeyAlreadyAcquiredLockError when key is unexpireable and acquired by different owner", async () => {
                const key = "a";
                const ttl = null;

                await lockProvider.create(key, { ttl }).acquire();
                const result = lockProvider
                    .create(key, { ttl })
                    .acquireOrFail();

                await expect(result).rejects.toBeInstanceOf(
                    KeyAlreadyAcquiredLockError,
                );
            });
            test("Should throw KeyAlreadyAcquiredLockError when key is unexpired and acquired by different owner", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);

                await lockProvider.create(key, { ttl }).acquire();
                const result = lockProvider
                    .create(key, { ttl })
                    .acquireOrFail();

                await expect(result).rejects.toBeInstanceOf(
                    KeyAlreadyAcquiredLockError,
                );
            });
        });
        describe("method: acquireBlocking", () => {
            test("Should return true when key doesnt exists", async () => {
                const key = "a";
                const ttl = null;

                const result = await lockProvider
                    .create(key, {
                        ttl,
                    })
                    .acquireBlocking({
                        time: TimeSpan.fromMilliseconds(5),
                        interval: TimeSpan.fromMilliseconds(5),
                    });

                expect(result).toBe(true);
            });
            test("Should return true when key is expired", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);

                await lockProvider.create(key, { ttl }).acquire();
                await delay(ttl);

                const result = await lockProvider
                    .create(key, { ttl })
                    .acquireBlocking({
                        time: TimeSpan.fromMilliseconds(5),
                        interval: TimeSpan.fromMilliseconds(5),
                    });
                expect(result).toBe(true);
            });
            test("Should return true when key is unexpireable and acquired by same owner", async () => {
                const key = "a";
                const ttl = null;

                const lock = lockProvider.create(key, { ttl });
                await lock.acquire();
                const result = await lock.acquireBlocking({
                    time: TimeSpan.fromMilliseconds(5),
                    interval: TimeSpan.fromMilliseconds(5),
                });

                expect(result).toBe(true);
            });
            test("Should return true when key is unexpired and acquired by same owner", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);

                const lock = lockProvider.create(key, {
                    ttl,
                });
                await lock.acquire();
                const result = await lock.acquireBlocking({
                    time: TimeSpan.fromMilliseconds(5),
                    interval: TimeSpan.fromMilliseconds(5),
                });

                expect(result).toBe(true);
            });
            test("Should return false when key is unexpireable and acquired by different owner", async () => {
                const key = "a";
                const ttl = null;

                await lockProvider.create(key, { ttl }).acquire();
                const result = await lockProvider
                    .create(key, { ttl })
                    .acquireBlocking({
                        time: TimeSpan.fromMilliseconds(5),
                        interval: TimeSpan.fromMilliseconds(5),
                    });

                expect(result).toBe(false);
            });
            test("Should return false when key is unexpired and acquired by different owner", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);

                await lockProvider.create(key, { ttl }).acquire();
                const result = await lockProvider
                    .create(key, { ttl })
                    .acquireBlocking({
                        time: TimeSpan.fromMilliseconds(5),
                        interval: TimeSpan.fromMilliseconds(5),
                    });

                expect(result).toBe(false);
            });
            test("Should retry acquire the lock", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);
                const lock1 = lockProvider.create(key, {
                    ttl,
                });

                await lock1.acquire();
                let index = 0;
                await lockProvider.addListener(
                    LOCK_EVENTS.UNAVAILABLE,
                    (_event) => {
                        index++;
                    },
                );
                const lock2 = lockProvider.create(key, {
                    ttl,
                });
                await lock2.acquireBlocking({
                    time: TimeSpan.fromMilliseconds(55),
                    interval: TimeSpan.fromMilliseconds(5),
                });

                expect(index).toBeGreaterThan(1);
            });
        });
        describe("method: acquireBlockingOrFail", () => {
            test("Should not throw error when key doesnt exists", async () => {
                const key = "a";
                const ttl = null;

                const result = lockProvider
                    .create(key, {
                        ttl,
                    })
                    .acquireBlockingOrFail({
                        time: TimeSpan.fromMilliseconds(5),
                        interval: TimeSpan.fromMilliseconds(5),
                    });

                await expect(result).resolves.toBeUndefined();
            });
            test("Should not throw error when key is expired", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);

                await lockProvider.create(key, { ttl }).acquire();
                await delay(ttl);

                const result = lockProvider
                    .create(key, { ttl })
                    .acquireBlockingOrFail({
                        time: TimeSpan.fromMilliseconds(5),
                        interval: TimeSpan.fromMilliseconds(5),
                    });

                await expect(result).resolves.toBeUndefined();
            });
            test("Should not throw error when key is unexpireable and acquired by same owner", async () => {
                const key = "a";
                const ttl = null;

                const lock = lockProvider.create(key, { ttl });
                await lock.acquire();
                const result = lock.acquireBlockingOrFail({});

                await expect(result).resolves.toBeUndefined();
            });
            test("Should not throw error when key is unexpired and acquired by same owner", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);

                const lock = lockProvider.create(key, {
                    ttl,
                });
                await lock.acquire();
                const result = lock.acquireBlockingOrFail({});

                await expect(result).resolves.toBeUndefined();
            });
            test("Should throw KeyAlreadyAcquiredLockError when key is unexpireable and acquired by different owner", async () => {
                const key = "a";
                const ttl = null;

                await lockProvider.create(key, { ttl }).acquire();
                const result = lockProvider
                    .create(key, { ttl })
                    .acquireBlockingOrFail({
                        time: TimeSpan.fromMilliseconds(5),
                        interval: TimeSpan.fromMilliseconds(5),
                    });

                await expect(result).rejects.toBeInstanceOf(
                    KeyAlreadyAcquiredLockError,
                );
            });
            test("Should throw KeyAlreadyAcquiredLockError when key is unexpired and acquired by different owner", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);

                await lockProvider.create(key, { ttl }).acquire();
                const result = lockProvider
                    .create(key, { ttl })
                    .acquireBlockingOrFail({
                        time: TimeSpan.fromMilliseconds(5),
                        interval: TimeSpan.fromMilliseconds(5),
                    });

                await expect(result).rejects.toBeInstanceOf(
                    KeyAlreadyAcquiredLockError,
                );
            });
            test("Should retry acquire the lock", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);
                const lock1 = lockProvider.create(key, {
                    ttl,
                });

                await lock1.acquire();
                let index = 0;
                await lockProvider.addListener(
                    LOCK_EVENTS.UNAVAILABLE,
                    (_event) => {
                        index++;
                    },
                );
                const lock2 = lockProvider.create(key, {
                    ttl,
                });
                try {
                    await lock2.acquireBlockingOrFail({
                        time: TimeSpan.fromMilliseconds(55),
                        interval: TimeSpan.fromMilliseconds(5),
                    });
                } catch {
                    /* EMPTY */
                }

                expect(index).toBeGreaterThan(1);
            });
        });
        describe("method: release", () => {
            test("Should return false when key doesnt exists", async () => {
                const key = "a";

                const result = await lockProvider.create(key).release();

                expect(result).toBe(false);
            });
            test("Should return false when key is unexpireable and released by different owner", async () => {
                const key = "a";
                const ttl = null;
                await lockProvider.create(key, { ttl }).acquire();

                const result = await lockProvider
                    .create(key, { ttl })
                    .release();

                expect(result).toBe(false);
            });
            test("Should return false when key is unexpired and released by different owner", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);
                await lockProvider.create(key, { ttl }).acquire();

                const result = await lockProvider
                    .create(key, { ttl })
                    .release();

                expect(result).toBe(false);
            });
            test("Should return false when key is expired and released by different owner", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);
                await lockProvider.create(key, { ttl }).acquire();

                const result = await lockProvider
                    .create(key, { ttl })
                    .release();
                await delay(ttl);

                expect(result).toBe(false);
            });
            test("Should return false when key is expired and released by same owner", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);
                const lock = lockProvider.create(key, { ttl });
                await lock.acquire();
                await delay(ttl);

                const result = await lock.release();

                expect(result).toBe(false);
            });
            test("Should return true when key is unexpireable and released by same owner", async () => {
                const key = "a";
                const ttl = null;
                const lock = lockProvider.create(key, { ttl });
                await lock.acquire();

                const result = await lock.release();

                expect(result).toBe(true);
            });
            test("Should return true when key is unexpired and released by same owner", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);
                const lock = lockProvider.create(key, { ttl });
                await lock.acquire();

                const result = await lock.release();

                expect(result).toBe(true);
            });
            test("Should not be reacquirable when key is unexpireable and released by different owner", async () => {
                const key = "a";
                const ttl = null;
                const lock1 = lockProvider.create(key, { ttl });
                await lock1.acquire();

                const lock2 = lockProvider.create(key, { ttl });
                await lock2.release();
                const result = await lock2.acquire();

                expect(result).toBe(false);
            });
            test("Should not be reacquirable when key is unexpired and released by different owner", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);
                const lock1 = lockProvider.create(key, { ttl });
                await lock1.acquire();

                const lock2 = lockProvider.create(key, { ttl });
                await lock2.release();
                const result = await lock2.acquire();

                expect(result).toBe(false);
            });
            test("Should be reacquirable when key is unexpireable and released by same owner", async () => {
                const key = "a";
                const ttl = null;
                const lock1 = lockProvider.create(key, { ttl });
                await lock1.acquire();
                await lock1.release();

                const lock2 = lockProvider.create(key, { ttl });
                const result = await lock2.acquire();

                expect(result).toBe(true);
            });
            test("Should be reacquirable when key is unexpired and released by same owner", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);
                const lock1 = lockProvider.create(key, { ttl });
                await lock1.acquire();
                await lock1.release();

                const lock2 = lockProvider.create(key, { ttl });
                const result = await lock2.acquire();

                expect(result).toBe(true);
            });
        });
        describe("method: releaseOrFail", () => {
            test("Should throw UnownedReleaseLockError when key doesnt exists", async () => {
                const key = "a";

                const result = lockProvider.create(key).releaseOrFail();

                await expect(result).rejects.toBeInstanceOf(
                    UnownedReleaseLockError,
                );
            });
            test("Should throw UnownedReleaseLockError when key is unexpireable and released by different owner", async () => {
                const key = "a";
                const ttl = null;
                await lockProvider.create(key, { ttl }).acquire();

                const result = lockProvider
                    .create(key, { ttl })
                    .releaseOrFail();

                await expect(result).rejects.toBeInstanceOf(
                    UnownedReleaseLockError,
                );
            });
            test("Should throw UnownedReleaseLockError when key is unexpired and released by different owner", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);
                await lockProvider.create(key, { ttl }).acquire();

                const result = lockProvider
                    .create(key, { ttl })
                    .releaseOrFail();

                await expect(result).rejects.toBeInstanceOf(
                    UnownedReleaseLockError,
                );
            });
            test("Should throw UnownedReleaseLockError when key is expired and released by different owner", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);
                await lockProvider.create(key, { ttl }).acquire();

                const result = lockProvider
                    .create(key, { ttl })
                    .releaseOrFail();
                await delay(ttl);

                await expect(result).rejects.toBeInstanceOf(
                    UnownedReleaseLockError,
                );
            });
            test("Should throw UnownedReleaseLockError when key is expired and released by same owner", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);
                const lock = lockProvider.create(key, { ttl });
                await lock.acquire();
                await delay(ttl);

                const result = lock.releaseOrFail();

                await expect(result).rejects.toBeInstanceOf(
                    UnownedReleaseLockError,
                );
            });
            test("Should not throw error when key is unexpireable and released by same owner", async () => {
                const key = "a";
                const ttl = null;
                const lock = lockProvider.create(key, { ttl });
                await lock.acquire();

                const result = lock.releaseOrFail();

                await expect(result).resolves.toBeUndefined();
            });
            test("Should not throw error when key is unexpired and released by same owner", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);
                const lock = lockProvider.create(key, { ttl });
                await lock.acquire();

                const result = lock.releaseOrFail();

                await expect(result).resolves.toBeUndefined();
            });
            test("Should not be reacquirable when key is unexpireable and released by different owner", async () => {
                const key = "a";
                const ttl = null;
                const lock1 = lockProvider.create(key, { ttl });
                await lock1.acquire();

                const lock2 = lockProvider.create(key, { ttl });
                try {
                    await lock2.releaseOrFail();
                } catch {
                    /* EMPTY */
                }
                const result = await lock2.acquire();

                expect(result).toBe(false);
            });
            test("Should not be reacquirable when key is unexpired and released by different owner", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);
                const lock1 = lockProvider.create(key, { ttl });
                await lock1.acquire();

                const lock2 = lockProvider.create(key, { ttl });
                try {
                    await lock2.releaseOrFail();
                } catch {
                    /* EMPTY */
                }
                const result = await lock2.acquire();

                expect(result).toBe(false);
            });
            test("Should be reacquirable when key is unexpireable and released by same owner", async () => {
                const key = "a";
                const ttl = null;
                const lock1 = lockProvider.create(key, { ttl });
                await lock1.acquire();
                await lock1.releaseOrFail();

                const lock2 = lockProvider.create(key, { ttl });
                const result = await lock2.acquire();

                expect(result).toBe(true);
            });
            test("Should be reacquirable when key is unexpired and released by same owner", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);
                const lock1 = lockProvider.create(key, { ttl });
                await lock1.acquire();
                await lock1.releaseOrFail();

                const lock2 = lockProvider.create(key, { ttl });
                const result = await lock2.acquire();

                expect(result).toBe(true);
            });
        });
        describe("method: forceRelease", () => {
            test("Should be reacquirable when force released", async () => {
                const key = "a";
                const ttl = null;
                const lock1 = lockProvider.create(key, { ttl });
                await lock1.acquire();

                const lock2 = lockProvider.create(key);
                await lock2.forceRelease();

                const result = await lock2.acquire();
                expect(result).toBe(true);
            });
        });
        describe("method: isExpired", () => {
            test("Should return false when lock has no expiration", async () => {
                const key = "a";
                const ttl = null;
                const owner = "b";
                const lock = lockProvider.create(key, {
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
                const ttl = TimeSpan.fromMilliseconds(50);
                const lock = lockProvider.create(key, {
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
                const ttl = TimeSpan.fromMilliseconds(50);
                const lock = lockProvider.create(key, {
                    ttl,
                    owner,
                });

                await lock.acquire();
                await delay(ttl);
                const result = await lock.isExpired();

                expect(result).toBe(true);
            });
        });
        describe("method: isLocked", () => {
            test("Should return true when lock has no expiration", async () => {
                const key = "a";
                const ttl = null;
                const owner = "b";
                const lock = lockProvider.create(key, {
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
                const ttl = TimeSpan.fromMilliseconds(50);
                const lock = lockProvider.create(key, {
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
                const ttl = TimeSpan.fromMilliseconds(50);
                const lock = lockProvider.create(key, {
                    ttl,
                    owner,
                });

                await lock.acquire();
                await delay(ttl);
                const result = await lock.isLocked();

                expect(result).toBe(false);
            });
        });
        describe("method: refresh", () => {
            test("Should return false when key doesnt exists", async () => {
                const key = "a";

                const newTtl = TimeSpan.fromMinutes(1);
                const result = await lockProvider.create(key).refresh(newTtl);

                expect(result).toBe(false);
            });
            test("Should return false when key is unexpireable and refreshed by different owner", async () => {
                const key = "a";
                const ttl = null;
                const lock1 = lockProvider.create(key, { ttl });
                await lock1.acquire();

                const newTtl = TimeSpan.fromMinutes(1);
                const lock2 = lockProvider.create(key, { ttl });
                const result = await lock2.refresh(newTtl);

                expect(result).toBe(false);
            });
            test("Should return false when key is unexpired and refreshed by different owner", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);
                const lock1 = lockProvider.create(key, { ttl });
                await lock1.acquire();

                const newTtl = TimeSpan.fromMinutes(1);
                const lock2 = lockProvider.create(key, { ttl });
                const result = await lock2.refresh(newTtl);

                expect(result).toBe(false);
            });
            test("Should return false when key is expired and refreshed by different owner", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);
                const lock1 = lockProvider.create(key, { ttl });
                await lock1.acquire();
                await delay(ttl);

                const newTtl = TimeSpan.fromMinutes(1);
                const lock2 = lockProvider.create(key, { ttl });
                const result = await lock2.refresh(newTtl);

                expect(result).toBe(false);
            });
            test("Should return false when key is expired and refreshed by same owner", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);
                const lock = lockProvider.create(key, {
                    ttl,
                });
                await lock.acquire();
                await delay(ttl);

                const newTtl = TimeSpan.fromMinutes(1);
                const result = await lock.refresh(newTtl);

                expect(result).toBe(false);
            });
            test("Should return false when key is unexpireable and refreshed by same owner", async () => {
                const key = "a";
                const ttl = null;
                const lock = lockProvider.create(key, { ttl });
                await lock.acquire();

                const newTtl = TimeSpan.fromMinutes(1);
                const result = await lock.refresh(newTtl);

                expect(result).toBe(false);
            });
            test("Should return true when key is unexpired and refreshed by same owner", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);
                const lock = lockProvider.create(key, { ttl });
                await lock.acquire();

                const newTtl = TimeSpan.fromMinutes(1);
                const result = await lock.refresh(newTtl);

                expect(result).toBe(true);
            });
            test("Should not update expiration when key is unexpireable and refreshed by same owner", async () => {
                const key = "a";
                const ttl = null;
                const lock1 = lockProvider.create(key, { ttl });
                await lock1.acquire();

                const newTtl = TimeSpan.fromMilliseconds(50);
                await lock1.refresh(newTtl);
                await delay(newTtl);
                const lock2 = lockProvider.create(key, { ttl });
                const result = await lock2.acquire();

                expect(result).toBe(false);
            });
            test("Should update expiration when key is unexpired and refreshed by same owner", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);
                const lock1 = lockProvider.create(key, { ttl });
                await lock1.acquire();

                const newTtl = TimeSpan.fromMilliseconds(100);
                await lock1.refresh(newTtl);
                await delay(newTtl.divide(2));

                const lock2 = lockProvider.create(key, { ttl });
                const result1 = await lock2.acquire();
                expect(result1).toBe(false);

                await delay(newTtl.divide(2));
                const result2 = await lock2.acquire();
                expect(result2).toBe(true);
            });
        });
        describe("method: refreshOrFail", () => {
            test("Should throw UnownedRefreshLockError when key doesnt exists", async () => {
                const key = "a";

                const newTtl = TimeSpan.fromMinutes(1);
                const result = lockProvider.create(key).refreshOrFail(newTtl);

                await expect(result).rejects.toBeInstanceOf(
                    UnownedRefreshLockError,
                );
            });
            test("Should throw UnownedRefreshLockError when key is unexpireable and refreshed by different owner", async () => {
                const key = "a";
                const ttl = null;
                const lock1 = lockProvider.create(key, { ttl });
                await lock1.acquire();

                const newTtl = TimeSpan.fromMinutes(1);
                const lock2 = lockProvider.create(key, { ttl });
                const result = lock2.refreshOrFail(newTtl);

                await expect(result).rejects.toBeInstanceOf(
                    UnownedRefreshLockError,
                );
            });
            test("Should throw UnownedRefreshLockError when key is unexpired and refreshed by different owner", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);
                const lock1 = lockProvider.create(key, { ttl });
                await lock1.acquire();

                const newTtl = TimeSpan.fromMinutes(1);
                const lock2 = lockProvider.create(key, { ttl });
                const result = lock2.refreshOrFail(newTtl);

                await expect(result).rejects.toBeInstanceOf(
                    UnownedRefreshLockError,
                );
            });
            test("Should throw UnownedRefreshLockError when key is expired and refreshed by different owner", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);
                const lock1 = lockProvider.create(key, { ttl });
                await lock1.acquire();
                await delay(ttl);

                const newTtl = TimeSpan.fromMinutes(1);
                const lock2 = lockProvider.create(key, { ttl });
                const result = lock2.refreshOrFail(newTtl);

                await expect(result).rejects.toBeInstanceOf(
                    UnownedRefreshLockError,
                );
            });
            test("Should throw UnownedRefreshLockError when key is expired and refreshed by same owner", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);
                const lock = lockProvider.create(key, {
                    ttl,
                });
                await lock.acquire();
                await delay(ttl);

                const newTtl = TimeSpan.fromMinutes(1);
                const result = lock.refreshOrFail(newTtl);

                await expect(result).rejects.toBeInstanceOf(
                    UnownedRefreshLockError,
                );
            });
            test("Should throw UnrefreshableKeyLockError when key is unexpireable and refreshed by same owner", async () => {
                const key = "a";
                const ttl = null;
                const lock = lockProvider.create(key, { ttl });
                await lock.acquire();

                const newTtl = TimeSpan.fromMinutes(1);
                const result = lock.refreshOrFail(newTtl);

                await expect(result).rejects.toBeInstanceOf(
                    UnrefreshableKeyLockError,
                );
            });
            test("Should not throw error when key is unexpired and refreshed by same owner", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);
                const lock = lockProvider.create(key, { ttl });
                await lock.acquire();

                const newTtl = TimeSpan.fromMinutes(1);
                const result = lock.refreshOrFail(newTtl);

                await expect(result).resolves.toBeUndefined();
            });
            test("Should not update expiration when key is unexpireable and refreshed by same owner", async () => {
                const key = "a";
                const ttl = null;
                const lock1 = lockProvider.create(key, { ttl });
                await lock1.acquire();

                const newTtl = TimeSpan.fromMilliseconds(50);
                try {
                    await lock1.refreshOrFail(newTtl);
                } catch {
                    /* EMPTY */
                }
                await delay(newTtl);
                const lock2 = lockProvider.create(key, { ttl });
                const result = await lock2.acquire();

                expect(result).toBe(false);
            });
            test("Should update expiration when key is unexpired and refreshed by same owner", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);
                const lock1 = lockProvider.create(key, { ttl });
                await lock1.acquire();

                const newTtl = TimeSpan.fromMilliseconds(100);
                await lock1.refreshOrFail(newTtl);
                await delay(newTtl.divide(2));

                const lock2 = lockProvider.create(key, { ttl });
                const result1 = await lock2.acquire();
                expect(result1).toBe(false);

                await delay(newTtl.divide(2));
                const result2 = await lock2.acquire();
                expect(result2).toBe(true);
            });
        });
        describe("method: getRemainingTime", () => {
            test("Should return null when lock is not acquired", async () => {
                const key = "a";
                const ttl = null;
                const owner = "b";
                const lock = lockProvider.create(key, {
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
                const lock = lockProvider.create(key, {
                    ttl,
                    owner,
                });

                await lock.acquire();
                const result = await lock.getRemainingTime();

                expect(result).toBeNull();
            });
            test("Should return remaining time when lock is not acquired", async () => {
                const key = "a";
                const ttl = TimeSpan.fromMilliseconds(50);
                const owner = "b";
                const lock = lockProvider.create(key, {
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
                const lock = lockProvider.create(key, {
                    owner,
                });

                const result = await lock.getOwner();

                expect(result).toBe(owner);
            });
            test("Should return the auto generated owner", async () => {
                const key = "a";
                const lock = lockProvider.create(key);

                const result = await lock.getOwner();

                expect(result).toBeDefined();
                expect(typeof result).toBe("string");
            });
        });
    });
    describe("Event tests:", () => {
        describe("method: run", () => {
            test.todo("Write tests!!!");
        });
        describe("method: runOrFail", () => {
            test.todo("Write tests");
        });
        describe("method: runBlocking", () => {
            test.todo("Write tests!!!");
        });
        describe("method: runBlockingOrFail", () => {
            test.todo("Write tests!!!");
        });
        describe("method: acquire", () => {
            test.todo("Write tests!!!");
        });
        describe("method: acquireOrFail", () => {
            test.todo("Write tests!!!");
        });
        describe("method: acquireBlocking", () => {
            test.todo("Write tests!!!");
        });
        describe("method: acquireBlocking", () => {
            test.todo("Write tests!!!");
        });
        describe("method: acquireBlockingOrFail", () => {
            test.todo("Write tests!!!");
        });
        describe("method: release", () => {
            test.todo("Write tests!!!");
        });
        describe("method: releaseOrFail", () => {
            test.todo("Write tests!!!");
        });
        describe("method: forceRelease", () => {
            test.todo("Write tests!!!");
        });
        describe("method: refresh", () => {
            test.todo("Write tests!!!");
        });
        describe("method: refreshOrFail", () => {
            test.todo("Write tests!!!");
        });
    });
    describe("Serde tests:", () => {
        test("Should preserve state", async () => {
            const key = "a";
            const owner = "b";
            const lock = lockProvider.create(key, {
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
            const lock = lockProvider.create(key, {
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
            const ttl = TimeSpan.fromMilliseconds(50).multiply(2);
            const lock = lockProvider.create(key, {
                owner,
                ttl,
            });
            await lock.acquire();

            const deserializedLock = serde.deserialize<ILock>(
                serde.serialize(lock),
            );
            const delayTime = TimeSpan.fromMilliseconds(50);
            await delay(delayTime);

            expect(await deserializedLock.isLocked()).toBe(true);
            await delay(delayTime);

            expect(await deserializedLock.isLocked()).toBe(false);
        });
    });
}
