/**
 * @module Utilities
 */

import type { NoneFunc } from "@/utilities/types/none-func.type.js";
import type { Promisable } from "@/utilities/types/promiseable.type.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/utilities"`
 */
export type FactoryFn<TInput, TOutput> = (value: TInput) => NoneFunc<TOutput>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/utilities"`
 */
export type IFactoryObject<TInput, TOutput> = {
    use(value: TInput): NoneFunc<TOutput>;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/utilities"`
 */
export type Factory<TInput, TOutput> =
    | FactoryFn<TInput, TOutput>
    | IFactoryObject<TInput, TOutput>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/utilities"`
 */
export type Factoryable<TInput, TOutput> = TOutput | Factory<TInput, TOutput>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/utilities"`
 */
export type AsyncFactoryFn<TInput, TOutput> = (
    value: TInput,
) => Promisable<NoneFunc<TOutput>>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/utilities"`
 */
export type IAsyncFactoryObject<TInput, TOutput> = {
    use(value: TInput): Promisable<NoneFunc<TOutput>>;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/utilities"`
 */
export type AsyncFactory<TInput, TOutput> =
    | AsyncFactoryFn<TInput, TOutput>
    | IAsyncFactoryObject<TInput, TOutput>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/utilities"`
 */
export type AsyncFactoryable<TInput, TOutput> =
    | TOutput
    | AsyncFactory<TInput, TOutput>;
