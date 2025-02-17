/**
 * @module Lock
 */

import type { IGroupableLockProvider } from "@/lock/contracts/lock-provider.contract.js";
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    UnregisteredAdapterError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    DefaultAdapterNotDefinedError,
} from "@/utilities/errors.js";

/**
 * The <i>ILockProviderFactory</i> contract makes it easy to configure and switch between different <i>{@link IGroupableLockProvider}</i> dynamically.
 * @group Contracts
 */
export type ILockProviderFactory<TAdapters extends string = string> = {
    /**
     * The <i>use</i> method will throw an error if you provide it unregisted adapter.
     * If no default adapter is defined an error will be thrown by <i>use</i> method.
     * @throws {UnregisteredAdapterError} {@link UnregisteredAdapterError}
     * @throws {DefaultAdapterNotDefinedError} {@link DefaultAdapterNotDefinedError}
     */
    use(adapterName?: TAdapters): IGroupableLockProvider;
};
