import { beforeEach, describe, expect, test } from "vitest";

import {
    MemoryRateLimiterStorageAdapter,
    type MemoryRateLimiterData,
} from "@/rate-limiter/implementations/adapters/memory-rate-limiter-storage-adapter/_module.js";
import { rateLimiterStorageAdapterTestSuite } from "@/rate-limiter/implementations/test-utilities/_module.js";
import { TimeSpan } from "@/time-span/implementations/time-span.js";

describe("class: MemoryRateLimiterStorageAdapter", () => {
    rateLimiterStorageAdapterTestSuite({
        createAdapter: () => {
            return new MemoryRateLimiterStorageAdapter();
        },
        test,
        beforeEach,
        expect,
        describe,
    });
    describe("method: deInit", () => {
        test("Should clear rate limiter data", async () => {
            const map = new Map<string, MemoryRateLimiterData>();
            const adapter = new MemoryRateLimiterStorageAdapter(map);
            await adapter.transaction(async (trx) => {
                await trx.upsert("a", 1, TimeSpan.fromSeconds(2).toEndDate());
                await trx.upsert("b", 2, TimeSpan.fromSeconds(2).toEndDate());
                await trx.upsert("c", 3, TimeSpan.fromSeconds(2).toEndDate());
            });
            await adapter.deInit();

            expect(map.size).toBe(0);
        });
        test("Should not throw error when called multiple times", async () => {
            const adapter = new MemoryRateLimiterStorageAdapter();
            await adapter.deInit();

            const promise = adapter.deInit();

            await expect(promise).resolves.toBeUndefined();
        });
        test("Should not throw error when called before init", async () => {
            const adapter = new MemoryRateLimiterStorageAdapter();

            const promise = adapter.deInit();

            await expect(promise).resolves.toBeUndefined();
        });
    });
});
