/**
 * @module Cache
 */

import type { IGroupableCache } from "@/cache/contracts/cache.contract";
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    UnregisteredDriverError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    DefaultDriverNotDefinedError,
} from "@/utilities/errors";

/**
 * The <i>ICacheFactory</i> contract makes it easy to configure and switch between different <i>{@link IGroupableCache}</i> dynamically.
 * @group Contracts
 */
export type ICacheFactory<TDrivers extends string = string> = {
    /**
     * The <i>use</i> method will throw an error if you provide it unregisted driver.
     * If no default driver is defined an error will be thrown by <i>use</i> method.
     * @throws {UnregisteredDriverError} {@link UnregisteredDriverError}
     * @throws {DefaultDriverNotDefinedError} {@link DefaultDriverNotDefinedError}
     * @example
     * ```ts
     * import { type ICacheFactory } from "@daiso-tech/core";
     * import Redis from "ioredis"
     *
     * // Asume the inputed cacheFactory has registered both a memory and Redis ICacheAdapter.
     * // The memory ICacheAdapter adapter is the default.
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
    use<TType = unknown>(driverName?: TDrivers): IGroupableCache<TType>;
};
