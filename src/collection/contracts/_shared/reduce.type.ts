/**
 * @module Collection
 */

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type Reduce<TInput, TCollection, TOutput> = (
    output: TOutput,
    item: TInput,
    index: number,
    collection: TCollection,
) => TOutput;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type AsyncReduce_<TInput, TCollection, TOutput> = (
    output: TOutput,
    item: TInput,
    index: number,
    collection: TCollection,
) => PromiseLike<TOutput>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type AsyncReduce<TInput, TCollection, TOutput> =
    | AsyncReduce_<TInput, TCollection, TOutput>
    | Reduce<TInput, TCollection, TOutput>;
