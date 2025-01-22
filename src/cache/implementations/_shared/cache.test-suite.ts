/**
 * @module Cache
 */
import {
    type TestAPI,
    type SuiteAPI,
    type ExpectStatic,
    type beforeEach,
} from "vitest";
import {
    KeyNotFoundCacheError,
    TypeCacheError,
    type ICache,
} from "@/cache/contracts/_module";
import { type Promisable } from "@/utilities/_module";
import { TimeSpan } from "@/utilities/_module";
import { delay } from "@/async/_module";

/**
 * @group Utilities
 */
export type CacheTestSuiteSettings = {
    expect: ExpectStatic;
    test: TestAPI;
    describe: SuiteAPI;
    beforeEach: typeof beforeEach;
    createCacheA: () => Promisable<ICache>;
    createCacheB: () => Promisable<ICache>;
};

/**
 * The <i>cacheTestSuite</i> function simplifies the process of testing your custom implementation of <i>{@link ICache}</i> with <i>vitest</i>.
 * @group Utilities
 * @example
 * ```ts
 * import Redis from "ioredis";
 * import { afterEach, beforeEach, describe, expect, test } from "vitest";
 * import { RedisContainer, type StartedRedisContainer } from "@testcontainers/redis";
 * import { SuperJsonSerde, TimeSpan, RedisCacheAdapter, cacheTestSuite, MemoryEventBusAdapter } from "@daiso-tech/core";
 *
 * const timeout = TimeSpan.fromMinutes(2);
 * describe("class: Cache", () => {
 *   let client: Redis;
 *   let startedContainer: StartedRedisContainer;
 *   const eventBus = new EventBus(new MemoryEventBusAdapter()):
 *   const serde = new SuperJsonSerde();
 *   beforeEach(async () => {
 *     startedContainer = await new RedisContainer("redis:7.4.2").start();
 *     client = new Redis(startedContainer.getConnectionUrl());
 *   }, timeout.toMilliseconds());
 *   afterEach(async () => {
 *     await client.quit();
 *     await startedContainer.stop();
 *   }, timeout.toMilliseconds());
 *   cacheTestSuite({
 *     createCacheA: () =>
 *       new Cache(
 *         new RedisCacheAdapter(client, {
 *           serde,
 *         }),
 *         {
 *           rootGroup: "@a",
 *           eventBus,
 *         }
 *       ),
 *     createCacheB: () =>
 *       new Cache(
 *         new RedisCacheAdapter(client, {
 *           serde,
 *         }),
 *         {
 *           rootGroup: "@b",
 *           eventBus,
 *         }
 *       ),
 *     test,
 *     beforeEach,
 *     expect,
 *     describe,
 *   });
 * });
 * ```
 */
export function cacheTestSuite(settings: CacheTestSuiteSettings): void {
    const { expect, test, createCacheA, createCacheB, describe, beforeEach } =
        settings;
    let cacheA: ICache<any>;
    let cacheB: ICache<any>;
    beforeEach(async () => {
        cacheA = await createCacheA();
        cacheB = await createCacheB();
    });
    describe("Api tests:", () => {
        const TTL = TimeSpan.fromMilliseconds(50);
        describe("method: exists", () => {
            test("Should return true when key exists", async () => {
                await cacheA.add("a", 1);
                expect(await cacheA.exists("a")).toBe(true);
            });
            test("Should return false when key doesnt exists", async () => {
                expect(await cacheA.exists("a")).toBe(false);
            });
            test("Should return false when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL);
                expect(await cacheA.exists("a")).toBe(false);
            });
        });
        describe("method: existsMany", () => {
            test("Should return only true when all keys exists", async () => {
                await cacheA.addMany({
                    a: { value: 1 },
                    b: { value: 1 },
                });
                expect(await cacheA.existsMany(["a", "b"])).toEqual({
                    a: true,
                    b: true,
                });
            });
            test("Should return only false when all keys doesnt exists", async () => {
                expect(await cacheA.existsMany(["a", "b"])).toEqual({
                    a: false,
                    b: false,
                });
            });
            test("Should return true and false when some keys exists", async () => {
                await cacheA.add("a", 1);
                expect(await cacheA.existsMany(["a", "b"])).toEqual({
                    a: true,
                    b: false,
                });
            });
            test("Should return false when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL);
                expect(await cacheA.existsMany(["a"])).toEqual({
                    a: false,
                });
            });
        });
        describe("method: missing", () => {
            test("Should return false when key exists", async () => {
                await cacheA.add("a", 1);
                expect(await cacheA.missing("a")).toBe(false);
            });
            test("Should return true when key doesnt exists", async () => {
                expect(await cacheA.missing("a")).toBe(true);
            });
            test("Should return true when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL);
                expect(await cacheA.missing("a")).toBe(true);
            });
        });
        describe("method: missingMany", () => {
            test("Should return only false when all keys exists", async () => {
                await cacheA.addMany({
                    a: { value: 1 },
                    b: { value: 1 },
                });
                expect(await cacheA.missingMany(["a", "b"])).toEqual({
                    a: false,
                    b: false,
                });
            });
            test("Should return only true when all keys doesnt exists", async () => {
                expect(await cacheA.missingMany(["a", "b"])).toEqual({
                    a: true,
                    b: true,
                });
            });
            test("Should return true and false when some keys exists", async () => {
                await cacheA.add("a", 1);
                expect(await cacheA.missingMany(["a", "b"])).toEqual({
                    a: false,
                    b: true,
                });
            });
            test("Should return true when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL);
                expect(await cacheA.missingMany(["a"])).toEqual({
                    a: true,
                });
            });
        });
        describe("method: get", () => {
            test("Should return value when key exists", async () => {
                await cacheA.add("a", 1);
                expect(await cacheA.get("a")).toBe(1);
            });
            test("Should return null when key doesnt exists", async () => {
                expect(await cacheA.get("a")).toBeNull();
            });
            test("Should return null when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL);
                expect(await cacheA.get("a")).toBeNull();
            });
        });
        describe("method: getMany", () => {
            test("Should return only values when all keys exists", async () => {
                await cacheA.addMany({
                    a: { value: 1 },
                    b: { value: 1 },
                });
                expect(await cacheA.getMany(["a", "b"])).toEqual({
                    a: 1,
                    b: 1,
                });
            });
            test("Should return only null when all keys doesnt exists", async () => {
                expect(await cacheA.getMany(["a", "b"])).toEqual({
                    a: null,
                    b: null,
                });
            });
            test("Should return values and null when some keys exists", async () => {
                await cacheA.add("a", 1);
                expect(await cacheA.getMany(["a", "b"])).toEqual({
                    a: 1,
                    b: null,
                });
            });
            test("Should return null when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL);
                expect(await cacheA.getMany(["a"])).toEqual({ a: null });
            });
        });
        describe("method: getOr", () => {
            test("Should return value when key exists", async () => {
                await cacheA.add("a", 1);
                expect(await cacheA.getOr("a", -1)).toBe(1);
            });
            describe("Should return default value when key doesnt exists", () => {
                test("Eager", async () => {
                    expect(await cacheA.getOr("a", -1)).toBe(-1);
                });
                test("Lazy", async () => {
                    expect(await cacheA.getOr("a", () => -1)).toBe(-1);
                });
                test("Async lazy", async () => {
                    expect(
                        await cacheA.getOr("a", () => Promise.resolve(-1)),
                    ).toBe(-1);
                });
            });
            describe("Should return default value when key is expired", () => {
                test("Eager", async () => {
                    await cacheA.add("a", 1, TTL);
                    await delay(TTL);
                    expect(await cacheA.getOr("a", -1)).toBe(-1);
                });
                test("Lazy", async () => {
                    await cacheA.add("a", 1, TTL);
                    await delay(TTL);
                    expect(await cacheA.getOr("a", () => -1)).toBe(-1);
                });
                test("Async lazy", async () => {
                    await cacheA.add("a", 1, TTL);
                    await delay(TTL);
                    expect(
                        await cacheA.getOr("a", () => Promise.resolve(-1)),
                    ).toBe(-1);
                });
            });
        });
        describe("method: getOrFail", () => {
            test("Should return value when key exists", async () => {
                await cacheA.add("a", 1);
                expect(await cacheA.getOrFail("a")).toBe(1);
            });
            test("Should throw KeyNotFoundCacheError value when key doesnt exists", async () => {
                await expect(cacheA.getOrFail("a")).rejects.toBeInstanceOf(
                    KeyNotFoundCacheError,
                );
            });
            test("Should throw KeyNotFoundCacheError value when key is expired exists", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL);
                await expect(cacheA.getOrFail("a")).rejects.toBeInstanceOf(
                    KeyNotFoundCacheError,
                );
            });
        });
        describe("method: getOrMany", () => {
            test("Should return only values when all keys exists", async () => {
                await cacheA.addMany({
                    a: { value: 1 },
                    b: { value: 1 },
                });
                expect(await cacheA.getOrMany({ a: -1, b: -1 })).toEqual({
                    a: 1,
                    b: 1,
                });
            });
            describe("Should return only default values when all keys doesnt exists", () => {
                test("Eager", async () => {
                    expect(await cacheA.getOrMany({ a: -1, b: -1 })).toEqual({
                        a: -1,
                        b: -1,
                    });
                });
                test("Lazy", async () => {
                    expect(
                        await cacheA.getOrMany({ a: () => -1, b: () => -1 }),
                    ).toEqual({
                        a: -1,
                        b: -1,
                    });
                });
                test("Async lazy", async () => {
                    expect(
                        await cacheA.getOrMany({
                            a: () => Promise.resolve(-1),
                            b: () => Promise.resolve(-1),
                        }),
                    ).toEqual({
                        a: -1,
                        b: -1,
                    });
                });
            });
            describe("Should return default value when key is expired", () => {
                test("Eager", async () => {
                    await cacheA.add("a", 1, TTL);
                    await delay(TTL);
                    expect(
                        await cacheA.getOrMany({
                            a: -1,
                        }),
                    ).toEqual({
                        a: -1,
                    });
                });
                test("Lazy", async () => {
                    await cacheA.add("a", 1, TTL);
                    await delay(TTL);
                    expect(
                        await cacheA.getOrMany({
                            a: () => -1,
                        }),
                    ).toEqual({
                        a: -1,
                    });
                });
                test("Async lazy", async () => {
                    await cacheA.add("a", 1, TTL);
                    await delay(TTL);
                    expect(
                        await cacheA.getOrMany({
                            a: () => Promise.resolve(-1),
                        }),
                    ).toEqual({
                        a: -1,
                    });
                });
            });
            test("Should return values and default values when some keys exists", async () => {
                await cacheA.add("a", 1);
                expect(await cacheA.getOrMany({ a: -1, b: -1 })).toEqual({
                    a: 1,
                    b: -1,
                });
            });
        });
        describe("method: add", () => {
            test("Should return true when key doesnt exist", async () => {
                expect(await cacheA.add("a", 1)).toBe(true);
            });
            test("Should return true when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL);
                expect(await cacheA.add("a", 1)).toBe(true);
            });
            test("Should persist value when key doesnt exist", async () => {
                await cacheA.add("a", 1);
                expect(await cacheA.get("a")).toBe(1);
            });
            test("Should persist value when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL);
                await cacheA.add("a", 1);
                expect(await cacheA.get("a")).toBe(1);
            });
            test("Should return false when key exist", async () => {
                await cacheA.add("a", 1);
                expect(await cacheA.add("a", 1)).toBe(false);
            });
            test("Should not persist value when key exist", async () => {
                await cacheA.add("a", 1);
                await cacheA.add("a", 2);
                expect(await cacheA.get("a")).toBe(1);
            });
        });
        describe("method: addMany", () => {
            test("Should return only true when all keys doesnt exists", async () => {
                expect(
                    await cacheA.addMany({
                        a: { value: 1 },
                        b: { value: 1 },
                    }),
                ).toEqual({
                    a: true,
                    b: true,
                });
            });
            test("Should return true when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL);
                expect(await cacheA.addMany({ a: { value: 1 } })).toEqual({
                    a: true,
                });
            });
            test("Should persist values when all keys doesnt exist", async () => {
                await cacheA.addMany({
                    a: { value: 1 },
                    b: { value: 1 },
                });
                expect(await cacheA.getMany(["a", "b"])).toEqual({
                    a: 1,
                    b: 1,
                });
            });
            test("Should persist value when key is expired", async () => {
                await cacheA.add("a", -1, TTL);
                await delay(TTL);
                await cacheA.addMany({ a: { value: 1 } });
                expect(await cacheA.get("a")).toBe(1);
            });
            test("Should return only false when all keys exists", async () => {
                await cacheA.addMany({
                    a: { value: 1 },
                    b: { value: 1 },
                });
                expect(
                    await cacheA.addMany({
                        a: { value: 1 },
                        b: { value: 1 },
                    }),
                ).toEqual({
                    a: false,
                    b: false,
                });
            });
            test("Should not persist values when key exist", async () => {
                await cacheA.addMany({
                    a: { value: 1 },
                    b: { value: 1 },
                });
                await cacheA.addMany({
                    a: { value: 1 },
                    b: { value: 1 },
                });
                expect(await cacheA.getMany(["a", "b"])).toEqual({
                    a: 1,
                    b: 1,
                });
            });
            test("Should return true and false when some keys exists", async () => {
                await cacheA.add("a", 1);
                expect(
                    await cacheA.addMany({
                        a: { value: 1 },
                        b: { value: 1 },
                    }),
                ).toEqual({
                    a: false,
                    b: true,
                });
            });
            test("Should persist and not persist values when some keys exists", async () => {
                await cacheA.addMany({
                    a: { value: 1 },
                });
                await cacheA.addMany({
                    a: { value: 1 },
                    b: { value: 2 },
                });
                expect(await cacheA.getMany(["a", "b"])).toEqual({
                    a: 1,
                    b: 2,
                });
            });
        });
        describe("method: update", () => {
            test("Should return true when key exists", async () => {
                await cacheA.add("a", 1);
                expect(await cacheA.update("a", -1)).toBe(true);
            });
            test("Should persist update when key exists", async () => {
                await cacheA.add("a", 1);
                await cacheA.update("a", -1);
                expect(await cacheA.get("a")).toBe(-1);
            });
            test("Should return false when key doesnt exists", async () => {
                expect(await cacheA.update("a", -1)).toBe(false);
            });
            test("Should return false when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL);
                expect(await cacheA.update("a", -1)).toBe(false);
            });
            test("Should not persist update when key doesnt exists", async () => {
                await cacheA.update("a", -1);
                expect(await cacheA.get("a")).toBeNull();
            });
            test("Should not persist update when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL);
                await cacheA.update("a", -1);
                expect(await cacheA.get("a")).toBeNull();
            });
        });
        describe("method: updateMany", () => {
            test("Should return only true when all keys exists", async () => {
                await cacheA.addMany({
                    a: { value: 1 },
                    b: { value: 1 },
                });
                expect(await cacheA.updateMany({ a: -1, b: -1 })).toEqual({
                    a: true,
                    b: true,
                });
            });
            test("Should persist values when all keys exist", async () => {
                await cacheA.addMany({
                    a: { value: 1 },
                    b: { value: 1 },
                });
                await cacheA.updateMany({ a: -1, b: -1 });
                expect(await cacheA.getMany(["a", "b"])).toEqual({
                    a: -1,
                    b: -1,
                });
            });
            test("Should return only false when all keys doesnt exists", async () => {
                expect(await cacheA.updateMany({ a: -1, b: -1 })).toEqual({
                    a: false,
                    b: false,
                });
            });
            test("Should return false when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL);
                expect(await cacheA.updateMany({ a: -1 })).toEqual({
                    a: false,
                });
            });
            test("Should not persist values when all keys doesnt exist", async () => {
                await cacheA.updateMany({ a: -1, b: -1 });
                expect(await cacheA.getMany(["a", "b"])).toEqual({
                    a: null,
                    b: null,
                });
            });
            test("Should not persist update when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL);
                await cacheA.updateMany({ a: -1 });
                expect(await cacheA.get("a")).toBeNull();
            });
            test("Should return true and false when some keys exists", async () => {
                await cacheA.add("a", 1);
                expect(await cacheA.updateMany({ a: -1, b: -1 })).toEqual({
                    a: true,
                    b: false,
                });
            });
            test("Should persist and not persist values when some keys exists", async () => {
                await cacheA.add("a", 1);
                await cacheA.updateMany({ a: -1, b: -1 });
                expect(await cacheA.getMany(["a", "b"])).toEqual({
                    a: -1,
                    b: null,
                });
            });
        });
        describe("method: put", () => {
            test("Should return true when key exists", async () => {
                await cacheA.add("a", 1);
                expect(await cacheA.put("a", -1)).toBe(true);
            });
            test("Should persist update when key exists", async () => {
                await cacheA.add("a", 1);
                await cacheA.put("a", -1);
                expect(await cacheA.get("a")).toBe(-1);
            });
            test("Should return false when key doesnt exists", async () => {
                expect(await cacheA.put("a", -1)).toBe(false);
            });
            test("Should return false when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL);
                expect(await cacheA.put("a", -1)).toBe(false);
            });
            test("Should persist insertion when key doesnt exists", async () => {
                await cacheA.put("a", -1);
                expect(await cacheA.get("a")).toBe(-1);
            });
            test("Should persist insertion when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL);
                await cacheA.put("a", -1);
                expect(await cacheA.get("a")).toBe(-1);
            });
            test("Should replace the ttl value", async () => {
                const ttlA = TimeSpan.fromMilliseconds(100);
                await cacheA.add("a", 1, ttlA);
                const ttlB = TimeSpan.fromMilliseconds(50);
                await cacheA.put("a", -1, ttlB);
                await delay(ttlB);
                expect(await cacheA.get("a")).toBeNull();
            });
        });
        describe("method: putMany", () => {
            test("Should return only true when all keys exists", async () => {
                await cacheA.addMany({
                    a: { value: 1 },
                    b: { value: 1 },
                });
                expect(
                    await cacheA.putMany({
                        a: { value: -1 },
                        b: { value: -1 },
                    }),
                ).toEqual({
                    a: true,
                    b: true,
                });
            });
            test("Should persist values when all keys exist", async () => {
                await cacheA.addMany({
                    a: { value: 1 },
                    b: { value: 1 },
                });
                await cacheA.putMany({ a: { value: -1 }, b: { value: -1 } });
                expect(await cacheA.getMany(["a", "b"])).toEqual({
                    a: -1,
                    b: -1,
                });
            });
            test("Should return only false when all keys doesnt exists", async () => {
                expect(
                    await cacheA.putMany({
                        a: { value: -1 },
                        b: { value: -1 },
                    }),
                ).toEqual({
                    a: false,
                    b: false,
                });
            });
            test("Should return false when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL);
                expect(await cacheA.putMany({ a: { value: -1 } })).toEqual({
                    a: false,
                });
            });
            test("Should persist values when all keys doesnt exist", async () => {
                await cacheA.putMany({ a: { value: -1 }, b: { value: -1 } });
                expect(await cacheA.getMany(["a", "b"])).toEqual({
                    a: -1,
                    b: -1,
                });
            });
            test("Should persist insertion when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL);
                await cacheA.putMany({ a: { value: -1 } });
                expect(await cacheA.get("a")).toBe(-1);
            });
            test("Should return true and false when some keys exists", async () => {
                await cacheA.add("a", 1);
                expect(
                    await cacheA.putMany({
                        a: { value: -1 },
                        b: { value: -1 },
                    }),
                ).toEqual({
                    a: true,
                    b: false,
                });
            });
            test("Should persist all values when some keys exists", async () => {
                await cacheA.add("a", 1);
                await cacheA.putMany({ a: { value: -1 }, b: { value: -1 } });
                expect(await cacheA.getMany(["a", "b"])).toEqual({
                    a: -1,
                    b: -1,
                });
            });
            test("Should replace the ttl value", async () => {
                const ttlA = TimeSpan.fromMilliseconds(100);
                await cacheA.add("a", 1, ttlA);
                const ttlB = TimeSpan.fromMilliseconds(50);
                await cacheA.putMany({
                    a: {
                        value: -1,
                        ttl: ttlB,
                    },
                });
                await delay(ttlB);
                expect(await cacheA.get("a")).toBeNull();
            });
        });
        describe("method: remove", () => {
            test("Should return true when key exists", async () => {
                await cacheA.add("a", 1);
                expect(await cacheA.remove("a")).toBe(true);
            });
            test("Should persist removal when key exists", async () => {
                await cacheA.add("a", 1);
                await cacheA.remove("a");
                expect(await cacheA.get("a")).toBeNull();
            });
            test("Should return false when key doesnt exists", async () => {
                expect(await cacheA.remove("a")).toBe(false);
            });
            test("Should return false when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL);
                expect(await cacheA.remove("a")).toBe(false);
            });
        });
        describe("method: removeMany", () => {
            test("Should return only true when all keys exists", async () => {
                await cacheA.addMany({
                    a: { value: 1 },
                    b: { value: 1 },
                });
                expect(await cacheA.removeMany(["a", "b"])).toEqual({
                    a: true,
                    b: true,
                });
            });
            test("Should persist values when all keys exist", async () => {
                await cacheA.addMany({
                    a: { value: 1 },
                    b: { value: 1 },
                });
                await cacheA.removeMany(["a", "b"]);
                expect(await cacheA.getMany(["a", "b"])).toEqual({
                    a: null,
                    b: null,
                });
            });
            test("Should return only false when all keys doesnt exists", async () => {
                expect(await cacheA.removeMany(["a", "b"])).toEqual({
                    a: false,
                    b: false,
                });
            });
            test("Should return false when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL);
                expect(await cacheA.removeMany(["a"])).toEqual({ a: false });
            });
            test("Should return true and false when some keys exists", async () => {
                await cacheA.add("a", 1);
                expect(await cacheA.removeMany(["a", "b"])).toEqual({
                    a: true,
                    b: false,
                });
            });
        });
        describe("method: getAndRemove", () => {
            test("Should return value when key exists", async () => {
                await cacheA.add("a", 1);
                expect(await cacheA.getAndRemove("a")).toBe(1);
            });
            test("Should return null when key doesnt exists", async () => {
                expect(await cacheA.getAndRemove("a")).toBeNull();
            });
            test("Should return null when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL);
                expect(await cacheA.getAndRemove("a")).toBeNull();
            });
            test("Should persist removal when key exists", async () => {
                await cacheA.add("a", 1);
                await cacheA.getAndRemove("a");
                expect(await cacheA.get("a")).toBeNull();
            });
        });
        describe("method: getOrAdd", () => {
            test("Should return value when key exists", async () => {
                await cacheA.add("a", 1);
                expect(await cacheA.getOrAdd("a", -1)).toBe(1);
            });
            describe("Should persist insertion when key doesnt exists", () => {
                test("Eager", async () => {
                    await cacheA.getOrAdd("a", -1);
                    expect(await cacheA.get("a")).toBe(-1);
                });
                test("Lazy", async () => {
                    await cacheA.getOrAdd("a", () => -1);
                    expect(await cacheA.get("a")).toBe(-1);
                });
                test("Async lazy", async () => {
                    await cacheA.getOrAdd("a", () => Promise.resolve(-1));
                    expect(await cacheA.get("a")).toBe(-1);
                });
            });
            describe("Should persist insertion when key is expired", () => {
                test("Eager", async () => {
                    await cacheA.add("a", 1, TTL);
                    await delay(TTL);
                    await cacheA.getOrAdd("a", -1);
                    expect(await cacheA.get("a")).toBe(-1);
                });
                test("Lazy", async () => {
                    await cacheA.add("a", 1, TTL);
                    await delay(TTL);
                    await cacheA.getOrAdd("a", () => -1);
                    expect(await cacheA.get("a")).toBe(-1);
                });
                test("Async lazy", async () => {
                    await cacheA.add("a", 1, TTL);
                    await delay(TTL);
                    await cacheA.getOrAdd("a", () => Promise.resolve(-1));
                    expect(await cacheA.get("a")).toBe(-1);
                });
            });
        });
        describe("method: increment", () => {
            test("Should return true when key exists", async () => {
                await cacheA.add("a", 1);
                expect(await cacheA.increment("a", 1)).toBe(true);
            });
            test("Should persist increment when key exists", async () => {
                await cacheA.add("a", 1);
                await cacheA.increment("a", 1);
                expect(await cacheA.get("a")).toBe(2);
            });
            test("Should return false when key doesnt exists", async () => {
                expect(await cacheA.increment("a", 1)).toBe(false);
            });
            test("Should return false when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL);
                expect(await cacheA.increment("a", 1)).toBe(false);
            });
            test("Should not persist increment when key doesnt exists", async () => {
                await cacheA.increment("a", 1);
                expect(await cacheA.get("a")).toBeNull();
            });
            test("Should not persist increment when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL);
                await cacheA.increment("a", 1);
                expect(await cacheA.get("a")).toBeNull();
            });
            test("Should throw TypeCacheError key value is not number type", async () => {
                await cacheA.add("a", "str");
                await expect(cacheA.increment("a", 1)).rejects.toBeInstanceOf(
                    TypeCacheError,
                );
            });
        });
        describe("method: decrement", () => {
            test("Should return true when key exists", async () => {
                await cacheA.add("a", 1);
                expect(await cacheA.decrement("a", 1)).toBe(true);
            });
            test("Should persist decrement when key exists", async () => {
                await cacheA.add("a", 1);
                await cacheA.decrement("a", 1);
                expect(await cacheA.get("a")).toBe(0);
            });
            test("Should return false when key doesnt exists", async () => {
                expect(await cacheA.decrement("a", 1)).toBe(false);
            });
            test("Should return false when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL);
                expect(await cacheA.decrement("a", 1)).toBe(false);
            });
            test("Should not persist decrement when key doesnt exists", async () => {
                await cacheA.decrement("a", 1);
                expect(await cacheA.get("a")).toBeNull();
            });
            test("Should not persist decrement when key is expired", async () => {
                await cacheA.add("a", 1, TTL);
                await delay(TTL);
                await cacheA.decrement("a", 1);
                expect(await cacheA.get("a")).toBeNull();
            });
            test("Should throw TypeCacheError key value is not number type", async () => {
                await cacheA.add("a", "str");
                await expect(cacheA.decrement("a", 1)).rejects.toBeInstanceOf(
                    TypeCacheError,
                );
            });
        });
        describe("method: clear", () => {
            test("Should remove all keys", async () => {
                await cacheA.addMany({
                    a: { value: 1 },
                    b: { value: 2 },
                    c: { value: 3 },
                    d: { value: 4 },
                    e: { value: 5 },
                    f: { value: 6 },
                });
                await cacheA.clear();
                expect(
                    await cacheA.getMany(["a", "b", "c", "d", "e", "f"]),
                ).toEqual({
                    a: null,
                    b: null,
                    c: null,
                    d: null,
                    e: null,
                    f: null,
                });
            });
        });
    });
    describe("Group tests:", () => {
        test("method: exists", async () => {
            await cacheA.put("a", 1);
            expect(await cacheA.exists("a")).toBe(true);
            expect(await cacheB.exists("a")).toBe(false);
        });
        test("method: existsMany", async () => {
            await cacheA.putMany({
                a: { value: 1 },
                b: { value: 1 },
            });
            expect(await cacheA.existsMany(["a", "b"])).toEqual({
                a: true,
                b: true,
            });
            expect(await cacheB.existsMany(["a", "b"])).toEqual({
                a: false,
                b: false,
            });
        });
        test("method: missing", async () => {
            await cacheA.put("a", 1);
            expect(await cacheA.missing("a")).toBe(false);
            expect(await cacheB.missing("a")).toBe(true);
        });
        test("method: missingMany", async () => {
            await cacheA.putMany({
                a: { value: 1 },
                b: { value: 1 },
            });
            expect(await cacheA.missingMany(["a", "b"])).toEqual({
                a: false,
                b: false,
            });
            expect(await cacheB.missingMany(["a", "b"])).toEqual({
                a: true,
                b: true,
            });
        });
        test("method: get", async () => {
            await cacheA.put("a", 1);
            expect(await cacheA.get("a")).toBe(1);
            expect(await cacheB.get("a")).toBeNull();
        });
        test("method: getMany", async () => {
            await cacheA.putMany({
                a: { value: 1 },
                b: { value: 1 },
            });
            expect(await cacheA.getMany(["a", "b"])).toEqual({
                a: 1,
                b: 1,
            });
            expect(await cacheB.getMany(["a", "b"])).toEqual({
                a: null,
                b: null,
            });
        });
        test("method: getOr", async () => {
            await cacheA.put("a", 1);
            expect(await cacheA.getOr("a", -1)).toBe(1);
            expect(await cacheB.getOr("a", -1)).toBe(-1);
        });
        test("method: getOrMany", async () => {
            await cacheA.putMany({
                a: { value: 1 },
                b: { value: 1 },
            });
            expect(
                await cacheA.getOrMany({
                    a: -1,
                    b: -1,
                }),
            ).toEqual({
                a: 1,
                b: 1,
            });
            expect(
                await cacheB.getOrMany({
                    a: -1,
                    b: -1,
                }),
            ).toEqual({
                a: -1,
                b: -1,
            });
        });
        test("method: getOrFail", async () => {
            await cacheA.put("a", 1);
            expect(await cacheA.getOrFail("a")).toBe(1);
            await expect(cacheB.getOrFail("a")).rejects.toBeInstanceOf(
                KeyNotFoundCacheError,
            );
        });
        test("method: add", async () => {
            await cacheA.add("a", 1);
            await cacheB.add("a", 2);
            expect(await cacheA.get("a")).toBe(1);
            expect(await cacheB.get("a")).toBe(2);
        });
        test("method: addMany", async () => {
            await cacheA.addMany({
                a: { value: 1 },
                b: { value: 1 },
            });
            await cacheB.addMany({
                a: { value: 2 },
                b: { value: 2 },
            });
            expect(await cacheA.getMany(["a", "b"])).toEqual({ a: 1, b: 1 });
            expect(await cacheB.getMany(["a", "b"])).toEqual({ a: 2, b: 2 });
        });
        test("method: update", async () => {
            await cacheA.add("a", 1);
            await cacheB.add("a", 1);
            await cacheA.update("a", 2);
            await cacheB.update("a", 3);
            expect(await cacheA.get("a")).toBe(2);
            expect(await cacheB.get("a")).toBe(3);
        });
        test("method: updateMany", async () => {
            await cacheA.addMany({
                a: { value: 1 },
                b: { value: 1 },
            });
            await cacheB.addMany({
                a: { value: 1 },
                b: { value: 1 },
            });
            await cacheA.updateMany({
                a: 2,
                b: 2,
            });
            await cacheB.updateMany({
                a: 3,
                b: 3,
            });
            expect(await cacheA.getMany(["a", "b"])).toEqual({ a: 2, b: 2 });
            expect(await cacheB.getMany(["a", "b"])).toEqual({ a: 3, b: 3 });
        });
        test("method: put", async () => {
            await cacheA.put("a", 2);
            await cacheB.put("a", 3);
            expect(await cacheA.get("a")).toBe(2);
            expect(await cacheB.get("a")).toBe(3);
        });
        test("method: putMany", async () => {
            await cacheA.putMany({
                a: { value: 2 },
                b: { value: 2 },
            });
            await cacheB.putMany({
                a: { value: 3 },
                b: { value: 3 },
            });
            expect(await cacheA.getMany(["a", "b"])).toEqual({ a: 2, b: 2 });
            expect(await cacheB.getMany(["a", "b"])).toEqual({ a: 3, b: 3 });
        });
        test("method: remove", async () => {
            await cacheA.add("a", 1);
            await cacheB.add("a", 1);
            await cacheA.remove("a");
            expect(await cacheA.get("a")).toBeNull();
            expect(await cacheB.get("a")).toBe(1);
        });
        test("method: removeMany", async () => {
            await cacheA.addMany({
                a: { value: 1 },
                b: { value: 1 },
            });
            await cacheB.addMany({
                a: { value: 1 },
                b: { value: 1 },
            });
            await cacheA.removeMany(["a", "b"]);
            expect(await cacheA.getMany(["a", "b"])).toEqual({
                a: null,
                b: null,
            });
            expect(await cacheB.getMany(["a", "b"])).toEqual({ a: 1, b: 1 });
        });
        test("method: getAndRemove", async () => {
            await cacheA.add("a", 1);
            await cacheB.add("a", 2);
            expect(await cacheA.getAndRemove("a")).toBe(1);
            expect(await cacheA.get("a")).toBeNull();
            expect(await cacheB.get("a")).toBe(2);
        });
        test("method: getOrAdd", async () => {
            await cacheA.getOrAdd("a", 1);
            await cacheB.getOrAdd("a", 2);
            expect(await cacheA.get("a")).toBe(1);
            expect(await cacheB.get("a")).toBe(2);
        });
        test("method: increment", async () => {
            await cacheA.add("a", 1);
            await cacheB.add("a", 1);
            await cacheA.increment("a", 1);
            expect(await cacheA.get("a")).toBe(2);
            expect(await cacheB.get("a")).toBe(1);
        });
        test("method: decrement", async () => {
            await cacheA.add("a", 1);
            await cacheB.add("a", 1);
            await cacheA.decrement("a", 1);
            expect(await cacheA.get("a")).toBe(0);
            expect(await cacheB.get("a")).toBe(1);
        });
        test("method: clear", async () => {
            await cacheA.addMany({
                a: { value: 1 },
                b: { value: 2 },
            });
            await cacheB.addMany({
                a: { value: 1 },
                b: { value: 2 },
            });
            await cacheA.clear();
            expect(await cacheA.getMany(["a", "b"])).toEqual({
                a: null,
                b: null,
            });
            expect(await cacheB.getMany(["a", "b"])).toEqual({
                a: 1,
                b: 2,
            });
        });
    });
}
