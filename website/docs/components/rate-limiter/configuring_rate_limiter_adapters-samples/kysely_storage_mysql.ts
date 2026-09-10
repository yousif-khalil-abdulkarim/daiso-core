import { TimeSpan } from "eridu-tech/time-span";
import { KyselyRateLimiterStorageAdapter } from "eridu-tech/rate-limiter/kysely-rate-limiter-storage-adapter";
import { createPool } from "mysql2";
import { Kysely, MysqlDialect } from "kysely";
import { serde } from "./serde_instance.js";

const database = createPool({
    host: "DATABASE_HOST",
    // Database port
    port: 3306,
    database: "DATABASE_NAME",
    user: "DATABASE_USER",
    password: "DATABASE_PASSWORD",
    connectionLimit: 10,
});
const kysely = new Kysely<any>({
    dialect: new MysqlDialect({
        pool: database,
    }),
});
const kyselyRateLimiterStorageAdapter = new KyselyRateLimiterStorageAdapter({
    kysely,
    serde,
});

// You need initialize the adapter once before using it.
// During the initialization the schema will be created
await kyselyRateLimiterStorageAdapter.init();
