import type {
    IDatabaseSharedLockAdapter,
    IDatabaseSharedLockTransaction,
    ISharedLockAdapter,
    ISharedLockAdapterState,
    SharedLockAcquireSettings,
} from "@/shared-lock/contracts/_module-exports.js";
import { describe, expect, test } from "vitest";
import { isDatabaseSharedLockAdapter } from "@/shared-lock/implementations/derivables/shared-lock-provider/is-database-shared-lock-adapter.js";
import type { InvokableFn } from "@/utilities/_module-exports.js";
import type { TimeSpan } from "@/time-span/implementations/time-span.js";

describe("function: isDatabaseSharedLockAdapter", () => {
    test("Should return true when given IDatabaseSharedLockAdapter", () => {
        const adapter: IDatabaseSharedLockAdapter = {
            transaction: function <TReturn>(
                _fn: InvokableFn<
                    [transaction: IDatabaseSharedLockTransaction],
                    Promise<TReturn>
                >,
            ): Promise<TReturn> {
                throw new Error("Function not implemented.");
            },
        };
        expect(isDatabaseSharedLockAdapter(adapter)).toBe(true);
    });
    test("Should return false when given ISharedLockAdapter", () => {
        const adapter: ISharedLockAdapter = {
            acquireWriter: function (
                _key: string,
                _lockId: string,
                _ttl: TimeSpan | null,
            ): Promise<boolean> {
                throw new Error("Function not implemented.");
            },
            releaseWriter: function (
                _key: string,
                _lockId: string,
            ): Promise<boolean> {
                throw new Error("Function not implemented.");
            },
            forceReleaseWriter: function (_key: string): Promise<boolean> {
                throw new Error("Function not implemented.");
            },
            refreshWriter: function (
                _key: string,
                _lockId: string,
                _ttl: TimeSpan,
            ): Promise<boolean> {
                throw new Error("Function not implemented.");
            },
            acquireReader: function (
                _settings: SharedLockAcquireSettings,
            ): Promise<boolean> {
                throw new Error("Function not implemented.");
            },
            releaseReader: function (
                _key: string,
                _slotId: string,
            ): Promise<boolean> {
                throw new Error("Function not implemented.");
            },
            forceReleaseAllReaders: function (_key: string): Promise<boolean> {
                throw new Error("Function not implemented.");
            },
            refreshReader: function (
                _key: string,
                _slotId: string,
                _ttl: TimeSpan,
            ): Promise<boolean> {
                throw new Error("Function not implemented.");
            },
            forceRelease: function (_key: string): Promise<boolean> {
                throw new Error("Function not implemented.");
            },
            getState: function (
                _key: string,
            ): Promise<ISharedLockAdapterState | null> {
                throw new Error("Function not implemented.");
            },
        };
        expect(isDatabaseSharedLockAdapter(adapter)).toBe(false);
    });
});
