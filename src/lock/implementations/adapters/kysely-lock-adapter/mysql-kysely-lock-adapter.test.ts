import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { databaseLockAdapterTestSuite } from "@/lock/implementations/test-utilities/_module-exports.js";
import {
    KyselyLockAdapter,
    type KyselyLockAdapterTables,
} from "@/lock/implementations/adapters/kysely-lock-adapter/_module.js";
import { Kysely, MysqlDialect } from "kysely";
import type { StartedMySqlContainer } from "@testcontainers/mysql";
import { MySqlContainer } from "@testcontainers/mysql";
import { createPool, type Pool } from "mysql2";
import { TimeSpan } from "@/utilities/_module-exports.js";

const timeout = TimeSpan.fromMinutes(2);
describe("mysql class: KyselyLockAdapter", () => {
    let database: Pool;
    let container: StartedMySqlContainer;
    let kysely: Kysely<KyselyLockAdapterTables>;

    beforeEach(async () => {
        container = await new MySqlContainer("mysql:9.3.0").start();
        database = createPool({
            host: container.getHost(),
            port: container.getPort(),
            database: container.getDatabase(),
            user: container.getUsername(),
            password: container.getUserPassword(),
            connectionLimit: 10,
        });
        kysely = new Kysely({
            dialect: new MysqlDialect({
                pool: database,
            }),
        });
    }, timeout.toMilliseconds());
    afterEach(async () => {
        await new Promise<void>((resolve, reject) => {
            database.end((error) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            });
        });
        await container.stop();
    }, timeout.toMilliseconds());
    databaseLockAdapterTestSuite({
        createAdapter: async () => {
            const adapter = new KyselyLockAdapter({
                kysely,
                shouldRemoveExpiredKeys: false,
            });
            await adapter.init();
            return adapter;
        },
        test,
        beforeEach,
        expect,
        describe,
    });
    describe("method: removeAllExpired", () => {
        test("Should remove all expired keys", async () => {
            const adapter = new KyselyLockAdapter({
                kysely,
                shouldRemoveExpiredKeys: false,
            });
            await adapter.init();

            await adapter.insert(
                "a",
                "owner",
                TimeSpan.fromMilliseconds(50).toStartDate(),
            );
            await adapter.insert(
                "b",
                "owner",
                TimeSpan.fromMilliseconds(50).toStartDate(),
            );
            await adapter.insert(
                "c",
                "owner",
                TimeSpan.fromMilliseconds(50).toEndDate(),
            );

            await adapter.removeAllExpired();

            expect(await adapter.find("a")).toBeNull();
            expect(await adapter.find("b")).toBeNull();
            expect(await adapter.find("c")).not.toBeNull();
        });
    });
    describe("method: init", () => {
        test("Should create table", async () => {
            const adapter = new KyselyLockAdapter({
                kysely,
                shouldRemoveExpiredKeys: false,
            });
            await adapter.init();

            const tables = await kysely.introspection.getTables();
            const table = tables.find((table) => table.name === "lock");

            expect(table).toBeDefined();
            expect(table?.name).toBe("lock");
        });
        test("Should define column key column", async () => {
            const adapter = new KyselyLockAdapter({
                kysely,
                shouldRemoveExpiredKeys: false,
            });
            await adapter.init();

            const tables = await kysely.introspection.getTables();
            const table = tables.find((table) => table.name === "lock");

            expect(table).toBeDefined();
            const keyColumn = table?.columns.find(
                (column) => column.name === "key",
            );
            expect(keyColumn).toBeDefined();
            expect(keyColumn?.name).toBe("key");
            expect(keyColumn?.dataType).toBe("varchar");
            expect(keyColumn?.isNullable).toBe(false);
        });
        test("Should define column owner column", async () => {
            const adapter = new KyselyLockAdapter({
                kysely,
                shouldRemoveExpiredKeys: false,
            });
            await adapter.init();

            const tables = await kysely.introspection.getTables();
            const table = tables.find((table) => table.name === "lock");

            const ownerColumn = table?.columns.find(
                (column) => column.name === "owner",
            );
            expect(ownerColumn).toBeDefined();
            expect(ownerColumn?.name).toBe("owner");
            expect(ownerColumn?.dataType).toBe("varchar");
            expect(ownerColumn?.isNullable).toBe(false);

            const expirationColumn = table?.columns.find(
                (column) => column.name === "expiration",
            );
            expect(expirationColumn).toBeDefined();
            expect(expirationColumn?.name).toBe("expiration");
            expect(expirationColumn?.dataType).toBe("bigint");
            expect(expirationColumn?.isNullable).toBe(true);
        });
        test("Should define column expiration column", async () => {
            const adapter = new KyselyLockAdapter({
                kysely,
                shouldRemoveExpiredKeys: false,
            });
            await adapter.init();

            const tables = await kysely.introspection.getTables();
            const table = tables.find((table) => table.name === "lock");

            const expirationColumn = table?.columns.find(
                (column) => column.name === "expiration",
            );
            expect(expirationColumn).toBeDefined();
            expect(expirationColumn?.name).toBe("expiration");
            expect(expirationColumn?.dataType).toBe("bigint");
            expect(expirationColumn?.isNullable).toBe(true);
        });
        test("Should not throw error when called multiple times", async () => {
            const adapter = new KyselyLockAdapter({
                kysely,
                shouldRemoveExpiredKeys: false,
            });
            await adapter.init();

            const promise = adapter.init();

            await expect(promise).resolves.toBeUndefined();
        });
    });
    describe("method: deInit", () => {
        test("Should remove table", async () => {
            const adapter = new KyselyLockAdapter({
                kysely,
                shouldRemoveExpiredKeys: false,
            });
            await adapter.init();
            await adapter.deInit();

            const tables = await kysely.introspection.getTables();
            const table = tables.find((table) => table.name === "lock");

            expect(table).toBeUndefined();
        });
        test("Should not throw error when called multiple times", async () => {
            const adapter = new KyselyLockAdapter({
                kysely,
                shouldRemoveExpiredKeys: false,
            });
            await adapter.init();
            await adapter.deInit();

            const promise = adapter.deInit();

            await expect(promise).resolves.toBeUndefined();
        });
        test("Should not throw error when called before init", async () => {
            const adapter = new KyselyLockAdapter({
                kysely,
                shouldRemoveExpiredKeys: false,
            });

            const promise = adapter.deInit();

            await expect(promise).resolves.toBeUndefined();
        });
    });
});
