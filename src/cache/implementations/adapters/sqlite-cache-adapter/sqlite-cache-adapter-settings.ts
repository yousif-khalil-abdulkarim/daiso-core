/**
 * @module Cache
 */

import type { ISerde } from "@/serde/contracts/_module";
import type { TimeSpan, OneOrMore, IBuildable } from "@/utilities/_module";
import { type SqliteDatabase } from "kysely";

/**
 * @group Adapters
 */
export type SqliteCacheAdapterSettings = {
    database: SqliteDatabase;
    tableName?: string;
    serde: ISerde<string>;
    enableTransactions?: boolean;
    expiredKeysRemovalInterval?: TimeSpan;
    shouldRemoveExpiredKeys?: boolean;
    rootGroup: OneOrMore<string>;
};

/**
 * The <i>SqliteCacheAdapterSettingsBuilder</i> is an immutable builder class, meaning that each method invocation creates a new instance.
 * @group Adapters
 */
export class SqliteCacheAdapterSettingsBuilder<
    TSettings extends Partial<SqliteCacheAdapterSettings>,
> implements IBuildable<SqliteCacheAdapterSettings>
{
    constructor(private readonly settings: TSettings = {} as TSettings) {}

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setDatabase(database: SqliteDatabase) {
        return new SqliteCacheAdapterSettingsBuilder({
            ...this.settings,
            database,
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setTableName(name: string) {
        return new SqliteCacheAdapterSettingsBuilder({
            ...this.settings,
            tableName: name,
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setSerde(serde: ISerde<string>) {
        return new SqliteCacheAdapterSettingsBuilder({
            ...this.settings,
            serde,
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setEnableTransactions(enable: boolean) {
        return new SqliteCacheAdapterSettingsBuilder({
            ...this.settings,
            enableTransactions: enable,
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setExpiredKeysRemovalInterval(interval: TimeSpan) {
        return new SqliteCacheAdapterSettingsBuilder({
            ...this.settings,
            expiredKeysRemovalInterval: interval,
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setShouldRemoveExpiredKeys(shouldRemove: boolean) {
        return new SqliteCacheAdapterSettingsBuilder({
            ...this.settings,
            shouldRemoveExpiredKeys: shouldRemove,
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setRootGroup(group: OneOrMore<string>) {
        return new SqliteCacheAdapterSettingsBuilder({
            ...this.settings,
            rootGroup: group,
        });
    }

    build(
        this: SqliteCacheAdapterSettingsBuilder<SqliteCacheAdapterSettings>,
    ): SqliteCacheAdapterSettings {
        return this.settings;
    }
}
