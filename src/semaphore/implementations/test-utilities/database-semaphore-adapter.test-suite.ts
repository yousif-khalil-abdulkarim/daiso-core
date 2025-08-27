/**
 * @module Semaphore
 */
import {
    type TestAPI,
    type SuiteAPI,
    type ExpectStatic,
    type beforeEach,
} from "vitest";
import {
    type IDatabaseSemaphoreAdapter,
    type ISemaphoreData,
    type ISemaphoreSlotData,
    type ISemaphoreSlotExpirationData,
} from "@/semaphore/contracts/_module-exports.js";
import type { Promisable } from "@/utilities/_module-exports.js";
import { TimeSpan } from "@/utilities/_module-exports.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/test-utilities"`
 * @group Utilities
 */
export type DatabaseSemaphoreAdapterTestSuiteSettings = {
    expect: ExpectStatic;
    test: TestAPI;
    describe: SuiteAPI;
    beforeEach: typeof beforeEach;
    createAdapter: () => Promisable<IDatabaseSemaphoreAdapter>;
};

/**
 * The `databaseSemaphoreAdapterTestSuite` function simplifies the process of testing your custom implementation of {@link IDatabaseSemaphoreAdapter | `IDatabaseSemaphoreAdapter`} with `vitest`.
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/test-utilities"`
 * @group Utilities
 * @example
 * ```ts
 * import { afterEach, beforeEach, describe, expect, test } from "vitest";
 * import { databaseSemaphoreAdapterTestSuite } from "@daiso-tech/core/semaphore/test-utilities";
 * import { LibsqlSemaphoreAdapter } from "@daiso-tech/core/semaphore/adapters";
 * import { type Client, createClient } from "@libsql/client";
 *
 * describe("class: LibsqlSemaphoreAdapter", () => {
 *     let client: Client;
 *     beforeEach(() => {
 *         client = createClient({
 *             url: ":memory:",
 *         });
 *     });
 *     afterEach(() => {
 *         client.close();
 *     });
 *     databaseSemaphoreAdapterTestSuite({
 *         createAdapter: async () => {
 *             const semaphoreAdapter = new LibsqlSemaphoreAdapter({
 *                database: client,
 *                 tableName: "custom_table",
 *                 shouldRemoveExpiredKeys: false,
 *             });
 *             await semaphoreAdapter.init();
 *             return semaphoreAdapter;
 *         },
 *         test,
 *         beforeEach,
 *         expect,
 *         describe,
 *     });
 * });
 * ```
 */
export function databaseSemaphoreAdapterTestSuite(
    settings: DatabaseSemaphoreAdapterTestSuiteSettings,
): void {
    const { expect, test, createAdapter, describe, beforeEach } = settings;
    let adapter: IDatabaseSemaphoreAdapter;
    beforeEach(async () => {
        adapter = await createAdapter();
    });
    describe("method: transaction findSemaphore", () => {
        test("Should return null when key doesnt exists", async () => {
            const key = "a";
            const limit = 2;
            await adapter.transaction(async (trx) => {
                await trx.upsertSemaphore(key, limit);
            });

            const noneExistingKey = "b";
            const result = await adapter.transaction(async (trx) => {
                return await trx.findSemaphore(noneExistingKey);
            });

            expect(result).toBeNull();
        });
        test("Should return ISemaphoreData when key exists", async () => {
            const key = "a";
            const limit = 2;
            await adapter.transaction(async (trx) => {
                await trx.upsertSemaphore(key, limit);
            });

            const result = await adapter.transaction(async (trx) => {
                return await trx.findSemaphore(key);
            });

            expect(result).toEqual({ limit } satisfies ISemaphoreData);
        });
    });
    describe("method: transaction findSlots", () => {
        test("Should return empty array when key doesnt exists", async () => {
            const key = "a";
            const limit = 2;
            await adapter.transaction(async (trx) => {
                await trx.upsertSemaphore(key, limit);
            });

            const noneExistingKey = "b";
            const result = await adapter.transaction(async (trx) => {
                return await trx.findSlots(noneExistingKey);
            });

            expect(result).toEqual([]);
        });
        test("Should return empty array when key exists and has no slots", async () => {
            const key = "a";
            const limit = 2;
            await adapter.transaction(async (trx) => {
                await trx.upsertSemaphore(key, limit);
            });

            const result = await adapter.transaction(async (trx) => {
                return await trx.findSlots(key);
            });

            expect(result).toEqual([]);
        });
        test("Should not return empty array when key exists and has no slots", async () => {
            const key = "a";
            const limit = 2;
            await adapter.transaction(async (trx) => {
                await trx.upsertSemaphore(key, limit);
            });
            const slotId1 = "1";
            const expiration1 = null;
            await adapter.transaction(async (trx) => {
                await trx.upsertSlot(key, slotId1, expiration1);
            });
            const slotId2 = "2";
            const expiration2 = null;
            await adapter.transaction(async (trx) => {
                await trx.upsertSlot(key, slotId2, expiration2);
            });

            const result = await adapter.transaction(async (trx) => {
                return await trx.findSlots(key);
            });

            expect(result).toEqual([
                {
                    id: slotId1,
                    expiration: expiration1,
                },
                {
                    id: slotId2,
                    expiration: expiration2,
                },
            ] as ISemaphoreSlotData[]);
        });
    });
    describe("method: transaction upsertSemaphore", () => {
        test("Should insert when key doesnt exists exists", async () => {
            const key = "a";
            const limit = 2;

            await adapter.transaction(async (trx) => {
                await trx.upsertSemaphore(key, limit);
            });

            const result = await adapter.transaction(async (trx) => {
                return await trx.findSemaphore(key);
            });
            expect(result).toEqual({ limit } satisfies ISemaphoreData);
        });
        test("Should update when key exists exists", async () => {
            const key = "a";
            const limit = 2;
            await adapter.transaction(async (trx) => {
                await trx.upsertSemaphore(key, limit);
            });

            const newLimit = 4;
            await adapter.transaction(async (trx) => {
                await trx.upsertSemaphore(key, newLimit);
            });

            const result = await adapter.transaction(async (trx) => {
                return await trx.findSemaphore(key);
            });
            expect(result).toEqual({
                limit: newLimit,
            } satisfies ISemaphoreData);
        });
    });
    describe("method: transaction upsertSlot", () => {
        test("Should insert when key doesnt exists exists", async () => {
            const key = "a";
            const limit = 2;
            await adapter.transaction(async (trx) => {
                await trx.upsertSemaphore(key, limit);
            });

            const slotId = "a";
            const expiration = null;
            await adapter.transaction(async (trx) => {
                await trx.upsertSlot(key, slotId, expiration);
            });

            const slot = await adapter.transaction(async (trx) => {
                const slots = await trx.findSlots(key);
                return slots.find((slot) => slot.id === slotId);
            });
            expect(slot).toEqual({
                expiration,
                id: slotId,
            } satisfies ISemaphoreSlotData);
        });
        test("Should update when key exists exists", async () => {
            const key = "a";
            const limit = 2;
            await adapter.transaction(async (trx) => {
                await trx.upsertSemaphore(key, limit);
            });

            const slotId1 = "1";
            const expiration1 = null;
            await adapter.transaction(async (trx) => {
                await trx.upsertSlot(key, slotId1, expiration1);
            });

            const slotId2 = "2";
            const expiration2 = TimeSpan.fromMilliseconds(100).toEndDate();
            await adapter.transaction(async (trx) => {
                await trx.upsertSlot(key, slotId2, expiration2);
            });

            const slot = await adapter.transaction(async (trx) => {
                const slots = await trx.findSlots(key);
                return slots.find((slot) => slot.id === slotId2);
            });
            expect(slot).toEqual({
                expiration: expiration2,
                id: slotId2,
            } satisfies ISemaphoreSlotData);
        });
    });
    describe("method: removeSlot", () => {
        test("Should return null when key doesnt exists", async () => {
            const key = "a";
            const slotId = "b";
            const limit = 2;
            const expiration = null;
            await adapter.transaction(async (trx) => {
                await trx.upsertSemaphore(key, limit);
            });
            await adapter.transaction(async (trx) => {
                await trx.upsertSlot(key, slotId, expiration);
            });

            const noneExistingKey = "c";
            const result = await adapter.removeSlot(noneExistingKey, slotId);

            expect(result).toBeNull();
        });
        test("Should return null when slotId doesnt exists", async () => {
            const key = "a";
            const slotId = "b";
            const limit = 2;
            const expiration = null;
            await adapter.transaction(async (trx) => {
                await trx.upsertSemaphore(key, limit);
            });
            await adapter.transaction(async (trx) => {
                await trx.upsertSlot(key, slotId, expiration);
            });

            const noneExistingSlotId = "c";
            const result = await adapter.removeSlot(key, noneExistingSlotId);

            expect(result).toBeNull();
        });
        test("Should return expiration as null when key and slotId exists", async () => {
            const key = "a";
            const slotId = "b";
            const limit = 2;
            const expiration = null;
            await adapter.transaction(async (trx) => {
                await trx.upsertSemaphore(key, limit);
            });
            await adapter.transaction(async (trx) => {
                await trx.upsertSlot(key, slotId, expiration);
            });

            const result = await adapter.removeSlot(key, slotId);

            expect(result).toEqual({
                expiration,
            } satisfies ISemaphoreSlotExpirationData);
        });
        test("Should return expiration as date when key and slotId exists", async () => {
            const key = "a";
            const slotId = "b";
            const limit = 2;
            const expiration = TimeSpan.fromMilliseconds(100).toEndDate();
            await adapter.transaction(async (trx) => {
                await trx.upsertSemaphore(key, limit);
            });
            await adapter.transaction(async (trx) => {
                await trx.upsertSlot(key, slotId, expiration);
            });

            const result = await adapter.removeSlot(key, slotId);

            expect(result).toEqual({
                expiration,
            } satisfies ISemaphoreSlotExpirationData);
        });
        test("Should remove slot when key and slotId exists", async () => {
            const key = "a";
            const slotId = "b";
            const limit = 2;
            const expiration = null;
            await adapter.transaction(async (trx) => {
                await trx.upsertSemaphore(key, limit);
            });
            await adapter.transaction(async (trx) => {
                await trx.upsertSlot(key, slotId, expiration);
            });

            await adapter.removeSlot(key, slotId);

            const slot = await adapter.transaction(async (trx) => {
                const slots = await trx.findSlots(key);
                return slots.find((slot) => slot.id === slotId);
            });
            expect(slot).toBeUndefined();
        });
    });
    describe("method: removeAllSlots", () => {
        test("Should return empty array when key doesnt exists", async () => {
            const key = "a";
            const slotId = "b";
            const limit = 2;
            const expiration = null;
            await adapter.transaction(async (trx) => {
                await trx.upsertSemaphore(key, limit);
            });
            await adapter.transaction(async (trx) => {
                await trx.upsertSlot(key, slotId, expiration);
            });

            const noneExistingKey = "c";
            const result = await adapter.removeAllSlots(noneExistingKey);

            expect(result).toEqual([]);
        });
        test("Should return empty array when key exists and has no slots", async () => {
            const key = "a";
            const limit = 2;
            await adapter.transaction(async (trx) => {
                await trx.upsertSemaphore(key, limit);
            });

            const result = await adapter.removeAllSlots(key);

            expect(result).toEqual([]);
        });
        test("Should return array with 2 items when key exists and has slots", async () => {
            const key = "a";
            const limit = 2;
            await adapter.transaction(async (trx) => {
                await trx.upsertSemaphore(key, limit);
            });
            const slotId1 = "b";
            const expiration1 = null;
            await adapter.transaction(async (trx) => {
                await trx.upsertSlot(key, slotId1, expiration1);
            });
            const slotId2 = "c";
            const expiration2 = TimeSpan.fromMilliseconds(10).toEndDate();
            await adapter.transaction(async (trx) => {
                await trx.upsertSlot(key, slotId2, expiration2);
            });

            const result = await adapter.removeAllSlots(key);

            expect(result).toEqual([
                {
                    expiration: expiration1,
                },
                {
                    expiration: expiration2,
                },
            ] as ISemaphoreSlotExpirationData[]);
        });
        test("Should remove all items when key exists and has slots", async () => {
            const key = "a";
            const limit = 2;
            await adapter.transaction(async (trx) => {
                await trx.upsertSemaphore(key, limit);
            });
            const slotId1 = "b";
            const expiration1 = null;
            await adapter.transaction(async (trx) => {
                await trx.upsertSlot(key, slotId1, expiration1);
            });
            const slotId2 = "c";
            const expiration2 = TimeSpan.fromMilliseconds(10).toEndDate();
            await adapter.transaction(async (trx) => {
                await trx.upsertSlot(key, slotId2, expiration2);
            });

            await adapter.removeAllSlots(key);

            const slots = await adapter.transaction(async (trx) => {
                return await trx.findSlots(key);
            });
            expect(slots).toEqual([]);
        });
    });
    describe("method: updateExpiration", () => {
        test("Should return 0 when semaphore key doesnt exists", async () => {
            const key = "a";
            const limit = 2;
            await adapter.transaction(async (trx) => {
                await trx.upsertSemaphore(key, limit);
            });

            const slotId1 = "1";
            const expiration = TimeSpan.fromMilliseconds(50).toEndDate();
            await adapter.transaction(async (trx) => {
                await trx.upsertSlot(key, slotId1, expiration);
            });

            const newExpiration = TimeSpan.fromMilliseconds(100).toEndDate();
            const noneExistingKey = "b";
            const result1 = await adapter.updateExpiration(
                noneExistingKey,
                slotId1,
                newExpiration,
            );

            expect(result1).toBe(0);
        });
        test("Should return 0 when slot doesnt exists", async () => {
            const key = "a";
            const limit = 2;
            await adapter.transaction(async (trx) => {
                await trx.upsertSemaphore(key, limit);
            });

            const slotId1 = "1";
            const expiration = TimeSpan.fromMilliseconds(50).toEndDate();
            await adapter.transaction(async (trx) => {
                await trx.upsertSlot(key, slotId1, expiration);
            });

            const newExpiration = TimeSpan.fromMilliseconds(100).toEndDate();
            const noneExistingSlotId = "b";
            const result1 = await adapter.updateExpiration(
                key,
                noneExistingSlotId,
                newExpiration,
            );

            expect(result1).toBe(0);
        });
        test("Should return 0 when slot is expired", async () => {
            const key = "a";
            const limit = 2;
            await adapter.transaction(async (trx) => {
                await trx.upsertSemaphore(key, limit);
            });

            const slotId1 = "1";
            const expiration = TimeSpan.fromMilliseconds(50).toStartDate();
            await adapter.transaction(async (trx) => {
                await trx.upsertSlot(key, slotId1, expiration);
            });

            const newExpiration = TimeSpan.fromMilliseconds(100).toEndDate();
            const result1 = await adapter.updateExpiration(
                key,
                slotId1,
                newExpiration,
            );

            expect(result1).toBe(0);
        });
        test("Should return 0 when slot is unexpireable", async () => {
            const key = "a";
            const limit = 2;
            await adapter.transaction(async (trx) => {
                await trx.upsertSemaphore(key, limit);
            });

            const slotId1 = "1";
            const expiration = null;
            await adapter.transaction(async (trx) => {
                await trx.upsertSlot(key, slotId1, expiration);
            });

            const newExpiration = TimeSpan.fromMilliseconds(100).toEndDate();
            const result1 = await adapter.updateExpiration(
                key,
                slotId1,
                newExpiration,
            );

            expect(result1).toBe(0);
        });
        test("Should return number greater than 0 when slot is unexpired", async () => {
            const key = "a";
            const limit = 2;
            await adapter.transaction(async (trx) => {
                await trx.upsertSemaphore(key, limit);
            });

            const slotId1 = "1";
            const expiration = TimeSpan.fromMilliseconds(50);
            await adapter.transaction(async (trx) => {
                await trx.upsertSlot(key, slotId1, expiration.toEndDate());
            });

            const newExpiration = TimeSpan.fromMilliseconds(100);
            const result1 = await adapter.updateExpiration(
                key,
                slotId1,
                newExpiration.toEndDate(),
            );

            expect(result1).toBeGreaterThan(0);
        });
        test("Should not update expiration when slot is expired", async () => {
            const key = "a";
            const limit = 2;
            await adapter.transaction(async (trx) => {
                await trx.upsertSemaphore(key, limit);
            });

            const slotId1 = "1";
            const expiration = TimeSpan.fromMilliseconds(50).toStartDate();
            await adapter.transaction(async (trx) => {
                await trx.upsertSlot(key, slotId1, expiration);
            });

            const newExpiration = TimeSpan.fromMilliseconds(100).toEndDate();
            await adapter.updateExpiration(key, slotId1, newExpiration);

            const slot = await adapter.transaction(async (trx) => {
                const slots = await trx.findSlots(key);
                return slots.find((slot) => slot.id === slotId1);
            });
            expect(slot).toEqual({
                id: slotId1,
                expiration,
            } satisfies ISemaphoreSlotData);
        });
        test("Should not update expiration when slot is unexpireable", async () => {
            const key = "a";
            const limit = 2;
            await adapter.transaction(async (trx) => {
                await trx.upsertSemaphore(key, limit);
            });

            const slotId1 = "1";
            const expiration = null;
            await adapter.transaction(async (trx) => {
                await trx.upsertSlot(key, slotId1, expiration);
            });

            const newExpiration = TimeSpan.fromMilliseconds(100).toEndDate();
            await adapter.updateExpiration(key, slotId1, newExpiration);

            const slot = await adapter.transaction(async (trx) => {
                const slots = await trx.findSlots(key);
                return slots.find((slot) => slot.id === slotId1);
            });
            expect(slot).toEqual({
                id: slotId1,
                expiration,
            } satisfies ISemaphoreSlotData);
        });
        test("Should update expiration when slot is unexpired", async () => {
            const key = "a";
            const limit = 2;
            await adapter.transaction(async (trx) => {
                await trx.upsertSemaphore(key, limit);
            });

            const slotId1 = "1";
            const expiration = TimeSpan.fromMilliseconds(50).toEndDate();
            await adapter.transaction(async (trx) => {
                await trx.upsertSlot(key, slotId1, expiration);
            });

            const newExpiration = TimeSpan.fromMilliseconds(100).toEndDate();
            await adapter.updateExpiration(key, slotId1, newExpiration);

            const slot = await adapter.transaction(async (trx) => {
                const slots = await trx.findSlots(key);
                return slots.find((slot) => slot.id === slotId1);
            });
            expect(slot).toEqual({
                id: slotId1,
                expiration: newExpiration,
            } satisfies ISemaphoreSlotData);
        });
    });
}
