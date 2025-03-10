/**
 * @module Collection
 */

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type SyncTransform<TInput, TOutput> = (value: TInput) => TOutput;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type AsyncTransform<TInput, TOutput> = (
    value: TInput,
) => PromiseLike<TOutput>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type Transform<TInput, TOutput> =
    | SyncTransform<TInput, TOutput>
    | AsyncTransform<TInput, TOutput>;
