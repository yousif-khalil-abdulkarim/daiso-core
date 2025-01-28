/**
 * @module Cache
 */

import type { ISerde } from "@/serde/contracts/_module";
import type { TimeSpan, IBuildable } from "@/utilities/_module";
import type { Client } from "@libsql/client";

/**
 * @group Adapters
 */
export type LibsqlCacheAdapterSettings = {
    database: Client;
    tableName?: string;
    serde: ISerde<string>;
    enableTransactions?: boolean;
    expiredKeysRemovalInterval?: TimeSpan;
    shouldRemoveExpiredKeys?: boolean;
    rootGroup: string;
};

/**
 * The <i>LibsqlCacheAdapterSettingsBuilder</i> is an immutable builder class, meaning that each method invocation creates a new instance.
 * @group Adapters
 */
export class LibsqlCacheAdapterSettingsBuilder<
    TSettings extends Partial<LibsqlCacheAdapterSettings>,
> implements IBuildable<LibsqlCacheAdapterSettings>
{
    constructor(private readonly settings: TSettings = {} as TSettings) {}

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setDatabase(database: Client) {
        return new LibsqlCacheAdapterSettingsBuilder({
            ...this.settings,
            database,
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setTableName(name: string) {
        return new LibsqlCacheAdapterSettingsBuilder({
            ...this.settings,
            tableName: name,
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setSerde(serde: ISerde<string>) {
        return new LibsqlCacheAdapterSettingsBuilder({
            ...this.settings,
            serde,
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setEnableTransactions(enable: boolean) {
        return new LibsqlCacheAdapterSettingsBuilder({
            ...this.settings,
            enableTransactions: enable,
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setExpiredKeysRemovalInterval(interval: TimeSpan) {
        return new LibsqlCacheAdapterSettingsBuilder({
            ...this.settings,
            expiredKeysRemovalInterval: interval,
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setShouldRemoveExpiredKeys(shouldRemove: boolean) {
        return new LibsqlCacheAdapterSettingsBuilder({
            ...this.settings,
            shouldRemoveExpiredKeys: shouldRemove,
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setRootGroup(group: string) {
        return new LibsqlCacheAdapterSettingsBuilder({
            ...this.settings,
            rootGroup: group,
        });
    }

    build(
        this: LibsqlCacheAdapterSettingsBuilder<LibsqlCacheAdapterSettings>,
    ): LibsqlCacheAdapterSettings {
        return this.settings;
    }
}
