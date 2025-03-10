/**
 * @module Collection
 */

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type Modifier<TInput, TOutput> = (collection: TInput) => TOutput;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type AsyncModifier_<TInput, TOutput> = (
    collection: TInput,
) => PromiseLike<TOutput>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type AsyncModifier<TInput, TOutput> =
    | Modifier<TInput, TOutput>
    | AsyncModifier_<TInput, TOutput>;
