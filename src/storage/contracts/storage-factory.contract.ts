/**
 * @module Storage
 */

import type { Validator } from "@/utilities/_module";
import type { INamespacedStorage } from "@/storage/contracts/storage.contract";
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    UnregisteredDriverError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    DefaultDriverNotDefinedError,
} from "@/utilities/global-errors";

/**
 * The <i>IStorageFactory</i> contract makes it easy to configure and switch between different <i>{@link INamespacedStorage}</i> dynamically.
 * @group Contracts
 */
export type IStorageFactory<
    TDrivers extends string = string,
    TType = unknown,
> = {
    /**
     * The <i>use</i> method will throw an error if you provide it unregisted driver.
     * If no default driver is defined an error will be thrown by <i>use</i> method.
     * @throws {UnregisteredDriverError} {@link UnregisteredDriverError}
     * @throws {DefaultDriverNotDefinedError} {@link DefaultDriverNotDefinedError}
     * @example
     * ```ts
     * import { type IStorageFactory } from "@daiso-tech/core";
     *
     * async function main(storageFactory: IStorageFactory): Promise<void> {
     *   // Will add key using the default driver
     *   await storageFactory
     *     .use()
     *     .add("a", 1);
     *   // Will add key using the redis addapter
     *   await storageFactory
     *     .use("redis")
     *     .add("a", 1);
     * }
     * ```
     */
    use(driverName?: TDrivers): INamespacedStorage<TType>;

    /**
     * The <i>withValidation</i> method is used to set a <i>validator</i>, which validates the storage values during runtime.
     * The type is inferred from the provided <i>validator</i>.
     * @example
     * ```ts
     * import { type IStorageFactory, zodValidator } from "@daiso-tech/core";
     * import { z } from "zod"
     *
     * async function main(storageFactory: IStorageFactory): Promise<void> {
     *   await storageFactory
     *     .withValidation(zodValidator(z.string()))
     *     .use()
     *     // You will se an typescript error and get runtime erorr
     *     .add("a", 1);
     * }
     * ```
     */
    withValidation<TOutput extends TType = TType>(
        validator: Validator<TOutput>,
    ): IStorageFactory<TDrivers, TOutput>;

    /**
     * The <i>withTypes</i> method is used to set the value types of the storage.
     * @example
     * ```ts
     * import { type IStorageFactory zodValidator } from "@daiso-tech/core";
     *
     * async function main(storageFactory: IStorageFactory): Promise<void> {
     *   await storageFactory
     *     .withTypes<string>()
     *     .use()
     *     // You will se an typescript error
     *     .add("a", 1)
     * }
     * ```
     */
    withType<TOutput extends TType = TType>(): IStorageFactory<
        TDrivers,
        TOutput
    >;
};
