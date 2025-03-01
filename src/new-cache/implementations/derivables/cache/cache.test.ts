import { beforeEach, describe, expect, test } from "vitest";
import { cacheTestSuite } from "@/new-cache/implementations/test-utilities/_module-exports.js";
import { MemoryCacheAdapter } from "@/new-cache/implementations/adapters/_module-exports.js";
import { Cache } from "@/new-cache/implementations/derivables/_module-exports.js";
import { KeyPrefixer } from "@/utilities/_module-exports.js";

describe("class: Cache", () => {
    cacheTestSuite({
        createCache: () =>
            new Cache({
                keyPrefixer: new KeyPrefixer("cache"),
                adapter: new MemoryCacheAdapter(),
            }),
        test,
        beforeEach,
        expect,
        describe,
    });
});
