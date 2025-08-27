import { beforeEach, describe, expect, test } from "vitest";
import { MemorySemaphoreAdapter } from "@/semaphore/implementations/adapters/_module-exports.js";
import { SemaphoreProvider } from "@/semaphore/implementations/derivables/_module-exports.js";
import { EventBus } from "@/event-bus/implementations/derivables/_module-exports.js";
import { MemoryEventBusAdapter } from "@/event-bus/implementations/adapters/_module-exports.js";
import { semaphoreProviderTestSuite } from "@/semaphore/implementations/test-utilities/_module-exports.js";
import { Serde } from "@/serde/implementations/derivables/_module-exports.js";
import { SuperJsonSerdeAdapter } from "@/serde/implementations/adapters/_module-exports.js";
import { Namespace, TimeSpan } from "@/utilities/_module-exports.js";
import type { ISemaphore } from "@/semaphore/contracts/semaphore.contract.js";

describe("class: SemaphoreProvider", () => {
    const serde = new Serde(new SuperJsonSerdeAdapter());
    semaphoreProviderTestSuite({
        createSemaphoreProvider: () => {
            const semaphoreProvider = new SemaphoreProvider({
                serde,
                eventBus: new EventBus({
                    namespace: new Namespace("event-bus"),
                    adapter: new MemoryEventBusAdapter(),
                }),
                adapter: new MemorySemaphoreAdapter(),
                namespace: new Namespace("semaphore"),
            });
            return semaphoreProvider;
        },
        beforeEach,
        describe,
        expect,
        test,
        serde,
    });
    describe("Serde tests:", () => {
        test("Should differentiate between namespaces", async () => {
            const key = "a";
            const limit = 2;

            const semaphoreProvider1 = new SemaphoreProvider({
                serde,
                eventBus: new EventBus({
                    namespace: new Namespace("event-bus1"),
                    adapter: new MemoryEventBusAdapter(),
                }),
                adapter: new MemorySemaphoreAdapter(),
                namespace: new Namespace("semaphore1"),
            });
            const ttl1 = null;
            const semaphore1 = semaphoreProvider1.create(key, {
                ttl: ttl1,
                limit,
            });
            await semaphore1.acquire();
            const deserializedSemaphore1 = serde.deserialize<ISemaphore>(
                serde.serialize(semaphore1),
            );
            const state1 = await deserializedSemaphore1.getState();

            const semaphoreProvider2 = new SemaphoreProvider({
                serde,
                eventBus: new EventBus({
                    namespace: new Namespace("event-bus2"),
                    adapter: new MemoryEventBusAdapter(),
                }),
                adapter: new MemorySemaphoreAdapter(),
                namespace: new Namespace("semaphore2"),
            });
            const ttl2 = TimeSpan.fromMinutes(4);
            const semaphore2 = semaphoreProvider2.create(key, {
                ttl: ttl2,
                limit,
            });
            const deserializedSemaphore2 = serde.deserialize<ISemaphore>(
                serde.serialize(semaphore2),
            );
            const state2 = await deserializedSemaphore2.getState();

            expect(state1?.acquiredSlots()).not.toEqual(
                state2?.acquiredSlots(),
            );
        });
    });
});
