import { beforeEach, describe, expect, test } from "vitest";
import { lockAdapterTestSuite } from "@/lock/implementations/test-utilities/_module-exports.js";
import { MemoryLockAdapter } from "@/lock/implementations/adapters/memory-lock-adapter/_module.js";
import type { ILockData } from "@/lock/contracts/_module-exports.js";

describe("class: MemoryLockAdapter", () => {
    let map: Map<string, ILockData>;
    beforeEach(() => {
        map = new Map<string, ILockData>();
    });
    lockAdapterTestSuite({
        createAdapter: () =>
            new MemoryLockAdapter({
                rootGroup: "@a",
                map,
            }),
        test,
        beforeEach,
        expect,
        describe,
    });
});
