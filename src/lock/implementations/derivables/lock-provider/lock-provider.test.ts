import { beforeEach, describe, expect, test } from "vitest";
import { MemoryLockAdapter } from "@/lock/implementations/adapters/_module-exports.js";
import { LockProvider } from "@/lock/implementations/derivables/_module-exports.js";
import { EventBus } from "@/event-bus/implementations/derivables/_module-exports.js";
import { MemoryEventBusAdapter } from "@/event-bus/implementations/adapters/_module-exports.js";
import { lockProviderTestSuite } from "@/lock/implementations/test-utilities/_module-exports.js";
import { Serde } from "@/serde/implementations/derivables/_module-exports.js";
import { SuperJsonSerdeAdapter } from "@/serde/implementations/adapters/_module-exports.js";
import { KeyPrefixer } from "@/utilities/_module-exports.js";

describe("class: LockProvider", () => {
    const eventBus = new EventBus({
        keyPrefixer: new KeyPrefixer("event-bus"),
        adapter: new MemoryEventBusAdapter(),
    });
    const serde = new Serde(new SuperJsonSerdeAdapter());
    lockProviderTestSuite({
        createLockProvider: () => {
            const lockProvider = new LockProvider({
                serde,
                adapter: new MemoryLockAdapter(new Map()),
                eventBus,
                keyPrefixer: new KeyPrefixer("lock"),
            });
            return lockProvider;
        },
        beforeEach,
        describe,
        expect,
        test,
        serde,
    });
});
