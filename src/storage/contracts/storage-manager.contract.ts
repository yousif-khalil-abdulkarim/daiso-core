/**
 * @module Storage
 */

import type { Validator } from "@/utilities/_module";
import type { INamespacedStorage } from "@/storage/contracts/storage.contract";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { IStorageAdapter } from "@/storage/contracts/storage-adapter.contract";

/**
 * @group Contracts
 */
export type StorageManagerUseSettings<
    TType,
    TAdapters extends string = string,
> = {
    adapter?: TAdapters;
    validator?: Validator<TType>;
};

/**
 * The <i>IStorageManager</i> contract makes it easy to switch between different <i>{@link IStorageAdapter | storage adapters}</i> dynamically.
 * @group Contracts
 */
export type IStorageManager<TAdapters extends string = string> = {
    use<TType>(
        settings?: StorageManagerUseSettings<TType, TAdapters>,
    ): INamespacedStorage<TType>;
};
