import { beforeEach, describe, expect, test } from "vitest";
import { cacheTestSuite } from "eridu-tech/cache/test-utilities";
import { Cache } from "eridu-tech/cache";
import { MemoryCacheAdapter } from "eridu-tech/cache/memory-cache-adapter";

describe("class: MyCache", () => {
    cacheTestSuite({
        createCache: () =>
            new Cache({
                adapter: new MemoryCacheAdapter(),
            }),
        test,
        beforeEach,
        expect,
        describe,
    });
});
