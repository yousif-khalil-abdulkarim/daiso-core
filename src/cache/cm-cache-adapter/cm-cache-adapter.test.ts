import { describe, test, beforeEach, expect } from "vitest";
import { cacheApiTestSuite } from "@/cache/_shared/test-utilities/cache-api-test-suite";
import { CmCacheAdapter } from "@/cache/cm-cache-adapter/cm-cache-adapter";
import { createCache } from "cache-manager";

describe("class: CmCacheAdapter", () => {
    cacheApiTestSuite({
        createAdapter: () => new CmCacheAdapter(createCache()),
        test,
        expect,
        describe,
        beforeEach,
    });
});
