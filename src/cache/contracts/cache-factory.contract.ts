/**
 * @module Cache
 */

import type { INamespacedCache } from "@/cache/contracts/cache.contract";
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    UnregisteredDriverError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    DefaultDriverNotDefinedError,
} from "@/utilities/errors";

/**
 * The <i>ICacheFactory</i> contract makes it easy to configure and switch between different <i>{@link INamespacedCache}</i> dynamically.
 * @group Contracts
 */
export type ICacheFactory<TDrivers extends string = string, TType = unknown> = {
    /**
     * The <i>use</i> method will throw an error if you provide it unregisted driver.
     * If no default driver is defined an error will be thrown by <i>use</i> method.
     * @throws {UnregisteredDriverError} {@link UnregisteredDriverError}
     * @throws {DefaultDriverNotDefinedError} {@link DefaultDriverNotDefinedError}
     * @example
     * ```ts
     * import { type ICacheFactory } from "@daiso-tech/core";
     *
     * async function main(cacheFactory: ICacheFactory): Promise<void> {
     *   // Will add key using the default driver
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
    use(driverName?: TDrivers): INamespacedCache<TType>;

    /**
     * The <i>withTypes</i> method is used to set the value types of the cache.
     * @example
     * ```ts
     * import { type ICacheFactory zodValidator } from "@daiso-tech/core";
     *
     * async function main(cacheFactory: ICacheFactory): Promise<void> {
     *   await cacheFactory
     *     .withTypes<string>()
     *     .use()
     *     // You will se an typescript error
     *     .add("a", 1)
     * }
     * ```
     */
    withType<TOutput extends TType = TType>(): ICacheFactory<TDrivers, TOutput>;
};
