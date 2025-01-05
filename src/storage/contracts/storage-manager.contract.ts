/**
 * @module Storage
 */

import type { Validator } from "@/utilities/_module";
import type { INamespacedStorage } from "@/storage/contracts/storage.contract";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { IStorageAdapter } from "@/storage/contracts/storage-adapter.contract";

/**
 * The <i>IStorageFactory</i> contract makes it easy to switch between different <i>{@link IStorageAdapter | storage adapters}</i> dynamically.
 * @group Contracts
 */
export type IStorageFactory<
    TAdapters extends string = string,
    TType = unknown,
> = {
    /**
     * @example
     * ```ts
     * import { StorageManager, MemoryStorageAdapter, RedisStorageAdapter } from "@daiso-tech/core";
     * import Redis from "ioredis";
     *
     * const storageManager = new StorageManager({
     *   adapters: {
     *     memory: new MemoryStorageAdapter(),
     *     redis: new RedisStorageAdapter(new Redis()),
     *   },
     *   defaultAdapter: "memory",
     *   rootNamespace: "@storage/"
     * });
     *
     * (async () => {
     *   // Will add key using the default adapter which is the memory addapter
     *   await storageManager
     *     .use()
     *     .add("a", 1);
     *   // Will add key using the redis addapter
     *   await storageManager
     *     .use("redis")
     *     .add("a", 1);
     * })();
     * ```
     */
    use(adapter?: TAdapters): INamespacedStorage<TType>;
};

/**
 * The <i>IStorageManager</i> contract makes it easy to configure and switch between different <i>{@link IStorageAdapter | storage adapters}</i> dynamically.
 * @group Contracts
 */
export type IStorageManager<
    TAdapters extends string = string,
    TType = unknown,
> = IStorageFactory<TAdapters, TType> & {
    /**
     * The <i>withValidation</i> method is used to set a <i>validator</i>, which validates the storage values during runtime.
     * The type is inferred from the provided <i>validator</i>.
     * @example
     * ```ts
     * import { StorageManager, MemoryStorageAdapter, RedisStorageAdapter, zodValidator } from "@daiso-tech/core";
     * import Redis from "ioredis";
     * import { z } from "zod"
     *
     * const storageManager = new StorageManager({
     *   adapters: {
     *     memory: new MemoryStorageAdapter(),
     *     redis: new RedisStorageAdapter(new Redis()),
     *   },
     *   defaultAdapter: "memory",
     *   rootNamespace: "@storage/"
     * });
     *
     * (async () => {
     *   await storageManager
     *     .withValidation(zodValidator(z.string()))
     *     .use()
     *     // You will se an typescript error and get runtime erorr
     *     .add("a", 1);
     * })();
     * ```
     */
    withValidation<TOutput extends TType = TType>(
        validator: Validator<TOutput>,
    ): IStorageFactory<TAdapters, TOutput>;

    /**
     * The <i>withTypes</i> method is used to set the value types of the storage.
     * @example
     * ```ts
     * import { StorageManager, MemoryStorageAdapter, RedisStorageAdapter, zodValidator } from "@daiso-tech/core";
     * import Redis from "ioredis";
     * import { z } from "zod"
     *
     * const storageManager = new StorageManager({
     *   adapters: {
     *     memory: new MemoryStorageAdapter(),
     *     redis: new RedisStorageAdapter(new Redis()),
     *   },
     *   defaultAdapter: "memory",
     *   rootNamespace: "@storage/"
     * });
     *
     * (async () => {
     *   await storageManager
     *     .withTypes<string>()
     *     .use()
     *     // You will se an typescript error
     *     .add("a", 1)
     * })();
     * ```
     */
    withType<TOutput extends TType = TType>(): IStorageFactory<
        TAdapters,
        TOutput
    >;
};
