import { beforeEach, describe, expect, test } from "vitest";
import { MemorySemaphoreAdapter } from "@/semaphore/implementations/adapters/_module-exports.js";
import { SemaphoreProvider } from "@/semaphore/implementations/derivables/_module-exports.js";
import { EventBus } from "@/event-bus/implementations/derivables/_module-exports.js";
import { MemoryEventBusAdapter } from "@/event-bus/implementations/adapters/_module-exports.js";
import { semaphoreProviderTestSuite } from "@/semaphore/implementations/test-utilities/_module-exports.js";
import { Serde } from "@/serde/implementations/derivables/_module-exports.js";
import { SuperJsonSerdeAdapter } from "@/serde/implementations/adapters/_module-exports.js";
import { Namespace } from "@/utilities/_module-exports.js";

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
});
