/**
 * @module Utilities
 */

import type { NoneFunction } from "@/utilities/types/func.type.js";
import type { Promisable } from "@/utilities/types/promiseable.type.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type FactoryFn<TInput, TOutput> = (
    value: TInput,
) => Promisable<NoneFunction<TOutput>>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/utilities"```
 */
export type IFactoryObject<TInput, TOutput> = {
    use(value: TInput): Promisable<NoneFunction<TOutput>>;
};

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
    | NoneFunction<TOutput>
    | Factory<TInput, TOutput>;
