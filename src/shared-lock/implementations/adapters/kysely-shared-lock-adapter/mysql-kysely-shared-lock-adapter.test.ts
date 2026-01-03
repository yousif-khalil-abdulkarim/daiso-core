import {
    type StartedMySqlContainer,
    MySqlContainer,
} from "@testcontainers/mysql";
import {
    Kysely,
    MysqlDialect,
    type ColumnMetadata,
    type TableMetadata,
} from "kysely";
import { createPool, type Pool } from "mysql2";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import {
    KyselySharedLockAdapter,
    type KyselySharedLockTables,
} from "@/shared-lock/implementations/adapters/kysely-shared-lock-adapter/_module.js";
import { databaseSharedLockAdapterTestSuite } from "@/shared-lock/implementations/test-utilities/_module.js";
import { TimeSpan } from "@/time-span/implementations/_module.js";

const timeout = TimeSpan.fromMinutes(2);
describe("mysql class: KyselySharedLockAdapter", () => {
    let database: Pool;
    let container: StartedMySqlContainer;
    let kysely: Kysely<KyselySharedLockTables>;

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
    databaseSharedLockAdapterTestSuite({
        createAdapter: async () => {
            const adapter = new KyselySharedLockAdapter({
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
        test("Should remove all expired writer locks", async () => {
            const adapter = new KyselySharedLockAdapter({
                kysely,
                shouldRemoveExpiredKeys: false,
            });
            await adapter.init();

            await adapter.transaction(async (trx) => {
                await trx.writer.upsert(
                    "a",
                    "owner",
                    TimeSpan.fromMilliseconds(50).toStartDate(),
                );
                await trx.writer.upsert(
                    "b",
                    "owner",
                    TimeSpan.fromMilliseconds(50).toStartDate(),
                );
                await trx.writer.upsert(
                    "c",
                    "owner",
                    TimeSpan.fromMilliseconds(50).toEndDate(),
                );
            });

            await adapter.removeAllExpired();

            expect(
                await adapter.transaction(async (trx) => {
                    return trx.writer.find("a");
                }),
            ).toBeNull();
            expect(
                await adapter.transaction(async (trx) => {
                    return trx.writer.find("b");
                }),
            ).toBeNull();
            expect(
                await adapter.transaction(async (trx) => {
                    return trx.writer.find("c");
                }),
            ).not.toBeNull();
        });
        test("Should remove all expired reader semaphores", async () => {
            const adapter = new KyselySharedLockAdapter({
                kysely,
                shouldRemoveExpiredKeys: false,
            });
            await adapter.init();

            const limit = 3;
            const expiration = TimeSpan.fromMinutes(2).toStartDate();
            const key1 = "1";
            const key2 = "1";
            const slotId1 = "1";
            const slotId2 = "2";
            const slotId3 = "3";

            await adapter.transaction(async (trx) => {
                await trx.reader.upsertSemaphore(key1, limit);
                await trx.reader.upsertSlot(key1, slotId1, expiration);
                await trx.reader.upsertSlot(key1, slotId2, expiration);
                await trx.reader.upsertSlot(key1, slotId3, expiration);

                await trx.reader.upsertSemaphore(key2, limit);
                await trx.reader.upsertSlot(key2, slotId1, expiration);
                await trx.reader.upsertSlot(key2, slotId2, expiration);
                await trx.reader.upsertSlot(key2, slotId3, expiration);
            });

            await adapter.removeAllExpired();

            const result1 = await adapter.transaction(async (trx) => {
                return await trx.reader.findSemaphore(key1);
            });
            expect(result1).toBeNull();

            const result2 = await adapter.transaction(async (trx) => {
                return await trx.reader.findSlots(key1);
            });
            expect(result2).toEqual([]);
            expect(result2.length).toBe(0);

            const result3 = await adapter.transaction(async (trx) => {
                return await trx.reader.findSlots(key2);
            });
            expect(result3).toEqual([]);
            expect(result3.length).toBe(0);

            const result4 = await adapter.transaction(async (trx) => {
                return await trx.reader.findSemaphore(key2);
            });
            expect(result4).toBeNull();
        });
    });
    describe("method: init", () => {
        test("Should create writerLock table", async () => {
            const adapter = new KyselySharedLockAdapter({
                kysely,
                shouldRemoveExpiredKeys: false,
            });
            await adapter.init();

            const tables = await kysely.introspection.getTables();

            expect(tables).toContainEqual(
                expect.objectContaining<Partial<TableMetadata>>({
                    name: "writerLock",
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
                    columns: expect.arrayContaining<Partial<ColumnMetadata>>([
                        expect.objectContaining<Partial<ColumnMetadata>>({
                            name: "key",
                            dataType: "varchar",
                            isNullable: false,
                            hasDefaultValue: false,
                        }),
                        expect.objectContaining<Partial<ColumnMetadata>>({
                            name: "owner",
                            dataType: "varchar",
                            isNullable: false,
                            hasDefaultValue: false,
                        }),
                        expect.objectContaining<Partial<ColumnMetadata>>({
                            name: "expiration",
                            dataType: "bigint",
                            isNullable: true,
                            hasDefaultValue: false,
                        }),
                    ]),
                }),
            );
        });
        test("Should create readerSemaphore table", async () => {
            const adapter = new KyselySharedLockAdapter({
                kysely,
                shouldRemoveExpiredKeys: false,
            });
            await adapter.init();

            const tables = await kysely.introspection.getTables();

            expect(tables).toContainEqual(
                expect.objectContaining<Partial<TableMetadata>>({
                    name: "readerSemaphore",
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
                    columns: expect.arrayContaining<Partial<ColumnMetadata>>([
                        expect.objectContaining<Partial<ColumnMetadata>>({
                            name: "key",
                            dataType: "varchar",
                            isNullable: false,
                            hasDefaultValue: false,
                        }),
                        expect.objectContaining<Partial<ColumnMetadata>>({
                            name: "limit",
                            dataType: "int",
                            isNullable: false,
                            hasDefaultValue: false,
                        }),
                    ]),
                }),
            );
        });
        test("Should create readerSemaphoreSlot table", async () => {
            const adapter = new KyselySharedLockAdapter({
                kysely,
                shouldRemoveExpiredKeys: false,
            });
            await adapter.init();

            const tables = await kysely.introspection.getTables();

            expect(tables).toContainEqual(
                expect.objectContaining<Partial<TableMetadata>>({
                    name: "readerSemaphoreSlot",
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
                    columns: expect.arrayContaining<Partial<ColumnMetadata>>([
                        expect.objectContaining<Partial<ColumnMetadata>>({
                            name: "key",
                            dataType: "varchar",
                            isNullable: false,
                            hasDefaultValue: false,
                        }),
                        expect.objectContaining<Partial<ColumnMetadata>>({
                            name: "id",
                            dataType: "varchar",
                            isNullable: false,
                            hasDefaultValue: false,
                        }),
                        expect.objectContaining<Partial<ColumnMetadata>>({
                            name: "expiration",
                            dataType: "bigint",
                            isNullable: true,
                            hasDefaultValue: false,
                        }),
                    ]),
                }),
            );
        });
        test("Should not throw error when called multiple times", async () => {
            const adapter = new KyselySharedLockAdapter({
                kysely,
                shouldRemoveExpiredKeys: false,
            });
            await adapter.init();

            const promise = adapter.init();

            await expect(promise).resolves.toBeUndefined();
        });
        test("Should call not setInterval when shouldRemoveExpiredKeys is false", async () => {
            const intervalFn = vi.spyOn(globalThis, "setInterval");

            const adapter = new KyselySharedLockAdapter({
                kysely,
                shouldRemoveExpiredKeys: false,
            });
            await adapter.init();

            expect(intervalFn).not.toHaveBeenCalledTimes(1);
        });
        test("Should call setInterval when shouldRemoveExpiredKeys is true", async () => {
            const intervalFn = vi.spyOn(globalThis, "setInterval");

            const adapter = new KyselySharedLockAdapter({
                kysely,
                shouldRemoveExpiredKeys: true,
            });
            await adapter.init();

            expect(intervalFn).toHaveBeenCalledTimes(1);
            await adapter.deInit();
        });
    });
    describe("method: deInit", () => {
        test("Should remove writer lock table", async () => {
            const adapter = new KyselySharedLockAdapter({
                kysely,
                shouldRemoveExpiredKeys: false,
            });
            await adapter.init();
            await adapter.deInit();

            const tables = await kysely.introspection.getTables();

            expect(tables).not.toContainEqual(
                expect.objectContaining<Partial<TableMetadata>>({
                    name: "writerLock",
                }),
            );
        });
        test("Should remove readerSemaphore table", async () => {
            const adapter = new KyselySharedLockAdapter({
                kysely,
                shouldRemoveExpiredKeys: false,
            });
            await adapter.init();
            await adapter.deInit();

            const tables = await kysely.introspection.getTables();

            expect(tables).not.toContainEqual(
                expect.objectContaining<Partial<TableMetadata>>({
                    name: "readerSemaphore",
                }),
            );
        });
        test("Should remove readerSemaphoreSlot table", async () => {
            const adapter = new KyselySharedLockAdapter({
                kysely,
                shouldRemoveExpiredKeys: false,
            });
            await adapter.init();
            await adapter.deInit();

            const tables = await kysely.introspection.getTables();

            expect(tables).not.toContainEqual(
                expect.objectContaining<Partial<TableMetadata>>({
                    name: "readerSemaphoreSlot",
                }),
            );
        });
        test("Should not throw error when called multiple times", async () => {
            const adapter = new KyselySharedLockAdapter({
                kysely,
                shouldRemoveExpiredKeys: false,
            });
            await adapter.init();
            await adapter.deInit();
            const promise = adapter.deInit();

            await expect(promise).resolves.toBeUndefined();
        });
        test("Should not throw error when called before init", async () => {
            const adapter = new KyselySharedLockAdapter({
                kysely,
                shouldRemoveExpiredKeys: false,
            });
            const promise = adapter.deInit();
            await adapter.init();

            await expect(promise).resolves.toBeUndefined();
        });
        test("Should call not clearInterval when shouldRemoveExpiredKeys is false", async () => {
            const intervalFn = vi.spyOn(globalThis, "clearInterval");

            const adapter = new KyselySharedLockAdapter({
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

            const adapter = new KyselySharedLockAdapter({
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
