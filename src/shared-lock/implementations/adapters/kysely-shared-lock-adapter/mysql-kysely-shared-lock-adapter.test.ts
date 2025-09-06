import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { databaseSharedLockAdapterTestSuite } from "@/shared-lock/implementations/test-utilities/_module-exports.js";
import {
    KyselySharedLockAdapter,
    type KyselySharedLockTables,
} from "@/shared-lock/implementations/adapters/kysely-shared-lock-adapter/_module.js";
import { Kysely, MysqlDialect } from "kysely";
import type { StartedMySqlContainer } from "@testcontainers/mysql";
import { MySqlContainer } from "@testcontainers/mysql";
import { createPool, type Pool } from "mysql2";
import { TimeSpan } from "@/utilities/_module-exports.js";

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
        test.todo("Write tests!!!");
    });
    describe("method: init", () => {
        test.todo("Write tests!!!");
    });
    describe("method: deInit", () => {
        test.todo("Write tests!!!");
    });
});
