/**
 * @module Cache
 */

import type { IGroupableCache } from "@/cache/contracts/cache.contract";
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    UnregisteredAdapterError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    DefaultAdapterNotDefinedError,
} from "@/utilities/errors";

/**
 * The <i>ICacheFactory</i> contract makes it easy to configure and switch between different <i>{@link IGroupableCache}</i> dynamically.
 * @group Contracts
 */
export type ICacheFactory<TAdapters extends string = string> = {
    /**
     * The <i>use</i> method will throw an error if you provide it unregisted adapter.
     * If no default adapter is defined an error will be thrown by <i>use</i> method.
     * @throws {UnregisteredAdapterError} {@link UnregisteredAdapterError}
     * @throws {DefaultAdapterNotDefinedError} {@link DefaultAdapterNotDefinedError}
     * @example
     * ```ts
     * import type { ICacheFactory } from "@daiso-tech/core";
     *
     * // Asume the inputed cacheFactory has registered both a memory and Redis ICacheAdapter.
     * // The memory ICacheAdapter adapter is the default.
     * async function main(cacheFactory: ICacheFactory): Promise<void> {
     *   // Will add key using the default adapter
     *   await cacheFactory
     *     .use()
     *     .add("a", 1);
     *   // Will add key using the redis addapter
     *   await cacheFactory
     *     .use("redis")
     *     .add("a", 1);
     * }
     * ```
     */
    use<TType = unknown>(adapterName?: TAdapters): IGroupableCache<TType>;
};
