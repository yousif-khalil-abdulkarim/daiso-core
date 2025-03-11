/**
 * @module Utilities
 */

import type { NoneFunc } from "@/utilities/types/none-func.type.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type SyncFactoryFn<TInput, TOutput> = (
    value: TInput,
) => NoneFunc<TOutput>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type AsyncFactoryFn<TInput, TOutput> = (
    value: TInput,
) => PromiseLike<NoneFunc<TOutput>>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type FactoryFn<TInput, TOutput> =
    | SyncFactoryFn<TInput, TOutput>
    | AsyncFactoryFn<TInput, TOutput>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type ISyncFactoryObject<TInput, TOutput> = {
    use(value: TInput): NoneFunc<TOutput>;
};

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type IAsyncFactoryObject<TInput, TOutput> = {
    use(value: TInput): PromiseLike<NoneFunc<TOutput>>;
};

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type IFactoryObject<TInput, TOutput> =
    | ISyncFactoryObject<TInput, TOutput>
    | IAsyncFactoryObject<TInput, TOutput>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type Factory<TInput, TOutput> =
    | FactoryFn<TInput, TOutput>
    | IFactoryObject<TInput, TOutput>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type Factoryable<TInput, TOutput> =
    | NoneFunc<TOutput>
    | Factory<TInput, TOutput>;
