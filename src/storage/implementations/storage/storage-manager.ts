/**
 * @module Storage
 */

import type {
    INamespacedStorage,
    IStorageAdapter,
    IStorageManager,
    StorageManagerUseSettings,
} from "@/storage/contracts/_module";
import {
    Storage,
    type StorageSettings,
} from "@/storage/implementations/storage/storage";

/**
 * @group Derivables
 */
export type StorageManagerSettings<TAdapters extends string = string> = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    adapters: Record<TAdapters, IStorageAdapter<any>>;
    defaultAdapter: NoInfer<TAdapters>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    adapterSettings?: Omit<StorageSettings<any>, "validator">;
};

/**
 * @group Derivables
 */
export class StorageManager<TAdapters extends string = string>
    implements IStorageManager<TAdapters>
{
    private readonly adapters: Record<TAdapters, IStorageAdapter<unknown>>;
    private readonly defaultAdapter: TAdapters;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly adapterSettings: Omit<StorageSettings<any>, "validator">;

    constructor(settings: StorageManagerSettings<TAdapters>) {
        const { adapters, defaultAdapter, adapterSettings = {} } = settings;
        this.adapters = adapters;
        this.defaultAdapter = defaultAdapter;
        this.adapterSettings = adapterSettings;
    }

    use<TType>(
        adapterSettings: StorageManagerUseSettings<TType, TAdapters> = {},
    ): INamespacedStorage<TType> {
        const { adapter = this.defaultAdapter, validator } = adapterSettings;
        return new Storage(this.adapters[adapter], {
            ...this.adapterSettings,
            validator,
        });
    }
}
