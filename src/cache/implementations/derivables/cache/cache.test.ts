import { beforeEach, describe, expect, test } from "vitest";
import { cacheTestSuite } from "@/cache/implementations/test-utilities/_module-exports.js";
import { MemoryCacheAdapter } from "@/cache/implementations/adapters/_module-exports.js";
import { Cache } from "@/cache/implementations/derivables/_module-exports.js";
import { Namespace } from "@/utilities/_module-exports.js";
import { EventBus } from "@/event-bus/implementations/derivables/_module-exports.js";
import { MemoryEventBusAdapter } from "@/event-bus/implementations/adapters/_module-exports.js";

describe("class: Cache", () => {
    cacheTestSuite({
        createCache: () =>
            new Cache({
                namespace: new Namespace("cache"),
                adapter: new MemoryCacheAdapter(),
                eventBus: new EventBus({
                    namespace: new Namespace("event-bus"),
                    adapter: new MemoryEventBusAdapter(),
                }),
            }),
        test,
        beforeEach,
        expect,
        describe,
    });
});
