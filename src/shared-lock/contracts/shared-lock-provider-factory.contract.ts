/**
 * @module SharedLock
 */

import type { ISharedLockProvider } from "@/shared-lock/contracts/shared-lock-provider.contract.js";
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    UnregisteredAdapterError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    DefaultAdapterNotDefinedError,
} from "@/utilities/_module-exports.js";

/**
 * The `ISharedLockProviderFactory` contract makes it easy to configure and switch between different {@link ISharedLockProvider | `ISharedLockProvider`} dynamically.
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Contracts
 */
export type ISharedLockProviderFactory<TAdapters extends string = string> = {
    /**
     * The `use` method will throw an error if you provide it unregisted adapter.
     * If no default adapter is defined an error will be thrown by `use` method.
     * @throws {UnregisteredAdapterError} {@link UnregisteredAdapterError}
     * @throws {DefaultAdapterNotDefinedError} {@link DefaultAdapterNotDefinedError}
     */
    use(adapterName?: TAdapters): ISharedLockProvider;
};
