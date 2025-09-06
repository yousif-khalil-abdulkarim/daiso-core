import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { databaseSharedLockAdapterTestSuite } from "@/shared-lock/implementations/test-utilities/_module-exports.js";
import {
    KyselySharedLockAdapter,
    type KyselySharedLockTables,
} from "@/shared-lock/implementations/adapters/kysely-shared-lock-adapter/_module.js";
import { Kysely, PostgresDialect } from "kysely";
import type { StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { Pool } from "pg";
import { TimeSpan } from "@/utilities/_module-exports.js";

const timeout = TimeSpan.fromMinutes(2);
describe("postgres class: KyselySharedLockAdapter", () => {
    let database: Pool;
    let container: StartedPostgreSqlContainer;
    let kysely: Kysely<KyselySharedLockTables>;

    beforeEach(async () => {
        try {
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
        } catch (error: unknown) {
            console.log("ERROR:", error);
            throw error;
        }
    }, timeout.toMilliseconds());
    afterEach(async () => {
        await database.end();
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
        test.todo("Write tests!!!");
    });
    describe("method: init", () => {
        test.todo("Write tests!!!");
    });
    describe("method: deInit", () => {
        test.todo("Write tests!!!");
    });
});
