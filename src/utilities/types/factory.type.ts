/**
 * @module Utilities
 */

import type { NoneFunc } from "@/utilities/types/none-func.type.js";
import type { Promisable } from "@/utilities/types/promiseable.type.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type NEW_FactoryFn<TInput, TOutput> = (
    value: TInput,
) => NoneFunc<TOutput>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type NEW_IFactoryObject<TInput, TOutput> = {
    use(value: TInput): NoneFunc<TOutput>;
};

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type NEW_Factory<TInput, TOutput> =
    | NEW_FactoryFn<TInput, TOutput>
    | NEW_IFactoryObject<TInput, TOutput>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type NEW_Factoryable<TInput, TOutput> =
    | TOutput
    | NEW_Factory<TInput, TOutput>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type NEW_AsyncFactoryFn<TInput, TOutput> = (
    value: TInput,
) => Promisable<NoneFunc<TOutput>>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type NEW_IAsyncFactoryObject<TInput, TOutput> = {
    use(value: TInput): Promisable<NoneFunc<TOutput>>;
};

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type NEW_AsyncFactory<TInput, TOutput> =
    | NEW_AsyncFactoryFn<TInput, TOutput>
    | NEW_IAsyncFactoryObject<TInput, TOutput>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type NEW_AsyncFactoryable<TInput, TOutput> =
    | TOutput
    | NEW_AsyncFactory<TInput, TOutput>;
