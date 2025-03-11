/**
 * @module Collection
 */

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type SyncMap<TInput, TCollection, TOutput> = (
    item: TInput,
    index: number,
    collection: TCollection,
) => TOutput;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type AsyncMap<TInput, TCollection, TOutput> = (
    item: TInput,
    index: number,
    collection: TCollection,
) => PromiseLike<TOutput>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type Map<TInput, TCollection, TOutput> =
    | AsyncMap<TInput, TCollection, TOutput>
    | SyncMap<TInput, TCollection, TOutput>;
