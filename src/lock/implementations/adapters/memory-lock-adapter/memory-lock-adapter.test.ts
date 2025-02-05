import { beforeEach, describe, expect, test } from "vitest";
import { lockAdapterTestSuite } from "@/lock/implementations/_shared/_module";
import type { MemoryLockData } from "@/lock/implementations/adapters/memory-lock-adapter/_module";
import { MemoryLockAdapter } from "@/lock/implementations/adapters/memory-lock-adapter/_module";

describe("class: MemoryLockAdapter", () => {
    let map: Map<string, MemoryLockData>;
    beforeEach(() => {
        map = new Map<string, MemoryLockData>();
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
