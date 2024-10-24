import { describe, test, beforeEach, expect } from "vitest";
import { MemoryCacheAdapter } from "@/cache/memory-cache-adapter/memory-cache-adapter";
import {
    cacheApiTestSuite,
    cacheValueTestSuite,
    cacheNamespaceTestSuite,
} from "@/cache/_shared/test-utilities/_module";
import { type ICacheAdapter } from "@/contracts/cache/_module";

function createAdapter(): ICacheAdapter<unknown> {
    return new MemoryCacheAdapter(new Map<string, unknown>());
}
describe("class: MemoryCacheAdapter", () => {
    cacheApiTestSuite({
        createAdapter,
        test,
        expect,
        describe,
        beforeEach,
    });
    cacheNamespaceTestSuite({
        createAdapter,
        test,
        expect,
        describe,
        beforeEach,
    });
    cacheValueTestSuite({
        createAdapter,
        test,
        expect,
        describe,
        beforeEach,
    });
});
