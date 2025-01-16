import { beforeEach, describe, expect, test } from "vitest";
import { MemoryCacheAdapter } from "@/cache/implementations/adapters/_module";
import { Cache } from "@/cache/implementations/derivables/cache";
import { EventBus } from "@/event-bus/implementations/_module";
import { MemoryEventBusAdapter } from "@/event-bus/implementations/adapters/memory-event-bus-adapter/memory-event-bus-adapter";
import { cacheTestSuite } from "@/cache/implementations/_shared/cache.test-suite";

describe("class: Cache", () => {
    const eventBus = new EventBus<any>(new MemoryEventBusAdapter());
    let map: Map<string, unknown>;
    beforeEach(() => {
        map = new Map();
    });
    cacheTestSuite({
        createCacheA: () =>
            new Cache(new MemoryCacheAdapter(map), {
                rootNamespace: "@a",
                eventBus,
            }),
        createCacheB: () =>
            new Cache(new MemoryCacheAdapter(map), {
                rootNamespace: "@b",
                eventBus,
            }),
        beforeEach,
        describe,
        expect,
        test,
    });
});
