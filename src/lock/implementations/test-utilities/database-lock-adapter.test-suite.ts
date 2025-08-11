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
    type IDatabaseLockAdapter,
    type ILockData,
} from "@/lock/contracts/_module-exports.js";
import { TimeSpan, type Promisable } from "@/utilities/_module-exports.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/test-utilities"`
 * @group Utilities
 */
export type DatabaseLockAdapterTestSuiteSettings = {
    expect: ExpectStatic;
    test: TestAPI;
    describe: SuiteAPI;
    beforeEach: typeof beforeEach;
    createAdapter: () => Promisable<IDatabaseLockAdapter>;
};

/**
 * The `databaseLockAdapterTestSuite` function simplifies the process of testing your custom implementation of {@link IDatabaseLockAdapter | `IDatabaseLockAdapter`} with `vitest`.
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/test-utilities"`
 * @group Utilities
 * @example
 * ```ts
 * import { afterEach, beforeEach, describe, expect, test } from "vitest";
 * import { databaseLockAdapterTestSuite } from "@daiso-tech/core/lock/test-utilities";
 * import { LibsqlLockAdapter } from "@daiso-tech/core/lock/adapters";
 * import { type Client, createClient } from "@libsql/client";
 *
 * describe("class: LibsqlLockAdapter", () => {
 *     let client: Client;
 *     beforeEach(() => {
 *         client = createClient({
 *             url: ":memory:",
 *         });
 *     });
 *     afterEach(() => {
 *         client.close();
 *     });
 *     databaseLockAdapterTestSuite({
 *         createAdapter: async () => {
 *             const lockAdapter = new LibsqlLockAdapter({
 *                database: client,
 *                 tableName: "custom_table",
 *                 shouldRemoveExpiredKeys: false,
 *             });
 *             await lockAdapter.init();
 *             return lockAdapter;
 *         },
 *         test,
 *         beforeEach,
 *         expect,
 *         describe,
 *     });
 * });
 * ```
 */
export function databaseLockAdapterTestSuite(
    settings: DatabaseLockAdapterTestSuiteSettings,
): void {
    const { expect, test, createAdapter, describe, beforeEach } = settings;

    let adapter: IDatabaseLockAdapter;
    beforeEach(async () => {
        adapter = await createAdapter();
    });

    describe("method: insert", () => {
        test("Should insert when key doesnt exists", async () => {
            const key = "key";
            const owner = "a";
            const expiration = new Date("2025");
            await adapter.insert(key, owner, expiration);

            expect(await adapter.find(key)).toEqual({
                owner,
                expiration,
            } satisfies ILockData);
        });
        test("Should throw error when key already exsists", async () => {
            const key = "key";
            const owner = "a";
            const expiration = new Date("2025");
            await adapter.insert(key, owner, expiration);

            const promise = adapter.insert(key, owner, expiration);

            await expect(promise).rejects.toBeDefined();
        });
    });
    describe("method: updateIfExpired", () => {
        test("Should return 0 when key doesnt exists", async () => {
            const noneExistingKey = "key";
            const noneExistingOwner = "b";
            const expiration = TimeSpan.fromMinutes(4).toStartDate();

            const result = await adapter.updateIfExpired(
                noneExistingKey,
                noneExistingOwner,
                expiration,
            );

            expect(result).toBe(0);
        });
        test("Should number greater than 0 when key is expired", async () => {
            const key = "key";
            const ownerA = "a";
            const expirationA = TimeSpan.fromMinutes(2).toStartDate();
            await adapter.insert(key, ownerA, expirationA);

            const ownerB = "b";
            const expirationB = TimeSpan.fromMinutes(2).toEndDate();
            const result = await adapter.updateIfExpired(
                key,
                ownerB,
                expirationB,
            );

            expect(result).toBeGreaterThan(0);
        });
        test("Should not update expiration when key is unexpired", async () => {
            const key = "key";
            const ownerA = "a";
            const expirationA = TimeSpan.fromMinutes(2).toEndDate();
            await adapter.insert(key, ownerA, expirationA);

            const ownerB = "b";
            const expirationB = TimeSpan.fromMinutes(3).toEndDate();
            await adapter.updateIfExpired(key, ownerB, expirationB);

            const lockData = await adapter.find(key);
            expect(lockData).toEqual({
                owner: ownerA,
                expiration: expirationA,
            } satisfies ILockData);
        });
        test("Should return 0 when key is unexpired", async () => {
            const key = "key";
            const ownerA = "a";
            const expirationA = TimeSpan.fromMinutes(2).toEndDate();
            await adapter.insert(key, ownerA, expirationA);

            const ownerB = "b";
            const expirationB = TimeSpan.fromMinutes(3).toEndDate();
            const result = await adapter.updateIfExpired(
                key,
                ownerB,
                expirationB,
            );

            expect(result).toBe(0);
        });
        test("Should not update expiration when key is uenxpireable", async () => {
            const key = "key";
            const ownerA = "a";
            const expirationA = null;
            await adapter.insert(key, ownerA, expirationA);

            const ownerB = "b";
            const expirationB = TimeSpan.fromMinutes(3).toEndDate();
            await adapter.updateIfExpired(key, ownerB, expirationB);

            const lockData = await adapter.find(key);
            expect(lockData).toEqual({
                owner: ownerA,
                expiration: expirationA,
            } satisfies ILockData);
        });
        test("Should return 0 when key is uenxpireable", async () => {
            const key = "key";
            const ownerA = "a";
            const expirationA = null;
            await adapter.insert(key, ownerA, expirationA);

            const ownerB = "b";
            const expirationB = TimeSpan.fromMinutes(3).toEndDate();
            const result = await adapter.updateIfExpired(
                key,
                ownerB,
                expirationB,
            );

            expect(result).toBe(0);
        });
    });
    describe("method: remove", () => {
        test("Should remove key", async () => {
            const key = "key";
            const owner = "a";
            const expiration = new Date("2025");
            expiration.setMinutes(expiration.getMinutes() + 2);
            await adapter.insert(key, owner, expiration);

            await adapter.remove(key);

            expect(await adapter.find(key)).toBeNull();
        });
    });
    describe("method: removeIfOwner", () => {
        test("Should return null when key deosnt exists", async () => {
            const noneExsistingKey = "key";
            const noneExsistingOwner = "b";

            const lockExpirationData = await adapter.removeIfOwner(
                noneExsistingKey,
                noneExsistingOwner,
            );

            expect(lockExpirationData).toBeNull();
        });
        test("Should return ILockData when key exists and owner match", async () => {
            const key = "key";
            const owner = "a";
            const expiration = new Date("2025");
            await adapter.insert(key, owner, expiration);

            const lockExpirationData = await adapter.removeIfOwner(key, owner);

            expect(lockExpirationData).toEqual({
                expiration,
                owner,
            } satisfies ILockData);
        });
        test("Should remove when key exists and owner match", async () => {
            const key = "key";
            const owner = "a";
            const expiration = new Date("2025");
            await adapter.insert(key, owner, expiration);

            await adapter.removeIfOwner(key, owner);

            expect(await adapter.find(key)).toBeNull();
        });
        test("Should return null when key exists and owner doesnt match", async () => {
            const key = "key";
            const owner = "a";
            const expiration = new Date("2025");
            await adapter.insert(key, owner, expiration);

            const noneExsistingOwner = "b";
            const lockExpirationData = await adapter.removeIfOwner(
                key,
                noneExsistingOwner,
            );

            expect(lockExpirationData).toBeNull();
        });
        test("Should not remove when key exists and owner doesnt match", async () => {
            const key = "key";
            const owner = "a";
            const expiration = new Date("2025");
            await adapter.insert(key, owner, expiration);

            const noneExsistingOwner = "b";
            await adapter.removeIfOwner(key, noneExsistingOwner);

            expect(await adapter.find(key)).toEqual({
                owner,
                expiration,
            } satisfies ILockData);
        });
    });
    describe("method: updateExpirationIfOwner", () => {
        test("Should return 0 when key doesnt exists", async () => {
            const newExpiration = new Date("2025");
            const noneExsistingKey = "key";
            const owner = "b";
            const result = await adapter.updateExpirationIfOwner(
                noneExsistingKey,
                owner,
                newExpiration,
            );

            expect(result).toBe(0);
        });
        test("should return 0 when when owner doesnt match", async () => {
            const key = "key";
            const ownerA = "a";
            const expiration = new Date("2024");
            await adapter.insert(key, ownerA, expiration);

            const newExpiration = new Date("2025");
            const ownerB = "b";
            const result = await adapter.updateExpirationIfOwner(
                key,
                ownerB,
                newExpiration,
            );

            expect(result).toBe(0);
        });
        test("Should not update expiration when owner doesnt match", async () => {
            const key = "key";
            const ownerA = "a";
            const expiration = new Date("2024");
            await adapter.insert(key, ownerA, expiration);

            const newExpiration = new Date("2025");
            const ownerB = "b";
            await adapter.updateExpirationIfOwner(key, ownerB, newExpiration);

            expect(await adapter.find(key)).toEqual({
                expiration,
                owner: ownerA,
            } satisfies ILockData);
        });
        test("Should return number greather than 0 when owner match", async () => {
            const key = "key";
            const owner = "a";
            const expiration = new Date("2024");
            await adapter.insert(key, owner, expiration);

            const newExpiration = new Date("2025");
            const result = await adapter.updateExpirationIfOwner(
                key,
                owner,
                newExpiration,
            );

            expect(result).toBeGreaterThan(0);
        });
        test("Should update expiration when owner match", async () => {
            const key = "key";
            const owner = "a";
            const expiration = new Date("2024");
            await adapter.insert(key, owner, expiration);

            const newExpiration = new Date("2025");
            await adapter.updateExpirationIfOwner(key, owner, newExpiration);

            expect(await adapter.find(key)).toEqual({
                expiration: newExpiration,
                owner,
            } satisfies ILockData);
        });
    });
    describe("method: find", () => {
        test("Should return null when key doesnt exists", async () => {
            const noneExsistingKey = "key";
            const lockData = await adapter.find(noneExsistingKey);
            expect(lockData).toBeNull();
        });
        test("Should return ILockData when key exists", async () => {
            const key = "key";
            const owner = "a";
            const expiration = new Date();
            await adapter.insert(key, owner, expiration);

            const lockData = await adapter.find(key);
            expect(lockData).toEqual({
                owner,
                expiration,
            } satisfies ILockData);
        });
    });
}
