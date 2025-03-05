import { beforeEach, describe, expect, test } from "vitest";
import { cacheTestSuite } from "@/cache/implementations/test-utilities/_module-exports.js";
import { MemoryCacheAdapter } from "@/cache/implementations/adapters/_module-exports.js";
import { Cache } from "@/cache/implementations/derivables/_module-exports.js";
import { KeyPrefixer } from "@/utilities/_module-exports.js";
import type { ICacheAdapter } from "@/cache/contracts/_module-exports.js";
import { EventBus } from "@/event-bus/implementations/derivables/_module-exports.js";
import { MemoryEventBusAdapter } from "@/event-bus/implementations/adapters/_module-exports.js";

describe("class: Cache", () => {
    describe("Without factory:", () => {
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
    describe("With factory:", () => {
        let store: Partial<Record<string, ICacheAdapter>> = {};
        beforeEach(() => {
            store = {};
        });
        cacheTestSuite({
            createCache: () => {
                return new Cache({
                    adapter: (prefix: string): ICacheAdapter => {
                        let adapter = store[prefix];
                        if (adapter === undefined) {
                            adapter = new MemoryCacheAdapter();
                            store[prefix] = adapter;
                        }
                        return adapter;
                    },
                    keyPrefixer: new KeyPrefixer("cache"),
                    eventBus: new EventBus({
                        keyPrefixer: new KeyPrefixer("event-bus"),
                        adapter: new MemoryEventBusAdapter(),
                    }),
                });
            },
            beforeEach,
            describe,
            expect,
            test,
        });
    });
});
