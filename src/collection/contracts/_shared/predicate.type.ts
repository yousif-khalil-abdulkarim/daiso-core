/**
 * @module Collection
 */

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type SyncPredicateFn<TInput, TCollection> = (
    item: TInput,
    index: number,
    collection: TCollection,
) => boolean;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type SyncPredicateGuardFn<
    TInput,
    TCollection,
    TOutput extends TInput = TInput,
> = (item: TInput, index: number, collection: TCollection) => item is TOutput;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type SyncPredicate<
    TInput,
    TCollection,
    TOutput extends TInput = TInput,
> =
    | SyncPredicateFn<TInput, TCollection>
    | SyncPredicateGuardFn<TInput, TCollection, TOutput>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type AsyncPredicate<TInput, TCollection> = (
    item: TInput,
    index: number,
    collection: TCollection,
) => PromiseLike<boolean>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type Predicate<TInput, TCollection, TOutput extends TInput = TInput> =
    | AsyncPredicate<TInput, TCollection>
    | SyncPredicate<TInput, TCollection, TOutput>;
