import { beforeEach, describe, expect, test } from "vitest";
import { lockAdapterTestSuite } from "@/lock/implementations/test-utilities/_module-exports.js";
import {
    MemoryLockAdapter,
    type MemoryLockData,
} from "@/lock/implementations/adapters/memory-lock-adapter/_module.js";

describe("class: MemoryLockAdapter", () => {
    let map = new Map<string, MemoryLockData>();
    beforeEach(() => {
        map = new Map();
    });
    lockAdapterTestSuite({
        createAdapter: () => new MemoryLockAdapter(map),
        test,
        beforeEach,
        expect,
        describe,
    });
});
