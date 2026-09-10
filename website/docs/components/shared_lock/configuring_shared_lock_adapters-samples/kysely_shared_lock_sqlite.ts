import { KyselySharedLockAdapter } from "eridu-tech/shared-lock/kysely-shared-lock-adapter";
import Sqlite from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";

const database = new Sqlite("DATABASE_NAME.db");
const kysely = new Kysely<any>({
    dialect: new SqliteDialect({
        database,
    }),
});
export const kyselySharedLockAdapter = new KyselySharedLockAdapter({
    kysely,
});

// You need initialize the adapter once before using it.
// During the initialization the schema will be created
await kyselySharedLockAdapter.init();
