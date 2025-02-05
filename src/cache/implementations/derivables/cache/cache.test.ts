import { beforeEach, describe, expect, test } from "vitest";
import { MemoryCacheAdapter } from "@/cache/implementations/adapters/_module";
import { Cache } from "@/cache/implementations/derivables/cache/cache";
import { EventBus } from "@/event-bus/implementations/_module";
import { MemoryEventBusAdapter } from "@/event-bus/implementations/adapters/memory-event-bus-adapter/memory-event-bus-adapter";
import { cacheTestSuite } from "@/cache/implementations/_shared/_module";

describe("class: Cache", () => {
    const eventBus = new EventBus<any>({
        adapter: new MemoryEventBusAdapter({
            rootGroup: "@global",
        }),
    });
    let map: Map<string, unknown>;
    beforeEach(() => {
        map = new Map();
    });
    cacheTestSuite({
        createCache: () =>
            new Cache({
                adapter: new MemoryCacheAdapter({
                    rootGroup: "@a",
                    map,
                }),
                eventBus,
            }),
        beforeEach,
        describe,
        expect,
        test,
    });
});
