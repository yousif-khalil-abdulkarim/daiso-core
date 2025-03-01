import type {
    ICacheAdapter,
    ICacheData,
    ICacheDataExpiration,
    ICacheInsert,
    ICacheUpdate,
    IDatabaseCacheAdapter,
} from "@/cache/contracts/_module-exports.js";
import { describe, expect, test } from "vitest";
import { isDatabaseCacheAdapter } from "@/cache/implementations/derivables/cache/is-database-cache-adapter.js";
import type { TimeSpan } from "@/utilities/_module-exports.js";

describe("function: isDatabaseCacheAdapter", () => {
    test("Should return true when is IDatabaseCacheAdapter", () => {
        const adapter: IDatabaseCacheAdapter = {
            find: function (_key: string): PromiseLike<ICacheData | null> {
                throw new Error("Function not implemented.");
            },
            insert: function (_data: ICacheInsert): PromiseLike<void> {
                throw new Error("Function not implemented.");
            },
            upsert: function (
                _data: ICacheInsert,
            ): PromiseLike<ICacheDataExpiration | null> {
                throw new Error("Function not implemented.");
            },
            updateExpired: function (_data: ICacheInsert): PromiseLike<number> {
                throw new Error("Function not implemented.");
            },
            updateUnexpired: function (
                _data: ICacheUpdate,
            ): PromiseLike<number> {
                throw new Error("Function not implemented.");
            },
            incrementUnexpired: function (
                _data: ICacheUpdate<number>,
            ): PromiseLike<number> {
                throw new Error("Function not implemented.");
            },
            removeExpiredMany: function (_keys: string[]): PromiseLike<number> {
                throw new Error("Function not implemented.");
            },
            removeUnexpiredMany: function (
                _keys: string[],
            ): PromiseLike<number> {
                throw new Error("Function not implemented.");
            },
            removeByKeyPrefix: function (_prefix: string): PromiseLike<void> {
                throw new Error("Function not implemented.");
            },
        };
        expect(isDatabaseCacheAdapter(adapter)).toBe(true);
    });
    test("Should return false when is not IDatabaseCacheAdapter", () => {
        const adapter: ICacheAdapter = {
            get: function (_key: string): PromiseLike<unknown> {
                throw new Error("Function not implemented.");
            },
            getAndRemove: function (_key: string): PromiseLike<unknown> {
                throw new Error("Function not implemented.");
            },
            add: function (
                _key: string,
                _value: unknown,
                _ttl: TimeSpan | null,
            ): PromiseLike<boolean> {
                throw new Error("Function not implemented.");
            },
            put: function (
                _key: string,
                _value: unknown,
                _ttl: TimeSpan | null,
            ): PromiseLike<boolean> {
                throw new Error("Function not implemented.");
            },
            update: function (
                _key: string,
                _value: unknown,
            ): PromiseLike<boolean> {
                throw new Error("Function not implemented.");
            },
            increment: function (
                _key: string,
                _value: number,
            ): PromiseLike<boolean> {
                throw new Error("Function not implemented.");
            },
            removeMany: function (_keys: string[]): PromiseLike<boolean> {
                throw new Error("Function not implemented.");
            },
            removeByKeyPrefix: function (_prefix: string): PromiseLike<void> {
                throw new Error("Function not implemented.");
            },
        };
        expect(isDatabaseCacheAdapter(adapter)).toBe(false);
    });
});
