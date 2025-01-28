/**
 * @module Cache
 */

import type { IBuildable } from "@/utilities/_module";
import type { CollectionOptions, Db, ObjectId } from "mongodb";
import type { ISerde } from "@/serde/contracts/_module";
// eslint-disable-next-line @typescript-eslint/no-unused-vars

/**
 * @internal
 */
export type MongodbCacheDocument = {
    _id: ObjectId;
    key: string;
    group: string;
    value: number | string;
    expiresAt: Date | null;
};

/**
 * @group Adapters
 */
export type MongodbCacheAdapterSettings = {
    database: Db;
    serde: ISerde<string>;
    rootGroup: string;
    collectionName?: string;
    collectionSettings?: CollectionOptions;
};

/**
 * The <i>MongodbCacheAdapterSettingsBuilder</i> is an immutable builder class, meaning that each method invocation creates a new instance.
 * @group Adapters
 */
export class MongodbCacheAdapterSettingsBuilder<
    TSettings extends Partial<MongodbCacheAdapterSettings>,
> implements IBuildable<MongodbCacheAdapterSettings>
{
    constructor(private readonly settings: TSettings = {} as TSettings) {}

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setDatabase(database: Db) {
        return new MongodbCacheAdapterSettingsBuilder({
            ...this.settings,
            database,
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setSerde(serde: ISerde<string>) {
        return new MongodbCacheAdapterSettingsBuilder({
            ...this.settings,
            serde,
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setRootGroup(group: string) {
        return new MongodbCacheAdapterSettingsBuilder({
            ...this.settings,
            rootGroup: group,
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setCollectionName(name: string) {
        return new MongodbCacheAdapterSettingsBuilder({
            ...this.settings,
            collectionName: name,
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setCollectionSettings(settings: CollectionOptions) {
        return new MongodbCacheAdapterSettingsBuilder({
            ...this.settings,
            collectionSettings: settings,
        });
    }

    build(
        this: MongodbCacheAdapterSettingsBuilder<MongodbCacheAdapterSettings>,
    ): MongodbCacheAdapterSettings {
        return this.settings;
    }
}
