import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { databaseLockAdapterTestSuite } from "@/lock/implementations/test-utilities/_module-exports.js";
import { KyselyLockAdapter } from "@/lock/implementations/adapters/kysely-lock-adapter/_module.js";
import { Kysely, PostgresDialect } from "kysely";
import type { StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { Pool } from "pg";
import { TimeSpan } from "@/utilities/_module-exports.js";

const timeout = TimeSpan.fromMinutes(2);
describe("postgres class: KyselyLockAdapter", () => {
    let database: Pool;
    let container: StartedPostgreSqlContainer;
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
    }, timeout.toMilliseconds());
    afterEach(async () => {
        await database.end();
        await container.stop();
    }, timeout.toMilliseconds());
    databaseLockAdapterTestSuite({
        createAdapter: async () => {
            const adapter = new KyselyLockAdapter({
                kysely: new Kysely({
                    dialect: new PostgresDialect({
                        pool: database,
                    }),
                }),
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
});
