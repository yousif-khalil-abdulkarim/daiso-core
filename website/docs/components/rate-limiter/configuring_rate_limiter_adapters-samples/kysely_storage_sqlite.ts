import { TimeSpan } from "eridu-tech/time-span";
import { KyselyRateLimiterStorageAdapter } from "eridu-tech/rate-limiter/kysely-rate-limiter-storage-adapter";
import Sqlite from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";
import { serde } from "./serde_instance";

const database = new Sqlite("DATABASE_NAME.db");
const kysely = new Kysely<any>({
    dialect: new SqliteDialect({
        database,
    }),
});
export const kyselyRateLimiterStorageAdapter = new KyselyRateLimiterStorageAdapter({
    kysely,
    serde,
});

// You need initialize the adapter once before using it.
// During the initialization the schema will be created
await kyselyRateLimiterStorageAdapter.init();
