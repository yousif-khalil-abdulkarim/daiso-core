/**
 * @module Collection
 */

export type Comparator<TItem> = (itemA: TItem, itemB: TItem) => number;

export type Predicate_<TInput, TCollection> = (
    item: TInput,
    index: number,
    collection: TCollection,
) => boolean;

export type PredicateGuard<
    TInput,
    TCollection,
    TOutput extends TInput = TInput,
> = (item: TInput, index: number, collection: TCollection) => item is TOutput;

export type Predicate<TInput, TCollection, TOutput extends TInput = TInput> =
    | Predicate_<TInput, TCollection>
    | PredicateGuard<TInput, TCollection, TOutput>;

export type Reduce<TInput, TCollection, TOutput> = (
    output: TOutput,
    item: TInput,
    index: number,
    collection: TCollection,
) => TOutput;

export type Map<TInput, TCollection, TOutput> = (
    item: TInput,
    index: number,
    collection: TCollection,
) => TOutput;

export type ForEach<TInput, TCollection> = (
    item: TInput,
    index: number,
    collection: TCollection,
) => void;

export type Modifier<TInput, TOutput> = (collection: TInput) => TOutput;

export type Tap<TCollection> = (collection: TCollection) => void;

export type Transform<TInput, TOutput> = (value: TInput) => TOutput;

export type AsyncPredicate_<TInput, TCollection> = (
    item: TInput,
    index: number,
    collection: TCollection,
) => PromiseLike<boolean>;

export type AsyncPredicate<
    TInput,
    TCollection,
    TOutput extends TInput = TInput,
> =
    | AsyncPredicate_<TInput, TCollection>
    | Predicate<TInput, TCollection, TOutput>;

export type AsyncReduce_<TInput, TCollection, TOutput> = (
    output: TOutput,
    item: TInput,
    index: number,
    collection: TCollection,
) => PromiseLike<TOutput>;

export type AsyncReduce<TInput, TCollection, TOutput> =
    | AsyncReduce_<TInput, TCollection, TOutput>
    | Reduce<TInput, TCollection, TOutput>;

export type AsyncMap_<TInput, TCollection, TOutput> = (
    item: TInput,
    index: number,
    collection: TCollection,
) => PromiseLike<TOutput>;

export type AsyncMap<TInput, TCollection, TOutput> =
    | AsyncMap_<TInput, TCollection, TOutput>
    | Map<TInput, TCollection, TOutput>;

export type AsyncForEach_<TInput, TCollection> = (
    item: TInput,
    index: number,
    collection: TCollection,
) => PromiseLike<void>;

export type AsyncForEach<TInput, TCollection> =
    | ForEach<TInput, TCollection>
    | AsyncForEach_<TInput, TCollection>;

export type AsyncModifier_<TInput, TOutput> = (
    collection: TInput,
) => PromiseLike<TOutput>;

export type AsyncModifier<TInput, TOutput> =
    | Modifier<TInput, TOutput>
    | AsyncModifier_<TInput, TOutput>;

export type AsyncTap_<TCollection> = (
    collection: TCollection,
) => PromiseLike<void>;

export type AsyncTap<TCollection> = Tap<TCollection> | AsyncTap_<TCollection>;

export type AsyncTransform_<TInput, TOutput> = (
    value: TInput,
) => PromiseLike<TOutput>;

export type AsyncTransform<TInput, TOutput> =
    | Transform<TInput, TOutput>
    | AsyncTransform_<TInput, TOutput>;

export type CrossJoinResult<TInput, TExtended> = TInput extends [
    infer R,
    ...infer L,
]
    ? [R, ...L, TExtended]
    : [TInput, TExtended];

export type EnsureRecord<TInput> = TInput extends
    | [infer TKey, infer TValue]
    | readonly [infer TKey, infer TValue]
    ? TKey extends string | number | symbol
        ? Record<TKey, TValue>
        : never
    : never;

export type EnsureMap<TInput> = TInput extends
    | [infer TKey, infer TValue]
    | readonly [infer TKey, infer TValue]
    ? globalThis.Map<TKey, TValue>
    : never;
