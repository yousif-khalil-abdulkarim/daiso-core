import type {
    IDatabaseSemaphoreAdapter,
    DatabaseSemaphoreInsertSlotSettings,
} from "@/semaphore/contracts/database-semaphore-adapter.contract.js";
import { describe, expect, test } from "vitest";
import { isDatabaseSemaphoreAdapter } from "@/semaphore/implementations/derivables/semaphore-provider/is-database-semaphore-adapter.js";
import type {
    ISemaphoreAdapter,
    SemaphoreAcquireSettings,
} from "@/semaphore/contracts/semaphore-adapter.contract.js";
import type { TimeSpan } from "@/utilities/_module-exports.js";

describe("function: isDatabaseSemaphoreAdapter", () => {
    test("Should return true when given IDatabaseSemaphoreAdapter", () => {
        const adapter: IDatabaseSemaphoreAdapter = {
            findLimit: function (_key: string): Promise<number | null> {
                throw new Error("Function not implemented.");
            },
            insertSemaphore: function (
                _key: string,
                _limit: number,
            ): Promise<void> {
                throw new Error("Function not implemented.");
            },
            removeSemaphore: function (_key: string): Promise<void> {
                throw new Error("Function not implemented.");
            },
            insertSlotIfLimitNotReached: function (
                _settings: DatabaseSemaphoreInsertSlotSettings,
            ): Promise<number> {
                throw new Error("Function not implemented.");
            },
            removeSlot: function (
                _key: string,
                _slotId: string,
            ): Promise<void> {
                throw new Error("Function not implemented.");
            },
            updateSlotIfUnexpired: function (
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
            release: function (_key: string, _slotId: string): Promise<void> {
                throw new Error("Function not implemented.");
            },
            forceReleaseAll: function (_key: string): Promise<void> {
                throw new Error("Function not implemented.");
            },
            refresh: function (
                _key: string,
                _slotId: string,
                _ttl: TimeSpan,
            ): Promise<boolean> {
                throw new Error("Function not implemented.");
            },
        };
        expect(isDatabaseSemaphoreAdapter(adapter)).toBe(false);
    });
});
