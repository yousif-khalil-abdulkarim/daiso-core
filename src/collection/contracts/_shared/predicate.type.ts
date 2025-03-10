/**
 * @module Collection
 */

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type Predicate_<TInput, TCollection> = (
    item: TInput,
    index: number,
    collection: TCollection,
) => boolean;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type PredicateGuard<
    TInput,
    TCollection,
    TOutput extends TInput = TInput,
> = (item: TInput, index: number, collection: TCollection) => item is TOutput;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type Predicate<TInput, TCollection, TOutput extends TInput = TInput> =
    | Predicate_<TInput, TCollection>
    | PredicateGuard<TInput, TCollection, TOutput>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type AsyncPredicate_<TInput, TCollection> = (
    item: TInput,
    index: number,
    collection: TCollection,
) => PromiseLike<boolean>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type AsyncPredicate<
    TInput,
    TCollection,
    TOutput extends TInput = TInput,
> =
    | AsyncPredicate_<TInput, TCollection>
    | Predicate<TInput, TCollection, TOutput>;
