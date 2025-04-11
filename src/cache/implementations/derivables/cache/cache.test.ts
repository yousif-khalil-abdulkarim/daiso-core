import { beforeEach, describe, expect, test } from "vitest";
import { cacheTestSuite } from "@/cache/implementations/test-utilities/_module-exports.js";
import { MemoryCacheAdapter } from "@/cache/implementations/adapters/_module-exports.js";
import { Cache } from "@/cache/implementations/derivables/_module-exports.js";
import { KeyPrefixer } from "@/utilities/_module-exports.js";
import { EventBus } from "@/new-event-bus/implementations/derivables/_module-exports.js";
import { MemoryEventBusAdapter } from "@/new-event-bus/implementations/adapters/_module-exports.js";

describe("class: Cache", () => {
    cacheTestSuite({
        createCache: () =>
            new Cache({
                keyPrefixer: new KeyPrefixer("cache"),
                adapter: new MemoryCacheAdapter(),
                eventBus: new EventBus({
                    keyPrefixer: new KeyPrefixer("event-bus"),
                    adapter: new MemoryEventBusAdapter(),
                }),
            }),
        test,
        beforeEach,
        expect,
        describe,
    });
});
