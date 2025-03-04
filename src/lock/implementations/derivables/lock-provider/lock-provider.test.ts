import { afterEach, beforeEach, describe, expect, test } from "vitest";
import {
    MemoryLockAdapter,
    SqliteLockAdapter,
} from "@/lock/implementations/adapters/_module-exports.js";
import { LockProvider } from "@/lock/implementations/derivables/_module-exports.js";
import { EventBus } from "@/event-bus/implementations/derivables/_module-exports.js";
import { MemoryEventBusAdapter } from "@/event-bus/implementations/adapters/_module-exports.js";
import { lockProviderTestSuite } from "@/lock/implementations/test-utilities/_module-exports.js";
import { Serde } from "@/serde/implementations/derivables/_module-exports.js";
import { SuperJsonSerdeAdapter } from "@/serde/implementations/adapters/_module-exports.js";
import { KeyPrefixer } from "@/utilities/_module-exports.js";
import Sqlite, { type Database } from "better-sqlite3";

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
    describe("With factory:", () => {
        let database: Database;
        beforeEach(() => {
            database = new Sqlite(":memory:");
        });
        afterEach(() => {
            database.close();
        });
        lockProviderTestSuite({
            createLockProvider: () => {
                const lockProvider = new LockProvider({
                    serde,
                    async adapter(prefix: string): Promise<SqliteLockAdapter> {
                        const adapter = new SqliteLockAdapter({
                            database: database,
                            tableName: `custom_table_${prefix}`,
                            shouldRemoveExpiredKeys: false,
                        });
                        await adapter.init();
                        return adapter;
                    },
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
});
