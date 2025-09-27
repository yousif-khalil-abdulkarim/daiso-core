import type {
    IDatabaseSemaphoreAdapter,
    IDatabaseSemaphoreTransaction,
    ISemaphoreSlotExpirationData,
    ISemaphoreAdapter,
    ISemaphoreAdapterState,
    SemaphoreAcquireSettings,
} from "@/semaphore/contracts/_module-exports.js";
import { describe, expect, test } from "vitest";
import { isDatabaseSemaphoreAdapter } from "@/semaphore/implementations/derivables/semaphore-provider/is-database-semaphore-adapter.js";
import type { InvokableFn } from "@/utilities/_module-exports.js";
import type { TimeSpan } from "@/time-span/implementations/_module-exports.js";

describe("function: isDatabaseSemaphoreAdapter", () => {
    test("Should return true when given IDatabaseSemaphoreAdapter", () => {
        const adapter: IDatabaseSemaphoreAdapter = {
            transaction: function <TValue>(
                _fn: InvokableFn<
                    [methods: IDatabaseSemaphoreTransaction],
                    Promise<TValue>
                >,
            ): Promise<TValue> {
                throw new Error("Function not implemented.");
            },
            removeSlot: function (
                _key: string,
                _slotId: string,
            ): Promise<ISemaphoreSlotExpirationData | null> {
                throw new Error("Function not implemented.");
            },
            removeAllSlots: function (
                _key: string,
            ): Promise<ISemaphoreSlotExpirationData[]> {
                throw new Error("Function not implemented.");
            },
            updateExpiration: function (
                _key: string,
                _slotId: string,
                _expiration: Date,
            ): Promise<number> {
                throw new Error("Function not implemented.");
            },
        };
        expect(isDatabaseSemaphoreAdapter(adapter)).toBe(true);
    });
    test("Should return false when given ISemaphoreAdapter", () => {
        const adapter: ISemaphoreAdapter = {
            acquire: function (
                _settings: SemaphoreAcquireSettings,
            ): Promise<boolean> {
                throw new Error("Function not implemented.");
            },
            release: function (
                _key: string,
                _slotId: string,
            ): Promise<boolean> {
                throw new Error("Function not implemented.");
            },
            forceReleaseAll: function (_key: string): Promise<boolean> {
                throw new Error("Function not implemented.");
            },
            refresh: function (
                _key: string,
                _slotId: string,
                _ttl: TimeSpan,
            ): Promise<boolean> {
                throw new Error("Function not implemented.");
            },
            getState: function (
                _key: string,
            ): Promise<ISemaphoreAdapterState | null> {
                throw new Error("Function not implemented.");
            },
        };
        expect(isDatabaseSemaphoreAdapter(adapter)).toBe(false);
    });
});
