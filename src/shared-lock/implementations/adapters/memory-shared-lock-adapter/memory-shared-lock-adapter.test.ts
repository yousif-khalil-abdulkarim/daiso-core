import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { sharedLockAdapterTestSuite } from "@/shared-lock/implementations/test-utilities/_module-exports.js";
import {
    MemorySharedLockAdapter,
    type MemorySharedLockData,
} from "@/shared-lock/implementations/adapters/memory-shared-lock-adapter/_module.js";

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
        test.todo("Should clear map");
    });
});
