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
     * @example
     * ```ts
     * import type { ILockProviderFactory } from "@daiso-tech/core";
     *
     * // Asume the inputed lockProviderFactory has registered both a memory and Redis ILockAdapter.
     * // The memory ILockAdapter adapter is the default.
     * async function main(lockProviderFactory: ILockProviderFactory): Promise<void> {
     *   // Will create and acquire the lock with default adapter
     *   await lockProviderFactory
     *     .use()
     *     .create("a")
     *     .acquireOrFail();
     *   // Will create and acquire the lock with redis addapter
     *   await lockProviderFactory
     *     .use("redis")
     *     .create("a")
     *     .acquireOrFail();
     * }
     * ```
     */
    use(adapterName?: TAdapters): IGroupableLockProvider;
};
