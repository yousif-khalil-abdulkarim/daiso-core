import { beforeEach, describe, expect, test } from "vitest";
import { cacheTestSuite } from "@/new-cache/implementations/test-utilities/_module.js";
import { MemoryCacheAdapter } from "@/new-cache/implementations/adapters/_module.js";
import { Cache } from "@/new-cache/implementations/derivables/_module.js";
import { ValidationError } from "@/utilities/_module.js";
import { EventBus } from "@/event-bus/implementations/derivables/_module.js";
import { MemoryEventBusAdapter } from "@/event-bus/implementations/adapters/_module.js";
import { z } from "zod";
import { Namespace } from "@/namespace/_module.js";

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
    describe("standard schema:", () => {
        let adapter: MemoryCacheAdapter;
        let cache: Cache<string>;
        const namespace = new Namespace("cache");
        beforeEach(() => {
            adapter = new MemoryCacheAdapter();
            cache = new Cache({
                namespace,
                adapter,
                schema: z.string(),
            });
        });
        describe("input validation:", () => {
            test.todo("Write tests!!!");
        });
        describe("output validation:", () => {
            test.todo("Write tests!!!");
        });
    });
});
