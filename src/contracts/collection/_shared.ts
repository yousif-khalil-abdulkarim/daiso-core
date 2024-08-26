/**
 * @module Collections
 */

/**
 * @group Errors
 */
export class CollectionError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = CollectionError.name;
    }
}

/**
 * @group Errors
 */
export class UnexpectedCollectionError extends CollectionError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = UnexpectedCollectionError.name;
    }
}

/**
 * @group Errors
 */
export class IndexOverflowError extends CollectionError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = IndexOverflowError.name;
    }
}

/**
 * @group Errors
 */
export class ItemNotFoundError extends CollectionError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = ItemNotFoundError.name;
    }
}

/**
 * @group Errors
 */
export class MultipleItemsFoundError extends CollectionError {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = MultipleItemsFoundError.name;
    }
}

export type UpdatedItem<TInput, TFilterOutput, TMapOutput> =
    | TInput
    | TFilterOutput
    | TMapOutput;

export type RecordItem<TKey, TValue> = [key: TKey, value: TValue];

export type ReverseSettings = {
    /**
     * @defaultValue 1024
     */
    chunkSize?: number;
    /**
     * @defaultValue false
     */
    throwOnIndexOverflow?: boolean;
};

export type PageSettings = {
    page: number;
    pageSize: number;
    /**
     * @defaultValue false
     */
    throwOnIndexOverflow?: boolean;
};

export type JoinSettings = {
    /**
     * @defaultValue ","
     */
    seperator?: string;
    /**
     * @defaultValue false
     */
    throwOnIndexOverflow?: boolean;
};

export type SliceSettings = {
    /**
     * @defaultValue 0
     */
    start?: number;
    /**
     * @defaultValue the size of the collection
     */
    end?: number;
    /**
     * @defaultValue false
     */
    throwOnIndexOverflow?: boolean;
};

export type SlidingSettings = {
    chunkSize: number;
    /**
     * @defaultValue SlidingSettings.chunkSize - 1
     */
    step?: number;
    /**
     * @defaultValue false
     */
    throwOnIndexOverflow?: boolean;
};

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

export type ReduceSettings<TInput, TCollection, TOutput> = {
    reduceFn: Reduce<TInput, TCollection, TOutput>;
    initialValue?: TOutput;
    /**
     * @defaultValue false
     */
    throwOnIndexOverflow?: boolean;
};

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

export type Lazyable<TValue> = TValue | (() => TValue);

export type FindSettings<TInput, TCollection, TOutput extends TInput> = {
    predicateFn?: Predicate<TInput, TCollection, TOutput>;
    /**
     * @defaultValue false
     */
    throwOnIndexOverflow?: boolean;
};

export type FindOrSettings<
    TInput,
    TCollection,
    TOutput extends TInput,
    TDefault,
> = FindSettings<TInput, TCollection, TOutput> & {
    defaultValue: Lazyable<TDefault>;
};

export type GroupBySettings<TInput, TCollection, TOutput> = {
    /**
     * @defaultValue (item: TInput) => item
     */
    selectFn?: Map<TInput, TCollection, TOutput>;
    /**
     * @defaultValue false
     */
    throwOnIndexOverflow?: boolean;
};
export type CountBySettings<TInput, TCollection, TOutput> = {
    /**
     * @defaultValue (item: TInput) => item
     */
    selectFn?: Map<TInput, TCollection, TOutput>;
    /**
     * @defaultValue false
     */
    throwOnIndexOverflow?: boolean;
};
export type UniqueSettings<TInput, TCollection, TOutput> = {
    /**
     * @defaultValue (item: TInput) => item
     */
    selectFn?: Map<TInput, TCollection, TOutput>;
    /**
     * @defaultValue false
     */
    throwOnIndexOverflow?: boolean;
};

export type AsyncPredicate_<TInput, TCollection> = (
    item: TInput,
    index: number,
    collection: TCollection,
) => Promise<boolean>;

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
) => Promise<TOutput>;

export type AsyncReduce<TInput, TCollection, TOutput> =
    | AsyncReduce_<TInput, TCollection, TOutput>
    | Reduce<TInput, TCollection, TOutput>;

export type AsyncReduceSettings<TInput, TCollection, TOutput> = {
    reduceFn: AsyncReduce<TInput, TCollection, TOutput>;
    initialValue?: TOutput;
    /**
     * @defaultValue false
     */
    throwOnIndexOverflow?: boolean;
};

export type AsyncMap_<TInput, TCollection, TOutput> = (
    item: TInput,
    index: number,
    collection: TCollection,
) => Promise<TOutput>;

export type AsyncMap<TInput, TCollection, TOutput> =
    | AsyncMap_<TInput, TCollection, TOutput>
    | Map<TInput, TCollection, TOutput>;

export type AsyncForEach_<TInput, TCollection> = (
    item: TInput,
    index: number,
    collection: TCollection,
) => Promise<void>;

export type AsyncForEach<TInput, TCollection> =
    | ForEach<TInput, TCollection>
    | AsyncForEach_<TInput, TCollection>;

export type AsyncModifier_<TInput, TOutput> = (
    collection: TInput,
) => Promise<TOutput>;

export type AsyncModifier<TInput, TOutput> =
    | Modifier<TInput, TOutput>
    | AsyncModifier_<TInput, TOutput>;

export type AsyncTap_<TCollection> = (collection: TCollection) => Promise<void>;

export type AsyncTap<TCollection> = Tap<TCollection> | AsyncTap_<TCollection>;

export type AsyncTransform_<TInput, TOutput> = (
    value: TInput,
) => Promise<TOutput>;

export type AsyncTransform<TInput, TOutput> =
    | Transform<TInput, TOutput>
    | AsyncTransform_<TInput, TOutput>;

export type AsyncLazyable_<TValue> = TValue | (() => Promise<TValue>);

export type AsyncLazyable<TValue> = AsyncLazyable_<TValue> | Lazyable<TValue>;

export type AsyncFindSettings<TInput, TCollection, TOutput extends TInput> = {
    predicateFn?: AsyncPredicate<TInput, TCollection, TOutput>;
    /**
     * @defaultValue false
     */
    throwOnIndexOverflow?: boolean;
};

export type AsyncFindOrSettings<
    TInput,
    TCollection,
    TOutput extends TInput,
    TDefault,
> = AsyncFindSettings<TInput, TCollection, TOutput> & {
    defaultValue: AsyncLazyable<TDefault>;
};

export type AsyncGroupBySettings<TInput, TCollection, TOutput> = {
    /**
     * @defaultValue (item: TInput) => item
     */
    selectFn?: AsyncMap<TInput, TCollection, TOutput>;
    chunkSize?: number;
    /**
     * @defaultValue false
     */
    throwOnIndexOverflow?: boolean;
};
export type AsyncCountBySettings<TInput, TCollection, TOutput> = {
    /**
     * @defaultValue (item: TInput) => item
     */
    selectFn?: AsyncMap<TInput, TCollection, TOutput>;
    /**
     * @defaultValue false
     */
    throwOnIndexOverflow?: boolean;
};
export type AsyncUniqueSettings<TInput, TCollection, TOutput> = {
    /**
     * @defaultValue (item: TInput) => item
     */
    selectFn?: AsyncMap<TInput, TCollection, TOutput>;
    /**
     * @defaultValue false
     */
    throwOnIndexOverflow?: boolean;
};
