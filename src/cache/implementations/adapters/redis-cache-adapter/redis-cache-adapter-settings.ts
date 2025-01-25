/**
 * @module Cache
 */

import type { IBuildable, OneOrMore } from "@/utilities/_module";
import type { Redis } from "ioredis";
import type { ISerde } from "@/serde/contracts/_module";
import {
    RedisSerde,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type SuperJsonSerde,
} from "@/serde/implementations/_module";

/**
 * @group Adapters
 */
export type RedisCacheAdapterSettings = {
    database: Redis;
    serde: ISerde<string>;
    rootGroup: OneOrMore<string>;
};

/**
 * The <i>RedisCacheAdapterSettingsBuilder</i> is an immutable builder class, meaning that each method invocation creates a new instance.
 * @group Adapters
 */
export class RedisCacheAdapterSettingsBuilder<
    TSettings extends Partial<RedisCacheAdapterSettings>,
> implements IBuildable<RedisCacheAdapterSettings>
{
    constructor(private readonly settings: TSettings = {} as TSettings) {}

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setDatabase(database: Redis) {
        return new RedisCacheAdapterSettingsBuilder({
            ...this.settings,
            database,
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setSerde(serde: ISerde<string>) {
        return new RedisCacheAdapterSettingsBuilder({
            ...this.settings,
            serde,
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setRootGroup(group: OneOrMore<string>) {
        return new RedisCacheAdapterSettingsBuilder({
            ...this.settings,
            rootGroup: group,
        });
    }

    build(
        this: RedisCacheAdapterSettingsBuilder<RedisCacheAdapterSettings>,
    ): RedisCacheAdapterSettings {
        return this.settings;
    }
}
