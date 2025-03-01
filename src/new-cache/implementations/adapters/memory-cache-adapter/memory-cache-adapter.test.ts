import { beforeEach, describe, expect, test } from "vitest";
import { cacheAdapterTestSuite } from "@/new-cache/implementations/test-utilities/_module-exports.js";
import { MemoryCacheAdapter } from "@/new-cache/implementations/adapters/_module-exports.js";

describe("class: MemoryCacheAdapter", () => {
    cacheAdapterTestSuite({
        createAdapter: () => new MemoryCacheAdapter(new Map<string, unknown>()),
        test,
        beforeEach,
        expect,
        describe,
    });
});
