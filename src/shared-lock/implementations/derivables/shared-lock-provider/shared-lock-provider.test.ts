import { beforeEach, describe, expect, test } from "vitest";
import { MemorySharedLockAdapter } from "@/shared-lock/implementations/adapters/_module-exports.js";
import { SharedLockProvider } from "@/shared-lock/implementations/derivables/_module-exports.js";
import { EventBus } from "@/event-bus/implementations/derivables/_module-exports.js";
import { MemoryEventBusAdapter } from "@/event-bus/implementations/adapters/_module-exports.js";
import { sharedLockProviderTestSuite } from "@/shared-lock/implementations/test-utilities/_module-exports.js";
import { Serde } from "@/serde/implementations/derivables/_module-exports.js";
import { SuperJsonSerdeAdapter } from "@/serde/implementations/adapters/_module-exports.js";
import { Namespace } from "@/utilities/_module-exports.js";

describe("class: LockProvider", () => {
    const serde = new Serde(new SuperJsonSerdeAdapter());
    sharedLockProviderTestSuite({
        createSharedLockProvider: () => {
            const sharedLockProvider = new SharedLockProvider({
                serde,
                eventBus: new EventBus({
                    namespace: new Namespace("event-bus"),
                    adapter: new MemoryEventBusAdapter(),
                }),
                adapter: new MemorySharedLockAdapter(),
                namespace: new Namespace("shared-lock"),
            });
            return sharedLockProvider;
        },
        beforeEach,
        describe,
        expect,
        test,
        serde,
    });
    describe("Serde tests:", () => {
        test.todo("Write tests!!!");
    });
});
