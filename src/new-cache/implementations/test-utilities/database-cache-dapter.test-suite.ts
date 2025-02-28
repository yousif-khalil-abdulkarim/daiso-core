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
    type ICacheInsert,
    type ICacheUpdate,
    type IDatabaseCacheAdapter,
} from "@/new-cache/contracts/_module-exports.js";
import { TimeSpan, type Promisable } from "@/utilities/_module-exports.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/implementations/test-utilities"```
 * @group Test utilities
 */
export type DatabaseCacheAdapterTestSuiteSettings = {
    expect: ExpectStatic;
    test: TestAPI;
    describe: SuiteAPI;
    beforeEach: typeof beforeEach;
    createAdapter: () => Promisable<IDatabaseCacheAdapter>;
};

/**
 * The <i>databaseCacheAdapterTestSuite</i> function simplifies the process of testing your custom implementation of <i>{@link IDatabaseCacheAdapter}</i> with <i>vitest</i>.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/implementations/test-utilities"```
 * @group Test utilities
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
            const data = await adapter.find("a");
            expect(data).toBeNull();
        });
        test("Should return the value when key exists", async () => {
            const data: ICacheInsert = {
                key: "a",
                value: 1,
                expiration: TimeSpan.fromMilliseconds(25).toEndDate(),
            };
            await adapter.insert(data);
            const findData = await adapter.find(data.key);
            expect(findData).toEqual(data);
        });
    });
    describe("method: insert", () => {
        test("Should throw an error when key exists", async () => {
            const data: ICacheInsert = {
                key: "a",
                value: 1,
                expiration: TimeSpan.fromMilliseconds(25).toEndDate(),
            };
            await adapter.insert(data);
            const promise = adapter.insert(data);
            await expect(promise).rejects.toBeDefined();
        });
    });
    describe("method: upsert", () => {
        test("Should return null when key doesnt exist", async () => {
            const data: ICacheInsert = {
                key: "a",
                value: 1,
                expiration: TimeSpan.fromMilliseconds(25).toEndDate(),
            };
            const prevData = await adapter.upsert(data);
            expect(prevData).toBeNull();
        });
        test("Should return previousKey when key exist", async () => {
            const data1: ICacheInsert = {
                key: "a",
                value: 1,
                expiration: TimeSpan.fromMilliseconds(25).toEndDate(),
            };
            await adapter.upsert(data1);
            const data2: ICacheInsert = {
                key: "b",
                value: 2,
                expiration: TimeSpan.fromMilliseconds(50).toEndDate(),
            };
            const prevData = await adapter.upsert(data2);
            expect(prevData).toEqual(data1);
        });
        test("Should persist insertion when key doesnt exist", async () => {
            const insert: ICacheInsert = {
                key: "a",
                value: 1,
                expiration: TimeSpan.fromMilliseconds(25).toEndDate(),
            };
            await adapter.upsert(insert);
            const findData = await adapter.find(insert.key);
            expect(findData).toEqual(insert);
        });
        test("Should persist update when key exist", async () => {
            const data1: ICacheInsert = {
                key: "a",
                value: 1,
                expiration: TimeSpan.fromMilliseconds(25).toEndDate(),
            };
            await adapter.upsert(data1);
            const data2: ICacheInsert = {
                key: "b",
                value: 2,
                expiration: TimeSpan.fromMilliseconds(50).toEndDate(),
            };
            await adapter.upsert(data2);
            const findData = await adapter.find(data2.key);
            expect(findData).toEqual(data2);
        });
    });
    describe("method: updateExpired", () => {
        test.todo("Should not persist update when key has no expiration");
        test.todo(
            "Should not persist update when key has expiration but not expired",
        );
        test.todo("Should persist update when key has expiration and expired");
    });
    describe("method: updateUnexpired", () => {
        test.todo("Should persist update when key has no expiration");
        test.todo(
            "Should persist update when key has expiration but not expired",
        );
        test.todo(
            "Should not persist update when key has expiration and expired",
        );
    });
    describe("method: incrementUnexpired", () => {
        test.todo("Should persist update when key has no expiration");
        test.todo(
            "Should persist update when key has expiration but not expired",
        );
        test.todo(
            "Should not persist update when key has expiration and expired",
        );
    });
    describe("method: removeExpiredMany", () => {
        test.todo("Should not persist removal when key has no expiration");
        test.todo(
            "Should not persist removal when key has expiration but not expired",
        );
        test.todo("Should persist removal when key has expiration and expired");
    });
    describe("method: removeUnexpiredMany", () => {
        test.todo("Should persist removal when key has no expiration");
        test.todo(
            "Should persist removal when key has expiration but not expired",
        );
        test.todo(
            "Should not persist removal when key has expiration and expired",
        );
    });
    describe("method: removeByKeyPrefix", () => {
        test("Should remove the keys that mathc the prefix", async () => {
            await adapter.insert({
                key: "a/1",
                value: 1,
                expiration: null,
            });
            await adapter.insert({
                key: "a/2",
                value: 2,
                expiration: null,
            });
            await adapter.insert({
                key: "b/1",
                value: 1,
                expiration: null,
            });
            await adapter.insert({
                key: "b/2",
                value: 2,
                expiration: null,
            });

            await adapter.removeByKeyPrefix("a");

            const result = [
                await adapter.find("a/1"),
                await adapter.find("a/2"),
                await adapter.find("b/1"),
                await adapter.find("b/2"),
            ];
            expect(result).toEqual([null, null, 1, 2]);
        });
    });
}
