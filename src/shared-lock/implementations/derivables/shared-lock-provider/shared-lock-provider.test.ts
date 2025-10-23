import { beforeEach, describe, expect, test } from "vitest";
import {
    KyselySharedLockAdapter,
    MemorySharedLockAdapter,
} from "@/shared-lock/implementations/adapters/_module.js";
import { SharedLockProvider } from "@/shared-lock/implementations/derivables/_module-exports.js";
import { EventBus } from "@/event-bus/implementations/derivables/_module-exports.js";
import { MemoryEventBusAdapter } from "@/event-bus/implementations/adapters/_module-exports.js";
import { sharedLockProviderTestSuite } from "@/shared-lock/implementations/test-utilities/_module-exports.js";
import { Serde } from "@/serde/implementations/derivables/_module-exports.js";
import { SuperJsonSerdeAdapter } from "@/serde/implementations/adapters/_module-exports.js";
import { Namespace } from "@/namespace/_module-exports.js";
import type { ISharedLock } from "@/shared-lock/contracts/_module-exports.js";
import { Kysely, SqliteDialect } from "kysely";
import Sqlite from "better-sqlite3";

describe("class: SharedLockProvider", () => {
    sharedLockProviderTestSuite({
        createSharedLockProvider: () => {
            const serde = new Serde(new SuperJsonSerdeAdapter());
            const sharedLockProvider = new SharedLockProvider({
                serde,
                eventBus: new EventBus({
                    namespace: new Namespace("event-bus"),
                    adapter: new MemoryEventBusAdapter(),
                }),
                adapter: new MemorySharedLockAdapter(),
                namespace: new Namespace("shared-lock"),
            });
            return { sharedLockProvider, serde };
        },
        beforeEach,
        describe,
        expect,
        test,
    });
    describe("Serde tests:", () => {
        test("Should differentiate between different namespaces", async () => {
            const serde = new Serde(new SuperJsonSerdeAdapter());
            const key = "a";
            const ttl = null;
            const limit = 4;

            const sharedLockProvider1 = new SharedLockProvider({
                adapter: new MemorySharedLockAdapter(),
                namespace: new Namespace("@lock-1"),
                eventBus: new EventBus({
                    adapter: new MemoryEventBusAdapter(),
                    namespace: new Namespace("@event-bus/lock-1"),
                }),
                serde,
            });
            const lock1 = sharedLockProvider1.create(key, { ttl, limit });
            await lock1.acquireWriter();

            const sharedLockProvider2 = new SharedLockProvider({
                adapter: new MemorySharedLockAdapter(),
                namespace: new Namespace("@lock-2"),
                eventBus: new EventBus({
                    adapter: new MemoryEventBusAdapter(),
                    namespace: new Namespace("@event-bus/lock-2"),
                }),
                serde,
            });

            const lock2 = sharedLockProvider2.create(key, { ttl, limit });
            const deserializedLock2 = serde.deserialize<ISharedLock>(
                serde.serialize(lock2),
            );
            const result = await deserializedLock2.acquireWriter();
            expect(result).toBe(true);
        });
        test("Should differentiate between different adapters and the same namespace", async () => {
            const serde = new Serde(new SuperJsonSerdeAdapter());
            const lockNamespace = new Namespace("@lock");
            const eventNamespace = new Namespace("@event-bus/lock");
            const key = "a";
            const ttl = null;
            const limit = 4;

            const adapter1 = new MemorySharedLockAdapter();
            const sharedLockProvider1 = new SharedLockProvider({
                adapter: adapter1,
                namespace: lockNamespace,
                eventBus: new EventBus({
                    adapter: new MemoryEventBusAdapter(),
                    namespace: eventNamespace,
                }),
                serde,
            });
            const lock1 = sharedLockProvider1.create(key, { ttl, limit });
            await lock1.acquireWriter();

            const adapter2 = new KyselySharedLockAdapter({
                kysely: new Kysely({
                    dialect: new SqliteDialect({
                        database: new Sqlite(":memory:"),
                    }),
                }),
                shouldRemoveExpiredKeys: false,
            });
            await adapter2.init();
            const sharedLockProvider2 = new SharedLockProvider({
                adapter: adapter2,
                namespace: lockNamespace,
                eventBus: new EventBus({
                    adapter: new MemoryEventBusAdapter(),
                    namespace: eventNamespace,
                }),
                serde,
            });

            const lock2 = sharedLockProvider2.create(key, { ttl, limit });
            const deserializeLock2 = serde.deserialize<ISharedLock>(
                serde.serialize(lock2),
            );
            const result = await deserializeLock2.acquireWriter();

            expect(result).toBe(true);
        });
        test("Should differentiate between different serdeTransformerNames", async () => {
            const serde = new Serde(new SuperJsonSerdeAdapter());
            const lockNamespace = new Namespace("@lock");
            const eventNamespace = new Namespace("@event-bus/lock");
            const key = "a";
            const ttl = null;
            const limit = 4;

            const sharedLockProvider1 = new SharedLockProvider({
                adapter: new MemorySharedLockAdapter(),
                namespace: lockNamespace,
                eventBus: new EventBus({
                    adapter: new MemoryEventBusAdapter(),
                    namespace: eventNamespace,
                }),
                serdeTransformerName: "adapter1",
                serde,
            });
            const lock1 = sharedLockProvider1.create(key, { ttl, limit });
            await lock1.acquireWriter();

            const sharedLockProvider2 = new SharedLockProvider({
                adapter: new MemorySharedLockAdapter(),
                namespace: lockNamespace,
                eventBus: new EventBus({
                    adapter: new MemoryEventBusAdapter(),
                    namespace: eventNamespace,
                }),
                serdeTransformerName: "adapter2",
                serde,
            });

            const lock2 = sharedLockProvider2.create(key, { ttl, limit });
            const deserializeLock2 = serde.deserialize<ISharedLock>(
                serde.serialize(lock2),
            );
            const result = await deserializeLock2.acquireWriter();

            expect(result).toBe(true);
        });
    });
});
