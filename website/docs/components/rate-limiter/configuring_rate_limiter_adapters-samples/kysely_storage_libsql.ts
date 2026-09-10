import { TimeSpan } from "eridu-tech/time-span";
import { KyselyRateLimiterStorageAdapter } from "eridu-tech/rate-limiter/kysely-rate-limiter-storage-adapter";
import { LibsqlDialect } from "@libsql/kysely-libsql";
import { Kysely } from "kysely";
import { serde } from "./serde_instance";

const kysely = new Kysely<any>({
    dialect: new LibsqlDialect({
        url: "DATABASE_URL",
    }),
});
const kyselyRateLimiterStorageAdapter = new KyselyRateLimiterStorageAdapter({
    kysely,
    serde,
});

// You need initialize the adapter once before using it.
// During the initialization the schema will be created
await kyselyRateLimiterStorageAdapter.init();
