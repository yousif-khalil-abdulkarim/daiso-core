/* eslint-disable @typescript-eslint/require-await */
/**
 * @module Cache
 */

import type { IBuildable } from "@/utilities/_module";
import { type OneOrMore } from "@/utilities/_module";

/**
 * @group Adapters
 */
export type MemoryCacheAdapterSettings = {
    rootGroup: OneOrMore<string>;
    map?: Map<string, unknown>;
};

/**
 * The <i>MemoryCacheAdapterSettingsBuilder</i> is an immutable builder class, meaning that each method invocation creates a new instance.
 * @group Adapters
 */
export class MemoryCacheAdapterSettingsBuilder<
    TSettings extends Partial<MemoryCacheAdapterSettings>,
> implements IBuildable<MemoryCacheAdapterSettings>
{
    constructor(private readonly settings: TSettings = {} as TSettings) {}

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setMap(map: Map<string, unknown>) {
        return new MemoryCacheAdapterSettingsBuilder({
            ...this.settings,
            map,
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setRootGroup(group: OneOrMore<string>) {
        return new MemoryCacheAdapterSettingsBuilder({
            ...this.settings,
            rootGroup: group,
        });
    }

    build(
        this: MemoryCacheAdapterSettingsBuilder<MemoryCacheAdapterSettings>,
    ): MemoryCacheAdapterSettings {
        return this.settings;
    }
}
