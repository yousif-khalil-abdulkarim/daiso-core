import type {
    IDatabaseLockAdapter,
    ILockData,
    ILockExpirationData,
} from "@/lock/contracts/database-lock-adapter.contract.js";
import { describe, expect, test } from "vitest";
import { isDatabaseLockAdapter } from "@/lock/implementations/derivables/lock-provider/is-database-lock-adapter.js";
import type {
    ILockAdapter,
    LockRefreshResult,
} from "@/lock/contracts/lock-adapter.contract.js";
import type { TimeSpan } from "@/utilities/_module-exports.js";

describe("function: isDatabaseLockAdapter", () => {
    test("Should return true when given IDatabaseLockAdapter", () => {
        const adapter: IDatabaseLockAdapter = {
            insert: function (
                _key: string,
                _owner: string,
                _expiration: Date | null,
            ): Promise<void> {
                throw new Error("Function not implemented.");
            },
            updateIfExpired: function (
                _key: string,
                _owner: string,

                _expiration: Date | null,
            ): Promise<number> {
                throw new Error("Function not implemented.");
            },
            remove: function (_key: string): Promise<ILockExpirationData> {
                throw new Error("Function not implemented.");
            },
            removeIfOwner: function (
                _key: string,
                _owner: string,
            ): Promise<ILockData | null> {
                throw new Error("Function not implemented.");
            },
            updateExpirationIfOwner: function (
                _key: string,
                _owner: string,
                _expiration: Date,
            ): Promise<number> {
                throw new Error("Function not implemented.");
            },
            find: function (_key: string): Promise<ILockData | null> {
                throw new Error("Function not implemented.");
            },
        };
        expect(isDatabaseLockAdapter(adapter)).toBe(true);
    });
    test("Should return false when given ILockAdapter", () => {
        const adapter: ILockAdapter = {
            acquire: function (
                _key: string,
                _owner: string,
                _ttl: TimeSpan | null,
            ): Promise<boolean> {
                throw new Error("Function not implemented.");
            },
            release: function (_key: string, _owner: string): Promise<boolean> {
                throw new Error("Function not implemented.");
            },
            forceRelease: function (_key: string): Promise<boolean> {
                throw new Error("Function not implemented.");
            },
            refresh: function (
                _key: string,
                _owner: string,
                _ttl: TimeSpan,
            ): Promise<LockRefreshResult> {
                throw new Error("Function not implemented.");
            },
        };
        expect(isDatabaseLockAdapter(adapter)).toBe(false);
    });
});
