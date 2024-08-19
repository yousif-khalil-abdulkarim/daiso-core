/**
 * @group Collections
 */
export class CollectionError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = CollectionError.name;
    }
}
/**
 * @group Collections
 */
export class UnexpectedCollectionError extends CollectionError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = UnexpectedCollectionError.name;
    }
}
/**
 * @group Collections
 */
export class IndexOverflowError extends UnexpectedCollectionError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = IndexOverflowError.name;
    }
}
/**
 * @group Collections
 */
export class ItemNotFoundError extends CollectionError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = ItemNotFoundError.name;
    }
}
/**
 * @group Collections
 */
export class MultipleItemsFoundError extends CollectionError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = MultipleItemsFoundError.name;
    }
}

/**
 * @group Collections
 */
export type UpdatedItem<TInput, TFilterOutput, TMapOutput> =
    | TInput
    | TFilterOutput
    | TMapOutput;
/**
 * @group Collections
 */
export type RecordItem<TKey, TValue> = [key: TKey, value: TValue];
/**
 * @group Collections
 */
export type ReverseSettings = {
    chunkSize?: number;
    throwOnNumberLimit?: boolean;
};
/**
 * @group Collections
 */
export type PageSettings = {
    page: number;
    pageSize: number;
    throwOnNumberLimit?: boolean;
};
/**
 * @group Collections
 */
export type JoinSettings = {
    seperator?: string;
    throwOnNumberLimit?: boolean;
};
/**
 * @group Collections
 */
export type SliceSettings = {
    start?: number;
    end?: number;
    throwOnNumberLimit?: boolean;
};
/**
 * @group Collections
 */
export type SlidingSettings = {
    chunkSize: number;
    step?: number;
    throwOnNumberLimit?: boolean;
};
/**
 * @group Collections
 */
export type Comparator<TItem> = (itemA: TItem, itemB: TItem) => number;

/**
 * @group Collections
 *  @internal
 */
export type Filter_<TInput, TCollection> = (
    item: TInput,
    index: number,
    collection: TCollection,
) => boolean;
/**
 * @group Collections
 *  @internal
 */
export type FilterGuard<
    TInput,
    TCollection,
    TOutput extends TInput = TInput,
> = (item: TInput, index: number, collection: TCollection) => item is TOutput;
/**
 * @group Collections
 */
export type Filter<TInput, TCollection, TOutput extends TInput = TInput> =
    | Filter_<TInput, TCollection>
    | FilterGuard<TInput, TCollection, TOutput>;
/**
 * @group Collections
 */
export type Reduce<TInput, TCollection, TOutput> = (
    output: TOutput,
    item: TInput,
    index: number,
    collection: TCollection,
) => TOutput;
/**
 * @group Collections
 */
export type ReduceSettings<TInput, TCollection, TOutput> = {
    reduceFn: Reduce<TInput, TCollection, TOutput>;
    initialValue?: TOutput;
    throwOnNumberLimit?: boolean;
};
/**
 * @group Collections
 */
export type Map<TInput, TCollection, TOutput> = (
    item: TInput,
    index: number,
    collection: TCollection,
) => TOutput;
/**
 * @group Collections
 */
export type ForEach<TInput, TCollection> = (
    item: TInput,
    index: number,
    collection: TCollection,
) => void;
/**
 * @group Collections
 */
export type Modifier<TInput, TOutput> = (collection: TInput) => TOutput;
/**
 * @group Collections
 */
export type Tap<TCollection> = (collection: TCollection) => void;
/**
 * @group Collections
 */
export type Transform<TInput, TOutput> = (value: TInput) => TOutput;
/**
 * @group Collections
 */
export type Lazyable<TValue> = TValue | (() => TValue);
/**
 * @group Collections
 */
export type FindSettings<TInput, TCollection, TOutput extends TInput> = {
    filterFn?: Filter<TInput, TCollection, TOutput>;
    throwOnNumberLimit?: boolean;
};
/**
 * @group Collections
 */
export type FindOrSettings<
    TInput,
    TCollection,
    TOutput extends TInput,
    TDefault,
> = FindSettings<TInput, TCollection, TOutput> & {
    defaultValue: Lazyable<TDefault>;
};
/**
 * @group Collections
 */
export type GroupBySettings<TInput, TCollection, TOutput> = {
    mapFn?: Map<TInput, TCollection, TOutput>;
    throwOnNumberLimit?: boolean;
};

/**
 * @group Collections
 *  @internal
 */
export type AsyncFilter_<TInput, TCollection> = (
    item: TInput,
    index: number,
    collection: TCollection,
) => Promise<boolean>;
/**
 * @group Collections
 *  @internal
 */
export type AsyncFilter<TInput, TCollection, TOutput extends TInput = TInput> =
    | AsyncFilter_<TInput, TCollection>
    | Filter<TInput, TCollection, TOutput>;
/**
 * @group Collections
 *  @internal
 */
export type AsyncReduce_<TInput, TCollection, TOutput> = (
    output: TOutput,
    item: TInput,
    index: number,
    collection: TCollection,
) => Promise<TOutput>;
/**
 * @group Collections
 */
export type AsyncReduce<TInput, TCollection, TOutput> =
    | AsyncReduce_<TInput, TCollection, TOutput>
    | Reduce<TInput, TCollection, TOutput>;
/**
 * @group Collections
 */
export type AsyncReduceSettings<TInput, TCollection, TOutput> = {
    reduceFn: AsyncReduce<TInput, TCollection, TOutput>;
    initialValue?: TOutput;
    throwOnNumberLimit?: boolean;
};
/**
 * @group Collections
 *  @internal
 */
export type AsyncMap_<TInput, TCollection, TOutput> = (
    item: TInput,
    index: number,
    collection: TCollection,
) => Promise<TOutput>;
/**
 * @group Collections
 *  @internal
 */
export type AsyncMap<TInput, TCollection, TOutput> =
    | AsyncMap_<TInput, TCollection, TOutput>
    | Map<TInput, TCollection, TOutput>;
/**
 * @group Collections
 *  @internal
 */
export type AsyncForEach_<TInput, TCollection> = (
    item: TInput,
    index: number,
    collection: TCollection,
) => Promise<void>;
/**
 * @group Collections
 *  @internal
 */
export type AsyncForEach<TInput, TCollection> =
    | ForEach<TInput, TCollection>
    | AsyncForEach_<TInput, TCollection>;
/**
 * @group Collections
 *  @internal
 */
export type AsyncModifier_<TInput, TOutput> = (
    collection: TInput,
) => Promise<TOutput>;
/**
 * @group Collections
 *  @internal
 */
export type AsyncModifier<TInput, TOutput> =
    | Modifier<TInput, TOutput>
    | AsyncModifier_<TInput, TOutput>;
/**
 * @group Collections
 *  @internal
 */
export type AsyncTap_<TCollection> = (collection: TCollection) => Promise<void>;
/**
 * @group Collections
 *  @internal
 */
export type AsyncTap<TCollection> = Tap<TCollection> | AsyncTap_<TCollection>;
/**
 * @group Collections
 *  @internal
 */
export type AsyncTransform_<TInput, TOutput> = (
    value: TInput,
) => Promise<TOutput>;
/**
 * @group Collections
 *  @internal
 */
export type AsyncTransform<TInput, TOutput> =
    | Transform<TInput, TOutput>
    | AsyncTransform_<TInput, TOutput>;
/**
 * @group Collections
 *  @internal
 */
export type AsyncLazyable_<TValue> = TValue | (() => Promise<TValue>);
/**
 * @group Collections
 *  @internal
 */
export type AsyncLazyable<TValue> = AsyncLazyable_<TValue> | Lazyable<TValue>;
/**
 * @group Collections
 *  @internal
 */
export type AsyncFindSettings<TInput, TCollection, TOutput extends TInput> = {
    filterFn?: AsyncFilter<TInput, TCollection, TOutput>;
    throwOnNumberLimit?: boolean;
};
/**
 * @group Collections
 */
export type AsyncFindOrSettings<
    TInput,
    TCollection,
    TOutput extends TInput,
    TDefault,
> = AsyncFindSettings<TInput, TCollection, TOutput> & {
    defaultValue: AsyncLazyable<TDefault>;
};
/**
 * @group Collections
 */
export type AsyncGroupBySettings<TInput, TCollection, TOutput> = {
    mapFn?: AsyncMap<TInput, TCollection, TOutput>;
    chunkSize?: number;
    throwOnNumberLimit?: boolean;
};
