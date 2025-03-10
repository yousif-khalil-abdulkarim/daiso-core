/**
 * @module Collection
 */

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type SyncModifier<TInput, TOutput> = (collection: TInput) => TOutput;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type AsyncModifier<TInput, TOutput> = (
    collection: TInput,
) => PromiseLike<TOutput>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type Modifier<TInput, TOutput> =
    | SyncModifier<TInput, TOutput>
    | AsyncModifier<TInput, TOutput>;
