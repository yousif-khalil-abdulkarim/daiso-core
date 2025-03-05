import { beforeEach, describe, expect, test } from "vitest";
import { MemoryLockAdapter } from "@/lock/implementations/adapters/_module-exports.js";
import { LockProvider } from "@/lock/implementations/derivables/_module-exports.js";
import { EventBus } from "@/event-bus/implementations/derivables/_module-exports.js";
import { MemoryEventBusAdapter } from "@/event-bus/implementations/adapters/_module-exports.js";
import { lockProviderTestSuite } from "@/lock/implementations/test-utilities/_module-exports.js";
import { Serde } from "@/serde/implementations/derivables/_module-exports.js";
import { SuperJsonSerdeAdapter } from "@/serde/implementations/adapters/_module-exports.js";
import { KeyPrefixer } from "@/utilities/_module-exports.js";
import type { ILockAdapter } from "@/lock/contracts/_module-exports.js";

describe("class: LockProvider", () => {
    const eventBus = new EventBus({
        keyPrefixer: new KeyPrefixer("event-bus"),
        adapter: new MemoryEventBusAdapter(),
    });
    const serde = new Serde(new SuperJsonSerdeAdapter());
    describe("Without factory:", () => {
        lockProviderTestSuite({
            createLockProvider: () => {
                const lockProvider = new LockProvider({
                    serde,
                    eventBus,
                    adapter: new MemoryLockAdapter(),
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
    describe("With factory:", () => {
        let store: Partial<Record<string, ILockAdapter>> = {};
        beforeEach(() => {
            store = {};
        });
        lockProviderTestSuite({
            createLockProvider: () => {
                return new LockProvider({
                    serde,
                    adapter: (prefix: string): ILockAdapter => {
                        let adapter = store[prefix];
                        if (adapter === undefined) {
                            adapter = new MemoryLockAdapter();
                            store[prefix] = adapter;
                        }
                        return adapter;
                    },
                    eventBus,
                    keyPrefixer: new KeyPrefixer("lock"),
                });
            },
            beforeEach,
            describe,
            expect,
            test,
            serde,
        });
    });
});
