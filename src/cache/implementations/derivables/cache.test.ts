import { beforeEach, describe, expect, test } from "vitest";
import { type ICache } from "@/cache/contracts/_module";
import { MemoryCacheAdapter } from "@/cache/implementations/adapters/_module";
import { Cache } from "@/cache/implementations/derivables/cache";
import { EventBus } from "@/event-bus/implementations/_module";
import { MemoryEventBusAdapter } from "@/event-bus/implementations/adapters/memory-event-bus-adapter/memory-event-bus-adapter";
import { cacheTestSuite } from "@/cache/implementations/_shared/cache.test-suite";

describe("class: Cache", () => {
    let cacheA: ICache<any>;
    let cacheB: ICache<any>;
    beforeEach(() => {
        const cacheAdapter = new MemoryCacheAdapter();
        const eventBusAdapter = new MemoryEventBusAdapter();
        cacheA = new Cache(cacheAdapter, {
            rootNamespace: "@a",
            eventBus: new EventBus(eventBusAdapter),
        });
        cacheB = new Cache(cacheAdapter, {
            rootNamespace: "@b",
            eventBus: new EventBus(eventBusAdapter),
        });
    });
    cacheTestSuite({
        createCacheA: () => cacheA,
        createCacheB: () => cacheB,
        beforeEach,
        describe,
        expect,
        test,
    });
});
