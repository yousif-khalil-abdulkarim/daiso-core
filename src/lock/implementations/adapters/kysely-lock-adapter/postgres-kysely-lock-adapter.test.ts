import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { databaseLockAdapterTestSuite } from "@/lock/implementations/test-utilities/_module-exports.js";
import {
    KyselyLockAdapter,
    type KyselyLockTables,
} from "@/lock/implementations/adapters/kysely-lock-adapter/_module.js";
import {
    Kysely,
    PostgresDialect,
    type ColumnMetadata,
    type TableMetadata,
} from "kysely";
import type { StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { Pool } from "pg";
import { TimeSpan } from "@/time-span/implementations/_module-exports.js";

const timeout = TimeSpan.fromMinutes(2);
describe("postgres class: KyselyLockAdapter", () => {
    let database: Pool;
    let container: StartedPostgreSqlContainer;
    let kysely: Kysely<KyselyLockTables>;

    beforeEach(async () => {
        container = await new PostgreSqlContainer("postgres:17.5").start();
        database = new Pool({
            database: container.getDatabase(),
            host: container.getHost(),
            user: container.getUsername(),
            port: container.getPort(),
            password: container.getPassword(),
            max: 10,
        });
        kysely = new Kysely({
            dialect: new PostgresDialect({
                pool: database,
            }),
        });
    }, timeout.toMilliseconds());
    afterEach(async () => {
        await database.end();
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

            await adapter.transaction(async (trx) => {
                await trx.upsert(
                    "a",
                    "owner",
                    TimeSpan.fromMilliseconds(50).toStartDate(),
                );
                await trx.upsert(
                    "b",
                    "owner",
                    TimeSpan.fromMilliseconds(50).toStartDate(),
                );
                await trx.upsert(
                    "c",
                    "owner",
                    TimeSpan.fromMilliseconds(50).toEndDate(),
                );
            });

            await adapter.removeAllExpired();

            expect(await adapter.find("a")).toBeNull();
            expect(await adapter.find("b")).toBeNull();
            expect(await adapter.find("c")).not.toBeNull();
        });
    });
    describe("method: init", () => {
        test("Should create lock table", async () => {
            const adapter = new KyselyLockAdapter({
                kysely,
                shouldRemoveExpiredKeys: false,
            });
            await adapter.init();

            const tables = await kysely.introspection.getTables();

            expect(tables).toContainEqual(
                expect.objectContaining<Partial<TableMetadata>>({
                    name: "lock",
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
                    columns: expect.arrayContaining<Partial<ColumnMetadata>>([
                        expect.objectContaining<Partial<ColumnMetadata>>({
                            name: "key",
                            dataType: "varchar",
                            isNullable: false,
                            hasDefaultValue: false,
                        }),
                        expect.objectContaining({
                            name: "owner",
                            dataType: "varchar",
                            isNullable: false,
                            hasDefaultValue: false,
                        }),
                        expect.objectContaining({
                            name: "expiration",
                            dataType: "int8",
                            isNullable: true,
                            hasDefaultValue: false,
                        }),
                    ]),
                }),
            );
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
        test("Should call not setInterval when shouldRemoveExpiredKeys is false", async () => {
            const intervalFn = vi.spyOn(globalThis, "setInterval");

            const adapter = new KyselyLockAdapter({
                kysely,
                shouldRemoveExpiredKeys: false,
            });
            await adapter.init();

            expect(intervalFn).not.toHaveBeenCalledTimes(1);
        });
        test("Should call setInterval when shouldRemoveExpiredKeys is true", async () => {
            const intervalFn = vi.spyOn(globalThis, "setInterval");

            const adapter = new KyselyLockAdapter({
                kysely,
                shouldRemoveExpiredKeys: true,
            });
            await adapter.init();

            expect(intervalFn).toHaveBeenCalledTimes(1);
            await adapter.deInit();
        });
    });
    describe("method: deInit", () => {
        test("Should remove lock table", async () => {
            const adapter = new KyselyLockAdapter({
                kysely,
                shouldRemoveExpiredKeys: false,
            });
            await adapter.init();
            await adapter.deInit();

            const tables = await kysely.introspection.getTables();

            expect(tables).not.toContainEqual(
                expect.objectContaining<Partial<TableMetadata>>({
                    name: "lock",
                }),
            );
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
        test("Should call not clearInterval when shouldRemoveExpiredKeys is false", async () => {
            const intervalFn = vi.spyOn(globalThis, "clearInterval");

            const adapter = new KyselyLockAdapter({
                kysely,
                shouldRemoveExpiredKeys: false,
            });
            await adapter.init();
            await adapter.deInit();

            expect(intervalFn).not.toHaveBeenCalledTimes(1);
        });
        test("Should call clearInterval when shouldRemoveExpiredKeys is true", async () => {
            vi.useFakeTimers();
            const intervalFn = vi.spyOn(globalThis, "clearInterval");

            const adapter = new KyselyLockAdapter({
                kysely,
                shouldRemoveExpiredKeys: true,
            });
            await adapter.init();
            await adapter.deInit();

            expect(intervalFn).toHaveBeenCalledTimes(1);
            await adapter.deInit();
        });
    });
});
