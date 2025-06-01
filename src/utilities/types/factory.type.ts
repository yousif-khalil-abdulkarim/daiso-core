/**
 * @module Utilities
 */

import type { NoneFunc } from "@/utilities/types/none-func.type.js";
import type { Promisable } from "@/utilities/types/promiseable.type.js";
import type {
    IInvokableObject,
    InvokableFn,
} from "@/utilities/types/invokable.type.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/utilities"`
 */
export type FactoryFn<TInput, TOutput> = InvokableFn<
    [value: TInput],
    NoneFunc<TOutput>
>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/utilities"`
 */
export type IFactoryObject<TInput, TOutput> = IInvokableObject<
    [value: TInput],
    NoneFunc<TOutput>
>;

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
export type AsyncFactoryFn<TInput, TOutput> = InvokableFn<
    [value: TInput],
    Promisable<NoneFunc<TOutput>>
>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/utilities"`
 */
export type IAsyncFactoryObject<TInput, TOutput> = IInvokableObject<
    [value: TInput],
    Promisable<NoneFunc<TOutput>>
>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/utilities"`
 */
export type AsyncFactory<TInput, TOutput> =
    | AsyncFactoryFn<TInput, TOutput>
    | IAsyncFactoryObject<TInput, TOutput>;
