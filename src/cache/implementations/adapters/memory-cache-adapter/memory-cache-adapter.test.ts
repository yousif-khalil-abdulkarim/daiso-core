import { beforeEach, describe, expect, test } from "vitest";
import { cacheAdapterTestSuite } from "@/cache/implementations/test-utilities/_module-exports.js";
import { MemoryCacheAdapter } from "@/cache/implementations/adapters/memory-cache-adapter/_module.js";

describe("class: MemoryCacheAdapter", () => {
    cacheAdapterTestSuite({
        createAdapter: () =>
            new MemoryCacheAdapter({
                rootGroup: "@a",
                map: new Map<string, unknown>(),
            }),
        test,
        beforeEach,
        expect,
        describe,
    });
});
