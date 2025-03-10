/**
 * @module Collection
 */

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type Transform<TInput, TOutput> = (value: TInput) => TOutput;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type AsyncTransform_<TInput, TOutput> = (
    value: TInput,
) => PromiseLike<TOutput>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type AsyncTransform<TInput, TOutput> =
    | Transform<TInput, TOutput>
    | AsyncTransform_<TInput, TOutput>;
