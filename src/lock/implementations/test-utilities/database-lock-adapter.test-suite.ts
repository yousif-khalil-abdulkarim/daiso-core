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
import { type IDatabaseLockAdapter } from "@/lock/contracts/_module-exports.js";
import { type Promisable } from "@/utilities/_module-exports.js";
import { TimeSpan } from "@/utilities/_module-exports.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/test-utilities"```
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
 * The <i>databaseLockAdapterTestSuite</i> function simplifies the process of testing your custom implementation of <i>{@link IDatabaseLockAdapter}</i> with <i>vitest</i>.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/test-utilities"```
 * @group Utilities
 * @example
 * ```ts
 * import { afterEach, beforeEach, describe, expect, test } from "vitest";
 * import { databaseLockAdapterTestSuite } from "@@daiso-tech/core/lock/test-utilities";
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
 *
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

    const ttl = TimeSpan.fromMilliseconds(50);
    describe("method: insert", () => {
        test("Should insert lock when not existing", async () => {
            const key = "a";
            const owner = "b";
            const expiration = null;

            await adapter.insert(key, owner, expiration);

            const result = await adapter.find(key);
            expect(result).toEqual({
                owner,
                expiration,
            });
        });
        test("Should insert lock with expiration when not existing", async () => {
            const key = "a";
            const owner = "b";
            const expiration = ttl.toEndDate();

            await adapter.insert(key, owner, expiration);

            const result = await adapter.find(key);
            expect(result).toEqual({
                owner,
                expiration,
            });
        });
        test("Should throw error when lock already existing", async () => {
            const key = "a";
            const owner = "b";
            const expiration = null;

            await adapter.insert(key, owner, expiration);

            const result = adapter.insert(key, owner, expiration);
            await expect(result).rejects.toBeDefined();
        });
    });
    describe("method: update", () => {
        test("Should return false when lock has no expiration", async () => {
            const key = "a";
            const owner1 = "b";
            const expiration = null;
            await adapter.insert(key, owner1, expiration);

            const owner2 = "c";
            const result = await adapter.update(key, owner2, expiration);

            expect(result).toBe(0);
        });
        test("Should not update when lock has no expiration", async () => {
            const key = "a";
            const owner1 = "b";
            const expiration = null;
            await adapter.insert(key, owner1, expiration);

            const owner2 = "c";
            await adapter.update(key, owner2, expiration);

            const result = await adapter.find(key);
            expect(result).toEqual({
                owner: owner1,
                expiration,
            });
        });
        test("Should return false when lock has not expired", async () => {
            vi.useFakeTimers();
            const key = "a";
            const owner1 = "b";
            const expiration1 = ttl.toEndDate();
            await adapter.insert(key, owner1, expiration1);
            vi.advanceTimersByTime(ttl.divide(2).toMilliseconds());

            const owner2 = "c";
            const expiration2 = ttl.addMilliseconds(25).toEndDate();
            const result = await adapter.update(key, owner2, expiration2);

            expect(result).toBe(0);
            vi.useRealTimers();
        });
        test("Should not update when lock has not expired", async () => {
            vi.useFakeTimers();
            const key = "a";
            const owner1 = "b";
            const expiration1 = ttl.toEndDate();
            await adapter.insert(key, owner1, expiration1);
            vi.advanceTimersByTime(ttl.divide(2).toMilliseconds());

            const owner2 = "c";
            const expiration2 = ttl.addMilliseconds(25).toEndDate();
            await adapter.update(key, owner2, expiration2);

            const result = await adapter.find(key);
            expect(result).toEqual({
                owner: owner1,
                expiration: expiration1,
            });
            vi.useRealTimers();
        });
        test("Should return true when lock has expired", async () => {
            vi.useFakeTimers();
            const key = "a";
            const owner1 = "b";
            const expiration1 = ttl.toEndDate();
            await adapter.insert(key, owner1, expiration1);
            vi.advanceTimersByTime(ttl.addMilliseconds(1).toMilliseconds());

            const owner2 = "c";
            const expiration2 = ttl.addMilliseconds(25).toEndDate();
            const result = await adapter.update(key, owner2, expiration2);

            expect(result).toBe(1);
            vi.useRealTimers();
        });
        test("Should update when lock has expired", async () => {
            vi.useFakeTimers();
            const key = "a";
            const owner1 = "b";
            const expiration1 = ttl.toEndDate();
            await adapter.insert(key, owner1, expiration1);
            vi.advanceTimersByTime(ttl.addMilliseconds(1).toMilliseconds());

            const owner2 = "c";
            const expiration2 = ttl.addMilliseconds(25).toEndDate();
            await adapter.update(key, owner2, expiration2);

            const result = await adapter.find(key);
            expect(result).toEqual({
                owner: owner2,
                expiration: expiration2,
            });
            vi.useRealTimers();
        });
    });
    describe("method: remove", () => {
        test("Should not remove lock when not same owner", async () => {
            const key = "a";
            const owner1 = "b";
            const expiration = null;
            await adapter.insert(key, owner1, expiration);

            const owner2 = "c";
            await adapter.remove(key, owner2);

            const result = await adapter.find(key);
            expect(result).toEqual({
                owner: owner1,
                expiration,
            });
        });
        test("Should remove lock when same owner", async () => {
            const key = "a";
            const owner = "b";
            const expiration = null;
            await adapter.insert(key, owner, expiration);

            await adapter.remove(key, owner);

            const result = await adapter.find(key);
            expect(result).toBeNull();
        });
        test("Should remove lock when given null as owner", async () => {
            const key = "a";
            const owner = "b";
            const expiration = null;
            await adapter.insert(key, owner, expiration);

            await adapter.remove(key, null);

            const result = await adapter.find(key);
            expect(result).toBeNull();
        });
    });
    describe("method: refresh", () => {
        test("Should return false when not same owner", async () => {
            const key = "a";
            const owner1 = "b";
            const expiration1 = ttl.toEndDate();
            await adapter.insert(key, owner1, expiration1);

            const expiration2 = ttl.multiply(2).toEndDate();
            const owner2 = "c";
            const result = await adapter.refresh(key, owner2, expiration2);

            expect(result).toBe(0);
        });
        test("Should not update lock when not same owner", async () => {
            const key = "a";
            const owner1 = "b";
            const expiration1 = ttl.toEndDate();
            await adapter.insert(key, owner1, expiration1);

            const expiration2 = ttl.multiply(2).toEndDate();
            const owner2 = "c";
            await adapter.refresh(key, owner2, expiration2);

            const result = await adapter.find(key);
            expect(result).toEqual({
                owner: owner1,
                expiration: expiration1,
            });
        });
        test("Should return true when same owner", async () => {
            const key = "a";
            const owner = "b";
            const expiration1 = ttl.toEndDate();
            await adapter.insert(key, owner, expiration1);

            const expiration2 = ttl.multiply(2).toEndDate();
            const result = await adapter.refresh(key, owner, expiration2);

            expect(result).toBe(1);
        });
        test("Should update lock when same owner", async () => {
            const key = "a";
            const owner = "b";
            const expiration1 = ttl.toEndDate();
            await adapter.insert(key, owner, expiration1);

            const expiration2 = ttl.multiply(2).toEndDate();
            await adapter.refresh(key, owner, expiration2);

            const result = await adapter.find(key);
            expect(result).toEqual({
                owner,
                expiration: expiration2,
            });
        });
    });
}
