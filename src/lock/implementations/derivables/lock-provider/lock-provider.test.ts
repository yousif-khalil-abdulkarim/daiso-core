import { beforeEach, describe, expect, test } from "vitest";
import { MemoryLockAdapter } from "@/lock/implementations/adapters/_module";
import { LockProvider } from "@/lock/implementations/derivables/lock-provider/lock-provider";
import { EventBus } from "@/event-bus/implementations/_module";
import { MemoryEventBusAdapter } from "@/event-bus/implementations/adapters/memory-event-bus-adapter/memory-event-bus-adapter";
import { lockProviderTestSuite } from "@/lock/implementations/_shared/_module";
import { SuperJsonSerde } from "@/serde/implementations/_module";
import type { ILockData } from "@/lock/contracts/_module";

describe("class: LockProvider", () => {
    const eventBus = new EventBus({
        adapter: new MemoryEventBusAdapter({
            rootGroup: "@global",
        }),
    });
    const serde = new SuperJsonSerde();
    let map: Map<string, ILockData>;
    beforeEach(() => {
        map = new Map();
    });
    lockProviderTestSuite({
        createLockProvider: () => {
            const lockProvider = new LockProvider({
                adapter: new MemoryLockAdapter({
                    rootGroup: "@a",
                    map,
                }),
                eventBus,
            });
            serde.registerCustom(lockProvider);
            return lockProvider;
        },
        beforeEach,
        describe,
        expect,
        test,
        serde,
    });
});
