/**
 * @module EventBus
 */

import type { IBuildable } from "@/utilities/_module";
import type { EventEmitter } from "node:events";

/**
 * @group Adapters
 */
export type MemoryEventBusAdapterSettings = {
    rootGroup: string;
    eventEmitter?: EventEmitter;
};

/**
 * The <i>MemoryEventBusAdapterSettingsBuilder</i> is an immutable builder class, meaning that each method invocation creates a new instance.
 * @group Adapters
 */
export class MemoryEventBusAdapterSettingsBuilder<
    TSettings extends Partial<MemoryEventBusAdapterSettings>,
> implements IBuildable<MemoryEventBusAdapterSettings>
{
    constructor(private readonly settings: TSettings = {} as TSettings) {}

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setEventEmitter(eventEmitter: EventEmitter) {
        return new MemoryEventBusAdapterSettingsBuilder({
            ...this.settings,
            eventEmitter,
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setRootGroup(group: string) {
        return new MemoryEventBusAdapterSettingsBuilder({
            ...this.settings,
            rootGroup: group,
        });
    }

    build(
        this: MemoryEventBusAdapterSettingsBuilder<MemoryEventBusAdapterSettings>,
    ): MemoryEventBusAdapterSettings {
        return this.settings;
    }
}
