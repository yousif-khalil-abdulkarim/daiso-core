import { describe, test, beforeEach, expect } from "vitest";
import { KeyvCacheAdapter } from "@/cache/keyv-cache-adapter/keyv-cache-adapter";
import { Keyv } from "keyv";
import {
    cacheValueTestSuite,
    cacheApiTestSuite,
} from "@/cache/_shared/test-utilities/_module";
import { stringify, parse } from "superjson";
import { type ICacheAdapter } from "@/contracts/cache/_module";

function createAdapter(): ICacheAdapter<unknown> {
    return new KeyvCacheAdapter(
        new Keyv({
            serialize: stringify,
            deserialize: parse,
        }),
    );
}
describe("class: KeyvCacheAdapter", () => {
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
