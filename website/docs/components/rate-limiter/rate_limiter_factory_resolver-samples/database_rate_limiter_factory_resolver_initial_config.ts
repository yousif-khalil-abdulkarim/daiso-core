import { DatabaseRateLimiterFactoryResolver } from "eridu-tech/rate-limiter";
import { MemoryRateLimiterStorageAdapter } from "eridu-tech/rate-limiter/memory-rate-limiter-storage-adapter";
import { KyselyRateLimiterStorageAdapter } from "eridu-tech/rate-limiter/kysely-rate-limiter-storage-adapter";
import { Serde } from "eridu-tech/serde";
import { SuperJsonSerdeAdapter } from "eridu-tech/serde/super-json-serde-adapter";
import Sqlite from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";

const serde = new Serde(new SuperJsonSerdeAdapter());
export const rateLimiterFactoryResolver = new DatabaseRateLimiterFactoryResolver({
    serde,
    adapters: {
        memory: new MemoryRateLimiterStorageAdapter(),
        sqlite: new KyselyRateLimiterStorageAdapter({
            kysely: new Kysely({
                dialect: new SqliteDialect({
                    database: new Sqlite("local.db"),
                }),
            }),
            serde,
        }),
    },
    defaultAdapter: "memory",
});
