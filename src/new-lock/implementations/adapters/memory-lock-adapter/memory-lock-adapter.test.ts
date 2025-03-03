import { beforeEach, describe, expect, test } from "vitest";
import { lockAdapterTestSuite } from "@/new-lock/implementations/test-utilities/_module-exports.js";
import { MemoryLockAdapter } from "@/new-lock/implementations/adapters/memory-lock-adapter/_module.js";

describe("class: MemoryLockAdapter", () => {
    lockAdapterTestSuite({
        createAdapter: () => new MemoryLockAdapter(new Map()),
        test,
        beforeEach,
        expect,
        describe,
    });
});
