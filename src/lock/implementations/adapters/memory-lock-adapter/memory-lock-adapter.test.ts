import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { lockAdapterTestSuite } from "@/lock/implementations/test-utilities/_module-exports.js";
import {
    MemoryLockAdapter,
    type MemoryLockData,
} from "@/lock/implementations/adapters/memory-lock-adapter/_module.js";
import { TimeSpan } from "@/time-span/implementations/_module-exports.js";

describe("class: MemoryLockAdapter", () => {
    let map = new Map<string, MemoryLockData>();
    let adapter: MemoryLockAdapter;
    beforeEach(() => {
        map = new Map();
        adapter = new MemoryLockAdapter(map);
    });
    afterEach(async () => {
        await adapter.deInit();
    });
    lockAdapterTestSuite({
        createAdapter: () => adapter,
        test,
        beforeEach,
        expect,
        describe,
    });
    describe("method: deInit", () => {
        test("Should clear map", async () => {
            await adapter.acquire("a", "1", null);
            await adapter.acquire("a", "2", TimeSpan.fromMilliseconds(100));
            await adapter.acquire("b", "1", null);
            await adapter.acquire("b", "2", TimeSpan.fromMilliseconds(100));

            await adapter.deInit();

            expect(map.size).toBe(0);
        });
    });
});
