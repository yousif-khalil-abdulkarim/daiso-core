import { beforeEach, describe, expect, test } from "vitest";
import { cacheAdapterTestSuite } from "@/cache/implementations/_shared/_module";
import { MemoryCacheAdapter } from "@/cache/implementations/adapters/memory-cache-adapter/_module";

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
