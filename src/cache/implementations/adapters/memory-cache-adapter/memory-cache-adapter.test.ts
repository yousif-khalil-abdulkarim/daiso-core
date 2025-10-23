import { beforeEach, describe, expect, test } from "vitest";
import { cacheAdapterTestSuite } from "@/cache/implementations/test-utilities/_module-exports.js";
import { MemoryCacheAdapter } from "@/cache/implementations/adapters/_module.js";

describe("class: MemoryCacheAdapter", () => {
    cacheAdapterTestSuite({
        createAdapter: () => new MemoryCacheAdapter(),
        test,
        beforeEach,
        expect,
        describe,
    });
});
