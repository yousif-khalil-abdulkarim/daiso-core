import { describe, expect, test } from "vitest";
import { isDatabaseLockAdapter } from "@/lock/implementations/derivables/lock-provider/is-database-lock-adapter.js";
import type {
    ILockAdapter,
    ILockAdapterState,
    IDatabaseLockAdapter,
    IDatabaseLockTransaction,
    ILockData,
    ILockExpirationData,
} from "@/lock/contracts/_module-exports.js";
import type { InvokableFn, TimeSpan } from "@/utilities/_module-exports.js";

describe("function: isDatabaseLockAdapter", () => {
    test("Should return true when given IDatabaseLockAdapter", () => {
        const adapter: IDatabaseLockAdapter = {
            transaction: function <TReturn>(
                _fn: InvokableFn<
                    [transaction: IDatabaseLockTransaction],
                    Promise<TReturn>
                >,
            ): Promise<TReturn> {
                throw new Error("Function not implemented.");
            },
            remove: function (
                _key: string,
            ): Promise<ILockExpirationData | null> {
                throw new Error("Function not implemented.");
            },
            removeIfOwner: function (
                _key: string,
                _lockId: string,
            ): Promise<ILockData | null> {
                throw new Error("Function not implemented.");
            },
            updateExpiration: function (
                _key: string,
                _lockId: string,
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
                _lockId: string,
                _ttl: TimeSpan | null,
            ): Promise<boolean> {
                throw new Error("Function not implemented.");
            },
            release: function (
                _key: string,
                _lockId: string,
            ): Promise<boolean> {
                throw new Error("Function not implemented.");
            },
            forceRelease: function (_key: string): Promise<boolean> {
                throw new Error("Function not implemented.");
            },
            refresh: function (
                _key: string,
                _lockId: string,
                _ttl: TimeSpan,
            ): Promise<boolean> {
                throw new Error("Function not implemented.");
            },
            getState(_key: string): Promise<ILockAdapterState> {
                throw new Error("Function not implemented.");
            },
        };
        expect(isDatabaseLockAdapter(adapter)).toBe(false);
    });
});
