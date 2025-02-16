import { beforeEach, describe, expect, test } from "vitest";
import { MemoryLockAdapter } from "@/lock/implementations/adapters/_module";
import { LockProvider } from "@/lock/implementations/derivables/lock-provider/lock-provider";
import { EventBus } from "@/event-bus/implementations/derivables/_module";
import { MemoryEventBusAdapter } from "@/event-bus/implementations/adapters/memory-event-bus-adapter/memory-event-bus-adapter";
import { lockProviderTestSuite } from "@/lock/implementations/test-utilities/_module";
import { Serde } from "@/serde/implementations/deriavables/_module";
import { SuperJsonSerdeAdapter } from "@/serde/implementations/adapters/_module";
import type { ILockData } from "@/lock/contracts/_module";

describe("class: LockProvider", () => {
    const eventBus = new EventBus({
        adapter: new MemoryEventBusAdapter({
            rootGroup: "@global",
        }),
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
