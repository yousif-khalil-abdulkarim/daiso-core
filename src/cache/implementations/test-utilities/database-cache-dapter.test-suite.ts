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
    type ICacheData,
    type ICacheDataExpiration,
    type ICacheInsert,
    type ICacheUpdate,
    type IDatabaseCacheAdapter,
} from "@/cache/contracts/_module-exports.js";
import { type Promisable } from "@/utilities/_module-exports.js";
import { TimeSpan } from "@/time-span/implementations/_module-exports.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/test-utilities"`
 * @group TestUtilities
 */
export type DatabaseCacheAdapterTestSuiteSettings = {
    expect: ExpectStatic;
    test: TestAPI;
    describe: SuiteAPI;
    beforeEach: typeof beforeEach;
    createAdapter: () => Promisable<IDatabaseCacheAdapter>;
};

/**
 * The `databaseCacheAdapterTestSuite` function simplifies the process of testing your custom implementation of {@link IDatabaseCacheAdapter | `IDatabaseCacheAdapter`} with `vitest`.
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/test-utilities"`
 * @group TestUtilities
 * @example
 * ```ts
 * import { afterEach, beforeEach, describe, expect, test } from "vitest";
 * import Sqlite, { type Database } from "better-sqlite3";
 * import { databaseCacheAdapterTestSuite } from "@daiso-tech/core/cache/test-utilities";
 * import { KyselyCacheAdapter, type KyselyCacheAdapterTables } from "@daiso-tech/core/cache/kysely-cache-adapter";
 * import { Serde } from "@daiso-tech/core/serde";
 * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";
 * import { Kysely, SqliteDialect } from "kysely";
 *
 * describe("class: KyselyCacheAdapter", () => {
 *   let database: Database;
 *   let kysely: Kysely<KyselyCacheAdapterTables>;
 *
 *   beforeEach(() => {
 *       database = new Sqlite(":memory:");
 *       kysely = new Kysely({
 *          dialect: new SqliteDialect({
 *              database,
 *          }),
 *       });
 *   });
 *   afterEach(() => {
 *       database.close();
 *   });
 *   databaseCacheAdapterTestSuite({
 *       createAdapter: async () => {
 *           const adapter = new KyselyCacheAdapter({
 *               kysely,
 *               shouldRemoveExpiredKeys: false,
 *               serde: new Serde(new SuperJsonSerdeAdapter()),
 *           });
 *           await adapter.init();
 *           return adapter;
 *       },
 *       test,
 *       beforeEach,
 *       expect,
 *       describe,
 *    });
 * });
 * ```
 */
export function databaseCacheAdapterTestSuite(
    settings: DatabaseCacheAdapterTestSuiteSettings,
): void {
    const { expect, test, createAdapter, describe, beforeEach } = settings;
    let adapter: IDatabaseCacheAdapter<any>;
    beforeEach(async () => {
        adapter = await createAdapter();
    });

    describe("method: find", () => {
        test("Should return null when key doesnt exists", async () => {
            const findData = await adapter.find("a");
            expect(findData).toBeNull();
        });
        test("Should return the value when key exists", async () => {
            const insertData: ICacheInsert = {
                key: "a",
                value: 1,
                expiration: TimeSpan.fromMilliseconds(25).toEndDate(),
            };
            await adapter.insert(insertData);
            const findData = await adapter.find(insertData.key);
            const result: ICacheData = {
                expiration: insertData.expiration,
                value: insertData.value,
            };
            expect(findData).toStrictEqual(result);
        });
    });
    describe("method: insert", () => {
        test("Should throw an error when key exists", async () => {
            const insertData: ICacheInsert = {
                key: "a",
                value: 1,
                expiration: TimeSpan.fromMilliseconds(25).toEndDate(),
            };
            await adapter.insert(insertData);
            const promise = adapter.insert(insertData);
            await expect(promise).rejects.toBeDefined();
        });
    });
    describe("method: upsert", () => {
        test("Should return null when key doesnt exist", async () => {
            const upsertData: ICacheInsert = {
                key: "a",
                value: 1,
                expiration: TimeSpan.fromMilliseconds(25).toEndDate(),
            };
            const prevData = await adapter.upsert(upsertData);
            expect(prevData).toBeNull();
        });
        test("Should return previous key expiration when key exist", async () => {
            const upsertData1: ICacheInsert = {
                key: "a",
                value: 1,
                expiration: TimeSpan.fromMilliseconds(25).toEndDate(),
            };
            await adapter.upsert(upsertData1);
            const upsertData2: ICacheInsert = {
                key: "a",
                value: 2,
                expiration: TimeSpan.fromMilliseconds(50).toEndDate(),
            };
            const prevData = await adapter.upsert(upsertData2);
            const result: ICacheDataExpiration = {
                expiration: upsertData1.expiration,
            };
            expect({ expiration: prevData?.expiration }).toStrictEqual(result);
        });
        test("Should persist insertion when key doesnt exist", async () => {
            const upsertData: ICacheInsert = {
                key: "a",
                value: 1,
                expiration: TimeSpan.fromMilliseconds(25).toEndDate(),
            };
            await adapter.upsert(upsertData);
            const findData = await adapter.find(upsertData.key);
            const result: ICacheData = {
                value: upsertData.value,
                expiration: upsertData.expiration,
            };
            expect(findData).toStrictEqual(result);
        });
        test("Should persist update when key exist", async () => {
            const upsertData1: ICacheInsert = {
                key: "a",
                value: 1,
                expiration: TimeSpan.fromMilliseconds(25).toEndDate(),
            };
            await adapter.upsert(upsertData1);
            const upsertData2: ICacheInsert = {
                key: "a",
                value: 2,
                expiration: TimeSpan.fromMilliseconds(50).toEndDate(),
            };
            await adapter.upsert(upsertData2);
            const findData = await adapter.find(upsertData2.key);
            const result: ICacheData = {
                value: upsertData2.value,
                expiration: upsertData2.expiration,
            };
            expect(findData).toStrictEqual(result);
        });
    });
    describe("method: updateExpired", () => {
        test("Should not persist update when key has no expiration", async () => {
            const insertData: ICacheInsert = {
                key: "a",
                value: 1,
                expiration: null,
            };
            await adapter.insert(insertData);
            const updateData: ICacheInsert = {
                key: "a",
                value: 2,
                expiration: null,
            };
            await adapter.updateExpired(updateData);
            const findData = await adapter.find(updateData.key);
            const result: ICacheData = {
                value: insertData.value,
                expiration: insertData.expiration,
            };
            expect(findData).toStrictEqual(result);
        });
        test("Should return 0 when key has no expiration", async () => {
            const insertData: ICacheInsert = {
                key: "a",
                value: 1,
                expiration: null,
            };
            await adapter.insert(insertData);
            const updateData: ICacheInsert = {
                key: "a",
                value: 2,
                expiration: null,
            };
            const result = await adapter.updateExpired(updateData);
            expect(result).toBe(0);
        });
        test("Should not persist update when key has expiration but not expired", async () => {
            const insertData: ICacheInsert = {
                key: "a",
                value: 1,
                expiration: TimeSpan.fromMilliseconds(25).toEndDate(),
            };
            await adapter.insert(insertData);
            const updateData: ICacheInsert = {
                key: "a",
                value: 2,
                expiration: null,
            };
            await adapter.updateExpired(updateData);
            const findData = await adapter.find(updateData.key);
            const result: ICacheData = {
                value: insertData.value,
                expiration: insertData.expiration,
            };
            expect(findData).toStrictEqual(result);
        });
        test("Should return 0 update when key has expiration but not expired", async () => {
            const insertData: ICacheInsert = {
                key: "a",
                value: 1,
                expiration: TimeSpan.fromMilliseconds(25).toEndDate(),
            };
            await adapter.insert(insertData);
            const updateData: ICacheInsert = {
                key: "a",
                value: 2,
                expiration: null,
            };
            const result = await adapter.updateExpired(updateData);
            expect(result).toBe(0);
        });
        test("Should persist update when key has expiration and expired", async () => {
            const insertData: ICacheInsert = {
                key: "a",
                value: 1,
                expiration: TimeSpan.fromMilliseconds(25).toStartDate(),
            };
            await adapter.insert(insertData);
            const updateData: ICacheInsert = {
                key: "a",
                value: 2,
                expiration: null,
            };
            await adapter.updateExpired(updateData);
            const findData = await adapter.find(updateData.key);
            const result: ICacheData = {
                value: updateData.value,
                expiration: updateData.expiration,
            };
            expect(findData).toStrictEqual(result);
        });
        test("Should return 1 update when key has expiration and expired", async () => {
            const insertData: ICacheInsert = {
                key: "a",
                value: 1,
                expiration: TimeSpan.fromMilliseconds(25).toStartDate(),
            };
            await adapter.insert(insertData);
            const updateData: ICacheInsert = {
                key: "a",
                value: 2,
                expiration: null,
            };
            const result = await adapter.updateExpired(updateData);
            expect(result).toBe(1);
        });
    });
    describe("method: updateUnexpired", () => {
        test("Should persist update when key has no expiration", async () => {
            const insertData: ICacheInsert = {
                key: "a",
                value: 1,
                expiration: null,
            };
            await adapter.insert(insertData);
            const updateData: ICacheUpdate = {
                key: "a",
                value: 2,
            };
            await adapter.updateUnexpired(updateData);
            const findData = await adapter.find(updateData.key);
            const result: ICacheData = {
                value: updateData.value,
                expiration: insertData.expiration,
            };
            expect(findData).toStrictEqual(result);
        });
        test("Should return 1 when key has no expiration", async () => {
            const insertData: ICacheInsert = {
                key: "a",
                value: 1,
                expiration: null,
            };
            await adapter.insert(insertData);
            const updateData: ICacheUpdate = {
                key: "a",
                value: 2,
            };
            const result = await adapter.updateUnexpired(updateData);
            expect(result).toBe(1);
        });
        test("Should persist update when key has expiration but not expired", async () => {
            const insertData: ICacheInsert = {
                key: "a",
                value: 1,
                expiration: TimeSpan.fromMilliseconds(25).toEndDate(),
            };
            await adapter.insert(insertData);
            const updateData: ICacheUpdate = {
                key: "a",
                value: 2,
            };
            await adapter.updateUnexpired(updateData);
            const findData = await adapter.find(updateData.key);
            const result: ICacheData = {
                value: updateData.value,
                expiration: insertData.expiration,
            };
            expect(findData).toStrictEqual(result);
        });
        test("Should return 1 update when key has expiration but not expired", async () => {
            const insertData: ICacheInsert = {
                key: "a",
                value: 1,
                expiration: TimeSpan.fromMilliseconds(25).toEndDate(),
            };
            await adapter.insert(insertData);
            const updateData: ICacheUpdate = {
                key: "a",
                value: 2,
            };
            const result = await adapter.updateUnexpired(updateData);
            expect(result).toBe(1);
        });
        test("Should not persist update when key has expiration and expired", async () => {
            const insertData: ICacheInsert = {
                key: "a",
                value: 1,
                expiration: TimeSpan.fromMilliseconds(25).toStartDate(),
            };
            await adapter.insert(insertData);
            const updateData: ICacheUpdate = {
                key: "a",
                value: 2,
            };
            await adapter.updateUnexpired(updateData);
            const findData = await adapter.find(updateData.key);
            const result: ICacheData = {
                value: insertData.value,
                expiration: insertData.expiration,
            };
            expect(findData).toStrictEqual(result);
        });
        test("Should return 0 update when key has expiration and expired", async () => {
            const insertData: ICacheInsert = {
                key: "a",
                value: 1,
                expiration: TimeSpan.fromMilliseconds(25).toStartDate(),
            };
            await adapter.insert(insertData);
            const updateData: ICacheUpdate = {
                key: "a",
                value: 2,
            };
            const result = await adapter.updateUnexpired(updateData);
            expect(result).toBe(0);
        });
    });
    describe("method: incrementUnexpired", () => {
        test("Should persist update when key has no expiration", async () => {
            const insertData: ICacheInsert<number> = {
                key: "a",
                value: 1,
                expiration: null,
            };
            await adapter.insert(insertData);
            const updateData: ICacheUpdate<number> = {
                key: "a",
                value: 2,
            };
            await adapter.incrementUnexpired(updateData);
            const findData = await adapter.find(updateData.key);
            const result: ICacheData = {
                value: insertData.value + updateData.value,
                expiration: insertData.expiration,
            };
            expect(findData).toStrictEqual(result);
        });
        test("Should return 1 when key has no expiration", async () => {
            const insertData: ICacheInsert = {
                key: "a",
                value: 1,
                expiration: null,
            };
            await adapter.insert(insertData);
            const updateData: ICacheUpdate<number> = {
                key: "a",
                value: 2,
            };
            const result = await adapter.incrementUnexpired(updateData);
            expect(result).toBe(1);
        });
        test("Should persist update when key has expiration but not expired", async () => {
            const insertData: ICacheInsert<number> = {
                key: "a",
                value: 1,
                expiration: TimeSpan.fromMilliseconds(25).toEndDate(),
            };
            await adapter.insert(insertData);
            const updateData: ICacheUpdate<number> = {
                key: "a",
                value: 2,
            };
            await adapter.incrementUnexpired(updateData);
            const findData = await adapter.find(updateData.key);
            const result: ICacheData = {
                value: insertData.value + updateData.value,
                expiration: insertData.expiration,
            };
            expect(findData).toStrictEqual(result);
        });
        test("Should return 1 update when key has expiration but not expired", async () => {
            const insertData: ICacheInsert = {
                key: "a",
                value: 1,
                expiration: TimeSpan.fromMilliseconds(25).toEndDate(),
            };
            await adapter.insert(insertData);
            const updateData: ICacheUpdate<number> = {
                key: "a",
                value: 2,
            };
            const result = await adapter.incrementUnexpired(updateData);
            expect(result).toBe(1);
        });
        test("Should not persist update when key has expiration and expired", async () => {
            const insertData: ICacheInsert = {
                key: "a",
                value: 1,
                expiration: TimeSpan.fromMilliseconds(25).toStartDate(),
            };
            await adapter.insert(insertData);
            const updateData: ICacheUpdate<number> = {
                key: "a",
                value: 2,
            };
            await adapter.incrementUnexpired(updateData);
            const findData = await adapter.find(updateData.key);
            const result: ICacheData = {
                value: insertData.value,
                expiration: insertData.expiration,
            };
            expect(findData).toStrictEqual(result);
        });
        test("Should return 0 update when key has expiration and expired", async () => {
            const insertData: ICacheInsert = {
                key: "a",
                value: 1,
                expiration: TimeSpan.fromMilliseconds(25).toStartDate(),
            };
            await adapter.insert(insertData);
            const updateData: ICacheUpdate<number> = {
                key: "a",
                value: 2,
            };
            const result = await adapter.incrementUnexpired(updateData);
            expect(result).toBe(0);
        });
        test("Should throw an error when incrementing a number error", async () => {
            await adapter.insert({
                key: "a",
                value: "A",
                expiration: null,
            });
            const promise = adapter.incrementUnexpired({
                key: "a",
                value: 2,
            });
            await expect(promise).rejects.toBeDefined();
        });
    });
    describe("method: removeExpiredMany", () => {
        test("Should not persist removal when key has no expiration", async () => {
            const insertData: ICacheInsert = {
                key: "a",
                value: 1,
                expiration: null,
            };
            await adapter.insert(insertData);
            await adapter.removeExpiredMany([insertData.key]);
            const findData = await adapter.find(insertData.key);
            const result: ICacheData = {
                value: insertData.value,
                expiration: insertData.expiration,
            };
            expect(findData).toStrictEqual(result);
        });
        test("Should return 0 when key has no expiration", async () => {
            const insertData: ICacheInsert = {
                key: "a",
                value: 1,
                expiration: null,
            };
            await adapter.insert(insertData);
            const result = await adapter.removeExpiredMany([insertData.key]);
            expect(result).toBe(0);
        });
        test("Should not persist removal when key has expiration but not expired", async () => {
            const insertData: ICacheInsert = {
                key: "a",
                value: 1,
                expiration: TimeSpan.fromMilliseconds(25).toEndDate(),
            };
            await adapter.insert(insertData);
            await adapter.removeExpiredMany([insertData.key]);
            const findData = await adapter.find(insertData.key);
            const result: ICacheData = {
                value: insertData.value,
                expiration: insertData.expiration,
            };
            expect(findData).toStrictEqual(result);
        });
        test("Should return 0 removal when key has expiration but not expired", async () => {
            const insertData: ICacheInsert = {
                key: "a",
                value: 1,
                expiration: TimeSpan.fromMilliseconds(25).toEndDate(),
            };
            await adapter.insert(insertData);
            const result = await adapter.removeExpiredMany([insertData.key]);
            expect(result).toBe(0);
        });
        test("Should persist removal when key has expiration and expired", async () => {
            const insertData: ICacheInsert = {
                key: "a",
                value: 1,
                expiration: TimeSpan.fromMilliseconds(25).toStartDate(),
            };
            await adapter.insert(insertData);
            await adapter.removeExpiredMany([insertData.key]);
            const findData = await adapter.find(insertData.key);
            expect(findData).toBeNull();
        });
        test("Should return number of removed keys when all keys has expiration and are expired", async () => {
            const insertData1: ICacheInsert = {
                key: "a",
                value: 1,
                expiration: TimeSpan.fromMilliseconds(25).toStartDate(),
            };
            const insertData2: ICacheInsert = {
                key: "b",
                value: 1,
                expiration: TimeSpan.fromMilliseconds(25).toStartDate(),
            };
            await adapter.insert(insertData1);
            await adapter.insert(insertData2);
            const result = await adapter.removeExpiredMany([
                insertData1.key,
                insertData2.key,
            ]);
            expect(result).toBe(2);
        });
    });
    describe("method: removeUnexpiredMany", () => {
        test("Should persist removal when key has no expiration", async () => {
            const insertData: ICacheInsert = {
                key: "a",
                value: 1,
                expiration: null,
            };
            await adapter.insert(insertData);
            await adapter.removeUnexpiredMany([insertData.key]);
            const findData = await adapter.find(insertData.key);
            expect(findData).toBeNull();
        });
        test("Should return number of removed keys when all keys has no expiration", async () => {
            const insertData1: ICacheInsert = {
                key: "a",
                value: 1,
                expiration: null,
            };
            const insertData2: ICacheInsert = {
                key: "b",
                value: 1,
                expiration: null,
            };
            await adapter.insert(insertData1);
            await adapter.insert(insertData2);
            const result = await adapter.removeUnexpiredMany([
                insertData1.key,
                insertData2.key,
            ]);
            expect(result).toBe(2);
        });
        test("Should persist removal when key has expiration but not expired", async () => {
            const insertData: ICacheInsert = {
                key: "a",
                value: 1,
                expiration: TimeSpan.fromMilliseconds(25).toEndDate(),
            };
            await adapter.insert(insertData);
            await adapter.removeUnexpiredMany([insertData.key]);
            const findData = await adapter.find(insertData.key);
            expect(findData).toBeNull();
        });
        test("Should return number of removed keys when all key has expiration but not expired", async () => {
            const insertData1: ICacheInsert = {
                key: "a",
                value: 1,
                expiration: TimeSpan.fromMilliseconds(25).toEndDate(),
            };
            const insertData2: ICacheInsert = {
                key: "b",
                value: 1,
                expiration: TimeSpan.fromMilliseconds(25).toEndDate(),
            };
            await adapter.insert(insertData1);
            await adapter.insert(insertData2);
            const result = await adapter.removeUnexpiredMany([
                insertData1.key,
                insertData2.key,
            ]);
            expect(result).toBe(2);
        });
        test("Should not persist removal when key has expiration and expired", async () => {
            const insertData: ICacheInsert = {
                key: "a",
                value: 1,
                expiration: TimeSpan.fromMilliseconds(25).toStartDate(),
            };
            await adapter.insert(insertData);
            await adapter.removeUnexpiredMany([insertData.key]);
            const findData = await adapter.find(insertData.key);
            const result: ICacheData = {
                expiration: insertData.expiration,
                value: insertData.value,
            };
            expect(findData).toStrictEqual(result);
        });
        test("Should return 0 removal when key has expiration and expired", async () => {
            const insertData: ICacheInsert = {
                key: "a",
                value: 1,
                expiration: TimeSpan.fromMilliseconds(25).toStartDate(),
            };
            await adapter.insert(insertData);
            const result = await adapter.removeUnexpiredMany([insertData.key]);
            expect(result).toBe(0);
        });
    });
    describe("method: removeAll", () => {
        test("Should remove all keys", async () => {
            await adapter.insert({
                key: "cache/a",
                value: 1,
                expiration: null,
            });
            await adapter.insert({
                key: "cache/b",
                value: 2,
                expiration: null,
            });
            await adapter.insert({
                key: "c",
                value: 3,
                expiration: null,
            });
            await adapter.removeAll();
            expect([
                await adapter.find("cache/a"),
                await adapter.find("cache/b"),
                await adapter.find("c"),
            ]).toEqual([null, null, null]);
        });
    });
    describe("method: removeByKeyPrefix", () => {
        test("Should remove the keys that mathc the prefix", async () => {
            await adapter.insert({
                key: "cache/a",
                value: 1,
                expiration: null,
            });
            await adapter.insert({
                key: "cache/b",
                value: 2,
                expiration: null,
            });
            await adapter.insert({
                key: "c",
                value: 3,
                expiration: null,
            });

            await adapter.removeByKeyPrefix("cache");

            const result = [
                await adapter.find("cache/a"),
                await adapter.find("cache/b"),
                await adapter.find("c"),
            ];
            expect(result).toStrictEqual([
                null,
                null,
                {
                    value: 3,
                    expiration: null,
                },
            ]);
        });
    });
}
