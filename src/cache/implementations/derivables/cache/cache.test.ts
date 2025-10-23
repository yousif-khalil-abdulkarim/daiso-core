import { beforeEach, describe, expect, test } from "vitest";
import { cacheTestSuite } from "@/cache/implementations/test-utilities/_module-exports.js";
import { MemoryCacheAdapter } from "@/cache/implementations/adapters/_module.js";
import { Cache } from "@/cache/implementations/derivables/_module-exports.js";
import { ValidationError } from "@/utilities/_module-exports.js";
import { EventBus } from "@/event-bus/implementations/derivables/_module-exports.js";
import { MemoryEventBusAdapter } from "@/event-bus/implementations/adapters/_module.js";
import { z } from "zod";
import { Namespace } from "@/namespace/_module-exports.js";

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
            test("method: add", async () => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const invalidInput: string = 0 as any;
                const promise = cache.add("a", invalidInput);
                await expect(promise).rejects.toBeInstanceOf(ValidationError);
            });
            test("method: getOrAdd", async () => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const invalidInput: string = 0 as any;
                const promise = cache.getOrAdd("a", invalidInput);
                await expect(promise).rejects.toBeInstanceOf(ValidationError);
            });
            test("method: update", async () => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const invalidInput: string = 0 as any;
                const promise = cache.update("a", invalidInput);
                await expect(promise).rejects.toBeInstanceOf(ValidationError);
            });
            test("method: put", async () => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const invalidInput: string = 0 as any;
                const promise = cache.put("a", invalidInput);
                await expect(promise).rejects.toBeInstanceOf(ValidationError);
            });
        });
        describe("output validation:", () => {
            test("method: get", async () => {
                await adapter.add(namespace.create("a").toString(), 1, null);
                const promise = cache.get("a");
                await expect(promise).rejects.toBeInstanceOf(ValidationError);
            });
            test("method: getOrFail", async () => {
                await adapter.add(namespace.create("a").toString(), 1, null);
                const promise = cache.getOrFail("a");
                await expect(promise).rejects.toBeInstanceOf(ValidationError);
            });
            test("method: getAndRemove", async () => {
                await adapter.add(namespace.create("a").toString(), 1, null);
                const promise = cache.getAndRemove("a");
                await expect(promise).rejects.toBeInstanceOf(ValidationError);
            });
            test("method: getOr", async () => {
                await adapter.add(namespace.create("a").toString(), 1, null);
                const promise = cache.getOr("a", "1");
                await expect(promise).rejects.toBeInstanceOf(ValidationError);
            });
            test("method: getOrAdd", async () => {
                await adapter.add(namespace.create("a").toString(), 1, null);
                const promise = cache.getOrAdd("a", "1");
                await expect(promise).rejects.toBeInstanceOf(ValidationError);
            });
        });
    });
});
