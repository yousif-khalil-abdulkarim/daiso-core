/**
 * @module Collection
 */

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type SyncForEach<TInput, TCollection> = (
    item: TInput,
    index: number,
    collection: TCollection,
) => void;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type AsyncForEach<TInput, TCollection> = (
    item: TInput,
    index: number,
    collection: TCollection,
) => PromiseLike<void>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type ForEach<TInput, TCollection> =
    | SyncForEach<TInput, TCollection>
    | AsyncForEach<TInput, TCollection>;
