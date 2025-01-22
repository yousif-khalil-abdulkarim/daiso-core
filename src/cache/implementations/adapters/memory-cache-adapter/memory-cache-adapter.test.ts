import { beforeEach, describe, expect, test } from "vitest";
import { cacheAdapterTestSuite } from "@/cache/implementations/_shared/_module";
import { MemoryCacheAdapter } from "@/cache/implementations/adapters/memory-cache-adapter/_module";

describe("class: MemoryCacheAdapter", () => {
    cacheAdapterTestSuite({
        createAdapterA: () =>
            new MemoryCacheAdapter("@a", new Map<string, unknown>()),
        createAdapterB: () =>
            new MemoryCacheAdapter("@a/b", new Map<string, unknown>()),
        test,
        beforeEach,
        expect,
        describe,
    });
});
