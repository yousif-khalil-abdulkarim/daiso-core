/**
 * @module EventBus
 */

import { type ISerde } from "@/serde/contracts/_module";
import type Redis from "ioredis";
import type { IBuildable } from "@/utilities/_module";

/**
 * @group Adapters
 */
export type RedisPubSubEventBusAdapterSettings = {
    dispatcherClient: Redis;
    listenerClient: Redis;
    serde: ISerde<string>;
    rootGroup: string;
};

/**
 * The <i>RedisPubSubEventBusAdapterSettingsBuilder</i> is an immutable builder class, meaning that each method invocation creates a new instance.
 * @group Adapters
 */
export class RedisPubSubEventBusAdapterSettingsBuilder<
    TSettings extends Partial<RedisPubSubEventBusAdapterSettings>,
> implements IBuildable<RedisPubSubEventBusAdapterSettings>
{
    constructor(private readonly settings: TSettings = {} as TSettings) {}

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setDispatcherClient(client: Redis) {
        return new RedisPubSubEventBusAdapterSettingsBuilder({
            ...this.settings,
            dispatcherClient: client,
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setListenerClient(client: Redis) {
        return new RedisPubSubEventBusAdapterSettingsBuilder({
            ...this.settings,
            listenerClient: client,
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setSerde(serde: ISerde<string>) {
        return new RedisPubSubEventBusAdapterSettingsBuilder({
            ...this.settings,
            serde,
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setRootGroup(group: string) {
        return new RedisPubSubEventBusAdapterSettingsBuilder({
            ...this.settings,
            rootGroup: group,
        });
    }

    build(
        this: RedisPubSubEventBusAdapterSettingsBuilder<RedisPubSubEventBusAdapterSettings>,
    ): RedisPubSubEventBusAdapterSettings {
        return this.settings;
    }
}
