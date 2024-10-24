import { describe, test, beforeEach, expect } from "vitest";
import { CmCacheAdapter } from "@/cache/cm-cache-adapter/cm-cache-adapter";
import { createCache } from "cache-manager";
import {
    cacheValueTestSuite,
    cacheApiTestSuite,
} from "@/cache/_shared/test-utilities/_module";
import Keyv from "keyv";
import { stringify, parse } from "superjson";
import { type ICacheAdapter } from "@/contracts/cache/_module";

function createAdapter(): ICacheAdapter<unknown> {
    return new CmCacheAdapter(
        createCache({
            stores: [
                new Keyv({
                    serialize: stringify,
                    deserialize: parse,
                }),
            ],
        }),
    );
}
describe("class: CmCacheAdapter", () => {
    cacheApiTestSuite({
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
