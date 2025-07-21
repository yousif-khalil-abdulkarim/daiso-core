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
            find: function (_key: string): Promise<ICacheData | null> {
                throw new Error("Function not implemented.");
            },
            insert: function (_data: ICacheInsert): Promise<void> {
                throw new Error("Function not implemented.");
            },
            upsert: function (
                _data: ICacheInsert,
            ): Promise<ICacheDataExpiration | null> {
                throw new Error("Function not implemented.");
            },
            updateExpired: function (_data: ICacheInsert): Promise<number> {
                throw new Error("Function not implemented.");
            },
            updateUnexpired: function (_data: ICacheUpdate): Promise<number> {
                throw new Error("Function not implemented.");
            },
            incrementUnexpired: function (
                _data: ICacheUpdate<number>,
            ): Promise<number> {
                throw new Error("Function not implemented.");
            },
            removeExpiredMany: function (_keys: string[]): Promise<number> {
                throw new Error("Function not implemented.");
            },
            removeUnexpiredMany: function (_keys: string[]): Promise<number> {
                throw new Error("Function not implemented.");
            },
            removeAll: function (): Promise<void> {
                throw new Error("Function not implemented.");
            },
            removeByKeyPrefix: function (_prefix: string): Promise<void> {
                throw new Error("Function not implemented.");
            },
        };
        expect(isDatabaseCacheAdapter(adapter)).toBe(true);
    });
    test("Should return false when is not IDatabaseCacheAdapter", () => {
        const adapter: ICacheAdapter = {
            get: function (_key: string): Promise<unknown> {
                throw new Error("Function not implemented.");
            },
            getAndRemove: function (_key: string): Promise<unknown> {
                throw new Error("Function not implemented.");
            },
            add: function (
                _key: string,
                _value: unknown,
                _ttl: TimeSpan | null,
            ): Promise<boolean> {
                throw new Error("Function not implemented.");
            },
            put: function (
                _key: string,
                _value: unknown,
                _ttl: TimeSpan | null,
            ): Promise<boolean> {
                throw new Error("Function not implemented.");
            },
            update: function (_key: string, _value: unknown): Promise<boolean> {
                throw new Error("Function not implemented.");
            },
            increment: function (
                _key: string,
                _value: number,
            ): Promise<boolean> {
                throw new Error("Function not implemented.");
            },
            removeMany: function (_keys: string[]): Promise<boolean> {
                throw new Error("Function not implemented.");
            },
            removeAll: function (): Promise<void> {
                throw new Error("Function not implemented.");
            },
            removeByKeyPrefix: function (_prefix: string): Promise<void> {
                throw new Error("Function not implemented.");
            },
        };
        expect(isDatabaseCacheAdapter(adapter)).toBe(false);
    });
});
