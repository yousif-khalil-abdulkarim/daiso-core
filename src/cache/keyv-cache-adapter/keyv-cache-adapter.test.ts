import { describe, test, beforeEach, expect } from "vitest";
import { cacheApiTestSuite } from "@/cache/_shared/test-utilities/cache-api-test-suite";
import { KeyvCacheAdapter } from "@/cache/keyv-cache-adapter/keyv-cache-adapter";
import { Keyv } from "keyv";

describe("class: KeyvCacheAdapter", () => {
    cacheApiTestSuite({
        createAdapter: () => new KeyvCacheAdapter(new Keyv()),
        test,
        expect,
        describe,
        beforeEach,
    });
});
