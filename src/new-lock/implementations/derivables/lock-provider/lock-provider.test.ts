import { beforeEach, describe, expect, test } from "vitest";
import { MemoryLockAdapter } from "@/new-lock/implementations/adapters/_module-exports.js";
import { LockProvider } from "@/new-lock/implementations/derivables/_module-exports.js";
import { EventBus } from "@/event-bus/implementations/derivables/_module-exports.js";
import { MemoryEventBusAdapter } from "@/event-bus/implementations/adapters/_module-exports.js";
import { lockProviderTestSuite } from "@/new-lock/implementations/test-utilities/_module-exports.js";
import { Serde } from "@/serde/implementations/derivables/_module-exports.js";
import { SuperJsonSerdeAdapter } from "@/serde/implementations/adapters/_module-exports.js";
import type { ILockData } from "@/new-lock/contracts/_module-exports.js";
import { KeyPrefixer } from "@/utilities/_module-exports.js";

describe("class: LockProvider", () => {
    const eventBus = new EventBus({
        keyPrefixer: new KeyPrefixer("event-bus"),
        adapter: new MemoryEventBusAdapter(),
    });
    const serde = new Serde(new SuperJsonSerdeAdapter());
    let map: Map<string, ILockData>;
    beforeEach(() => {
        map = new Map();
    });
    lockProviderTestSuite({
        createLockProvider: () => {
            const lockProvider = new LockProvider({
                serde,
                adapter: new MemoryLockAdapter({
                    rootGroup: "@a",
                    map,
                }),
                eventBus,
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
