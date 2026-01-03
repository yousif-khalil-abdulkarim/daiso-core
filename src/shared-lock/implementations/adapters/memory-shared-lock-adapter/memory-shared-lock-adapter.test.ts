import { afterEach, beforeEach, describe, expect, test } from "vitest";

import {
    MemorySharedLockAdapter,
    type MemorySharedLockData,
} from "@/shared-lock/implementations/adapters/memory-shared-lock-adapter/_module.js";
import { sharedLockAdapterTestSuite } from "@/shared-lock/implementations/test-utilities/_module.js";
import { TimeSpan } from "@/time-span/implementations/_module.js";

describe("class: MemorySharedLockAdapter", () => {
    let map = new Map<string, MemorySharedLockData>();
    let adapter: MemorySharedLockAdapter;
    beforeEach(() => {
        map = new Map();
        adapter = new MemorySharedLockAdapter(map);
    });
    afterEach(async () => {
        await adapter.deInit();
    });
    sharedLockAdapterTestSuite({
        createAdapter: () => adapter,
        test,
        beforeEach,
        expect,
        describe,
    });
    describe("method: deInit", () => {
        test("Should clear map", async () => {
            await adapter.acquireWriter("a", "1", null);
            await adapter.acquireWriter(
                "a",
                "2",
                TimeSpan.fromMilliseconds(100),
            );
            await adapter.acquireWriter("b", "1", null);
            await adapter.acquireWriter(
                "b",
                "2",
                TimeSpan.fromMilliseconds(100),
            );

            await adapter.acquireReader({
                key: "c",
                lockId: "1",
                ttl: null,
                limit: 4,
            });
            await adapter.acquireReader({
                key: "d",
                lockId: "1",
                ttl: TimeSpan.fromMilliseconds(100),
                limit: 4,
            });

            await adapter.acquireReader({
                key: "c",
                lockId: "1",
                ttl: null,
                limit: 4,
            });
            await adapter.acquireReader({
                key: "d",
                lockId: "1",
                ttl: TimeSpan.fromMilliseconds(100),
                limit: 4,
            });

            await adapter.deInit();

            expect(map.size).toBe(0);
        });
    });
});
