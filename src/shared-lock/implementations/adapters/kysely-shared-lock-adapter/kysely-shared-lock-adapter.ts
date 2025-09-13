/**
 * @module SharedLock
 */

import type { IDatabaseSharedLockAdapter } from "@/shared-lock/contracts/_module-exports.js";
import { MysqlAdapter, type Kysely } from "kysely";
import {
    type IDeinitizable,
    type IInitizable,
    type IPrunable,
    TimeSpan,
} from "@/utilities/_module-exports.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/adapters"`
 * @group Adapters
 */
export type KyselySharedLockTable = {};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/adapters"`
 * @group Adapters
 */
export type KyselySharedLockTables = {
    lock: KyselySharedLockTable;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/adapters"`
 * @group Adapters
 */
export type KyselySharedLockAdapterSettings = {
    kysely: Kysely<KyselySharedLockTables>;

    /**
     * @default
     * ```ts
     * TimeSpan.fromMinutes(1)
     * ```
     */
    expiredKeysRemovalInterval?: TimeSpan;

    /**
     * @default true
     */
    shouldRemoveExpiredKeys?: boolean;

    /**
     *  @default
     * ```ts
     * () => new Date()
     * ```
     */
    currentDate?: () => Date;

    /**
     * @default
     * ```ts
     * globalThis.setInterval
     * ```
     */
    setInterval?: typeof setInterval;
};

/**
 * To utilize the `KyselySharedLockAdapter`, you must install the [`"kysely"`](https://www.npmjs.com/package/kysely) package and configure a `Kysely` class instance.
 *
 * Note in order to use `KyselySharedLockAdapter` correctly, ensure you use a single, consistent database across all server instances.
 * The adapter have been tested with `sqlite`, `postgres` and `mysql` databases.
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/adapters"`
 * @group Adapters
 */
export class KyselySharedLockAdapter
    implements IDatabaseSharedLockAdapter, IDeinitizable, IInitizable, IPrunable
{
    private readonly kysely: Kysely<KyselySharedLockTables>;
    private readonly expiredKeysRemovalInterval: TimeSpan;
    private readonly shouldRemoveExpiredKeys: boolean;
    private timeoutId: string | number | NodeJS.Timeout | undefined | null =
        null;
    private readonly currentDate: () => Date;
    private readonly setInterval: typeof setInterval;
    private readonly isMysql: boolean;

    /**
     * @example
     * ```ts
     * import { KyselySharedLockAdapter } from "@daiso-tech/core/shared-lock/adapters";
     * import Sqlite from "better-sqlite3";
     *
     * const lockAdapter = new KyselySharedLockAdapter({
     *   kysely: new Kysely({
     *     dialect: new SqliteDialect({
     *       database: new Sqlite("local.db"),
     *     }),
     *   }),
     * });
     * // You need initialize the adapter once before using it.
     * await lockAdapter.init();
     * ```
     */
    constructor(settings: KyselySharedLockAdapterSettings) {
        const {
            kysely,
            expiredKeysRemovalInterval = TimeSpan.fromMinutes(1),
            shouldRemoveExpiredKeys = true,
            currentDate = () => new Date(),
            setInterval = globalThis.setInterval,
        } = settings;
        this.expiredKeysRemovalInterval = expiredKeysRemovalInterval;
        this.shouldRemoveExpiredKeys = shouldRemoveExpiredKeys;
        this.kysely = kysely;
        this.isMysql =
            this.kysely.getExecutor().adapter instanceof MysqlAdapter;
        this.currentDate = currentDate;
        this.setInterval = setInterval;
    }

    init(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    deInit(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    removeAllExpired(): Promise<void> {
        throw new Error("Method not implemented.");
    }
}
