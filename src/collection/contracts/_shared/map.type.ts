/**
 * @module Collection
 */

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type Map<TInput, TCollection, TOutput> = (
    item: TInput,
    index: number,
    collection: TCollection,
) => TOutput;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type AsyncMap_<TInput, TCollection, TOutput> = (
    item: TInput,
    index: number,
    collection: TCollection,
) => PromiseLike<TOutput>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type AsyncMap<TInput, TCollection, TOutput> =
    | AsyncMap_<TInput, TCollection, TOutput>
    | Map<TInput, TCollection, TOutput>;
