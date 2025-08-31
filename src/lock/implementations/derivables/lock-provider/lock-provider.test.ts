import { beforeEach, describe, expect, test } from "vitest";
import {
    KyselyLockAdapter,
    MemoryLockAdapter,
} from "@/lock/implementations/adapters/_module-exports.js";
import { LockProvider } from "@/lock/implementations/derivables/_module-exports.js";
import { EventBus } from "@/event-bus/implementations/derivables/_module-exports.js";
import { MemoryEventBusAdapter } from "@/event-bus/implementations/adapters/_module-exports.js";
import { lockProviderTestSuite } from "@/lock/implementations/test-utilities/_module-exports.js";
import { Serde } from "@/serde/implementations/derivables/_module-exports.js";
import { SuperJsonSerdeAdapter } from "@/serde/implementations/adapters/_module-exports.js";
import { Namespace, TimeSpan } from "@/utilities/_module-exports.js";
import type { ILock } from "@/lock/contracts/_module-exports.js";
import { Kysely, SqliteDialect } from "kysely";
import Sqlite from "better-sqlite3";

describe("class: LockProvider", () => {
    const serde = new Serde(new SuperJsonSerdeAdapter());
    lockProviderTestSuite({
        createLockProvider: () => {
            const lockProvider = new LockProvider({
                serde,
                eventBus: new EventBus({
                    namespace: new Namespace("event-bus"),
                    adapter: new MemoryEventBusAdapter(),
                }),
                adapter: new MemoryLockAdapter(),
                namespace: new Namespace("lock"),
            });
            return lockProvider;
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

            const namespace1 = new Namespace("lock1");
            const lockProvider1 = new LockProvider({
                serde,
                eventBus: new EventBus({
                    namespace: namespace1,
                    adapter: new MemoryEventBusAdapter(),
                }),
                adapter: new MemoryLockAdapter(),
                namespace: namespace1,
            });
            const ttl1 = null;
            const lock1 = lockProvider1.create(key, {
                ttl: ttl1,
            });
            await lock1.acquire();
            const deserializedLock1 = serde.deserialize<ILock>(
                serde.serialize(lock1),
            );
            const state1 = await deserializedLock1.getState();

            const namespace2 = new Namespace("lock2");
            const lockProvider2 = new LockProvider({
                serde,
                eventBus: new EventBus({
                    namespace: namespace2,
                    adapter: new MemoryEventBusAdapter(),
                }),
                adapter: new MemoryLockAdapter(),
                namespace: namespace2,
            });
            const ttl2 = TimeSpan.fromMinutes(4);
            const lock2 = lockProvider2.create(key, {
                ttl: ttl2,
            });
            const deserializedLock2 = serde.deserialize<ILock>(
                serde.serialize(lock2),
            );
            const state2 = await deserializedLock2.getState();

            expect(state1?.getOwner()).not.toBe(state2?.getOwner());
        });
        test("Should differentiate between adapters", async () => {
            const key = "a";
            const namespace = new Namespace("lock");

            const lockProvider1 = new LockProvider({
                serde,
                eventBus: new EventBus({
                    namespace: namespace.appendRoot("memory"),
                    adapter: new MemoryEventBusAdapter(),
                }),
                adapter: new MemoryLockAdapter(),
                namespace,
            });
            const ttl1 = null;
            const lock1 = lockProvider1.create(key, {
                ttl: ttl1,
            });
            await lock1.acquire();
            const deserializedLock1 = serde.deserialize<ILock>(
                serde.serialize(lock1),
            );
            const state1 = await deserializedLock1.getState();

            const kyselyLockAdapter = new KyselyLockAdapter({
                kysely: new Kysely({
                    dialect: new SqliteDialect({
                        database: new Sqlite(":memory:"),
                    }),
                }),
                shouldRemoveExpiredKeys: false,
            });
            await kyselyLockAdapter.init();
            const lockProvider2 = new LockProvider({
                serde,
                eventBus: new EventBus({
                    namespace: namespace.appendRoot("sqlite"),
                    adapter: new MemoryEventBusAdapter(),
                }),
                adapter: kyselyLockAdapter,
                namespace,
            });
            const ttl2 = TimeSpan.fromMinutes(4);
            const lock2 = lockProvider2.create(key, {
                ttl: ttl2,
            });
            const deserializedLock2 = serde.deserialize<ILock>(
                serde.serialize(lock2),
            );
            const state2 = await deserializedLock2.getState();

            expect(state1?.getOwner()).not.toBe(state2?.getOwner());
        });
    });
});
