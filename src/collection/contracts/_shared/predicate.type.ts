/**
 * @module Collection
 */

import type { Promisable } from "@/utilities/_module-exports.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type PredicateFn<TInput, TCollection> = (
    item: TInput,
    index: number,
    collection: TCollection,
) => boolean;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type PredicateGuardFn<
    TInput,
    TCollection,
    TOutput extends TInput = TInput,
> = (item: TInput, index: number, collection: TCollection) => item is TOutput;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type Predicate<TInput, TCollection, TOutput extends TInput = TInput> =
    | PredicateFn<TInput, TCollection>
    | PredicateGuardFn<TInput, TCollection, TOutput>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type AsyncPredicateFn<TInput, TCollection> = (
    item: TInput,
    index: number,
    collection: TCollection,
) => Promisable<boolean>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type AsyncPredicate<
    TInput,
    TCollection,
    TOutput extends TInput = TInput,
> =
    | AsyncPredicateFn<TInput, TCollection>
    | PredicateGuardFn<TInput, TCollection, TOutput>;
