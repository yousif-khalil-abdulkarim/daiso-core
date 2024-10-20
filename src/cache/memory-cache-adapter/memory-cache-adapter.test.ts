import { describe, test, beforeEach, expect } from "vitest";
import { cacheApiTestSuite } from "@/cache/_shared/test-utilities/cache-api-test-suite";
import { MemoryCacheAdapter } from "@/cache/memory-cache-adapter/memory-cache-adapter";

describe("class: MemoryCacheAdapter", () => {
    cacheApiTestSuite({
        createAdapter: () => new MemoryCacheAdapter(new Map<string, unknown>()),
        test,
        expect,
        describe,
        beforeEach,
    });
});
