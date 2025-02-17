import { beforeEach, describe, expect, test } from "vitest";
import { MemoryCacheAdapter } from "@/cache/implementations/adapters/_module-exports.js";
import { Cache } from "@/cache/implementations/derivables/_module-exports.js";
import { EventBus } from "@/event-bus/implementations/derivables/_module-exports.js";
import { MemoryEventBusAdapter } from "@/event-bus/implementations/adapters/_module-exports.js";
import { cacheTestSuite } from "@/cache/implementations/test-utilities/_module-exports.js";

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
