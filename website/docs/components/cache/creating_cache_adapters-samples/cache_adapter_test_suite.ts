import { beforeEach, describe, expect, test } from "vitest";
import { cacheAdapterTestSuite } from "eridu-tech/cache/test-utilities";
import { MemoryCacheAdapter } from "eridu-tech/cache/memory-cache-adapter";

describe("class: MyCacheAdapter", () => {
    cacheAdapterTestSuite({
        createAdapter: () => new MemoryCacheAdapter(),
        test,
        beforeEach,
        expect,
        describe,
    });
});
