/**
 * @module Collection
 */

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type Comparator<TItem> = (itemA: TItem, itemB: TItem) => number;

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
export type Map<TInput, TCollection, TOutput> = (
    item: TInput,
    index: number,
    collection: TCollection,
) => TOutput;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type ForEach<TInput, TCollection> = (
    item: TInput,
    index: number,
    collection: TCollection,
) => void;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type Modifier<TInput, TOutput> = (collection: TInput) => TOutput;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type Tap<TCollection> = (collection: TCollection) => void;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type Transform<TInput, TOutput> = (value: TInput) => TOutput;

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

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type AsyncForEach_<TInput, TCollection> = (
    item: TInput,
    index: number,
    collection: TCollection,
) => PromiseLike<void>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type AsyncForEach<TInput, TCollection> =
    | ForEach<TInput, TCollection>
    | AsyncForEach_<TInput, TCollection>;

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

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type AsyncTap_<TCollection> = (
    collection: TCollection,
) => PromiseLike<void>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type AsyncTap<TCollection> = Tap<TCollection> | AsyncTap_<TCollection>;

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

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type CrossJoinResult<TInput, TExtended> = TInput extends [
    infer R,
    ...infer L,
]
    ? [R, ...L, TExtended]
    : [TInput, TExtended];

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type EnsureRecord<TInput> = TInput extends
    | [infer TKey, infer TValue]
    | readonly [infer TKey, infer TValue]
    ? TKey extends string | number | symbol
        ? Record<TKey, TValue>
        : never
    : never;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type EnsureMap<TInput> = TInput extends
    | [infer TKey, infer TValue]
    | readonly [infer TKey, infer TValue]
    ? globalThis.Map<TKey, TValue>
    : never;
