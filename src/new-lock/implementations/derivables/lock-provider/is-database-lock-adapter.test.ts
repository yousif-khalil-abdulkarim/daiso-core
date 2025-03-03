import type {
    IDatabaseLockAdapter,
    ILockData,
} from "@/new-lock/contracts/database-lock-adapter.contract.js";
import { describe, expect, test } from "vitest";
import { isDatabaseLockAdapter } from "@/new-lock/implementations/derivables/lock-provider/is-database-lock-adapter.js";
import type { ILockAdapter } from "@/new-lock/contracts/lock-adapter.contract.js";
import type { TimeSpan } from "@/utilities/_module-exports.js";

describe("function: isDatabaseLockAdapter", () => {
    test("Should return true when given IDatabaseLockAdapter", () => {
        const adapter: IDatabaseLockAdapter = {
            insert: function (
                _key: string,
                _owner: string,
                _expiration: Date | null,
            ): PromiseLike<void> {
                throw new Error("Function not implemented.");
            },
            update: function (
                _key: string,
                _owner: string,
                _expiration: Date | null,
            ): PromiseLike<number> {
                throw new Error("Function not implemented.");
            },
            remove: function (
                _key: string,
                _owner: string | null,
            ): PromiseLike<void> {
                throw new Error("Function not implemented.");
            },
            refresh: function (
                _key: string,
                _owner: string,
                _expiration: Date,
            ): PromiseLike<number> {
                throw new Error("Function not implemented.");
            },
            find: function (_key: string): PromiseLike<ILockData | null> {
                throw new Error("Function not implemented.");
            },
        };
        expect(isDatabaseLockAdapter(adapter)).toBe(true);
    });
    test("Should return true when given ILockAdapter", () => {
        const adapter: ILockAdapter = {
            acquire: function (
                _key: string,
                _owner: string,
                _ttl: TimeSpan | null,
            ): PromiseLike<boolean> {
                throw new Error("Function not implemented.");
            },
            release: function (
                _key: string,
                _owner: string,
            ): PromiseLike<boolean> {
                throw new Error("Function not implemented.");
            },
            forceRelease: function (_key: string): PromiseLike<void> {
                throw new Error("Function not implemented.");
            },
            refresh: function (
                _key: string,
                _owner: string,
                _ttl: TimeSpan,
            ): PromiseLike<boolean> {
                throw new Error("Function not implemented.");
            },
        };
        expect(isDatabaseLockAdapter(adapter)).toBe(false);
    });
});
