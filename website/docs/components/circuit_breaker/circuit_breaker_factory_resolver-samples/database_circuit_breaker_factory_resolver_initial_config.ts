import { DatabaseCircuitBreakerFactoryResolver } from "eridu-tech/circuit-breaker";
import { MemoryCircuitBreakerStorageAdapter } from "eridu-tech/circuit-breaker/memory-circuit-breaker-storage-adapter";
import { KyselyCircuitBreakerStorageAdapter } from "eridu-tech/circuit-breaker/kysely-circuit-breaker-storage-adapter";
import { Serde } from "eridu-tech/serde";
import { SuperJsonSerdeAdapter } from "eridu-tech/serde/super-json-serde-adapter";
import Sqlite from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";

const serde = new Serde(new SuperJsonSerdeAdapter());
export const circuitBreakerFactoryResolver = new DatabaseCircuitBreakerFactoryResolver({
    serde,
    adapters: {
        memory: new MemoryCircuitBreakerStorageAdapter(),
        sqlite: new KyselyCircuitBreakerStorageAdapter({
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
