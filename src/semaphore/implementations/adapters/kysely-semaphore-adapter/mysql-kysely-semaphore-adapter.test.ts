import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { databaseSemaphoreAdapterTestSuite } from "@/semaphore/implementations/test-utilities/_module-exports.js";
import { KyselySemaphoreAdapter } from "@/semaphore/implementations/adapters/kysely-semaphore-adapter/_module.js";
import { Kysely, MysqlDialect } from "kysely";
import type { StartedMySqlContainer } from "@testcontainers/mysql";
import { MySqlContainer } from "@testcontainers/mysql";
import { createPool, type Pool } from "mysql2";
import { TimeSpan } from "@/utilities/_module-exports.js";

const timeout = TimeSpan.fromMinutes(2);
describe("mysql class: KyselySemaphoreAdapter", () => {
    let database: Pool;
    let container: StartedMySqlContainer;
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
    databaseSemaphoreAdapterTestSuite({
        createAdapter: async () => {
            const adapter = new KyselySemaphoreAdapter({
                kysely: new Kysely({
                    dialect: new MysqlDialect({
                        pool: database,
                    }),
                }),
                shouldRemoveExpiredSemaphores: false,
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
