import {
    type AsyncCollapse,
    type AsyncFilter,
    type AsyncFindOrSettings,
    type AsyncFindSettings,
    type AsyncForEach,
    type AsyncGroupBySettings,
    type AsyncIterableValue,
    type AsyncLazyable,
    type AsyncMap,
    type AsyncModifier,
    type AsyncReduceSettings,
    type AsyncTap,
    type AsyncTransform,
    CollectionError,
    type Comparator,
    type IAsyncCollection,
    ItemNotFoundError,
    type JoinSettings,
    MultipleItemsFoundError,
    IndexOverflowError,
    type PageSettings,
    type RecordItem,
    type ReverseSettings,
    type SliceSettings,
    type SlidingSettings,
    UnexpectedCollectionError,
    type UpdatedItem,
} from "@/contracts/collection/_module";
import {
    AsyncCrossJoinIterable,
    AsyncSlidingIteralbe,
    AsyncShuffleIterable,
    AsyncEntriesIterable,
    AsyncFilterIterable,
    AsyncChunkIterable,
    AsyncChunkWhileIterable,
    AsyncCollapseIterable,
    AsyncCountByIterable,
    AsyncFlatMapIterable,
    AsyncGroupByIterable,
    AsyncInsertAfterIterable,
    AsyncInsertBeforeIterable,
    AsyncMapIterable,
    AsyncMergeIterable,
    AsyncPadEndIterable,
    AsyncPadStartIterable,
    AsyncPartionIterable,
    AsyncSkipIterable,
    AsyncSkipUntilIterable,
    AsyncSortIterable,
    AsyncSplitIterable,
    AsyncTakeIterable,
    AsyncTakeUntilIterable,
    AsyncTapIterable,
    AsyncUniqueIterable,
    AsyncUpdateIterable,
    AsyncWhenIterable,
    AsyncZipIterable,
    AsyncReverseIterable,
    AsyncSliceIterable,
    AsyncRepeatIterable,
    AsyncAbortIterable,
    AsyncDelayIterable,
    AsyncTimeoutIterable,
} from "@/collection/async-iterable-collection/async-iterable-helpers/_module";
import { EnsureType } from "@/types";

/**
 * Most methods in AsyncIterableCollection are lazy and will only execute when calling methods return values or iterating through an IterableCollection by using for of loop
 * @group Collections
 */
export class AsyncIterableCollection<TInput>
    implements IAsyncCollection<TInput>
{
    private static THROW_ON_NUMBER_LIMIT = false;

    private static DEFAULT_CHUNK_SIZE = 1024;

    private static makeCollection = <TInput>(
        iterable: AsyncIterableValue<TInput>,
    ): IAsyncCollection<TInput> => {
        return new AsyncIterableCollection<TInput>(iterable);
    };

    constructor(private iterable: AsyncIterableValue<TInput> = []) {}

    async *[Symbol.asyncIterator](): AsyncIterator<TInput> {
        yield* this.iterable;
    }

    iterator(): AsyncIterator<TInput, void> {
        return this[Symbol.asyncIterator]() as AsyncIterator<TInput, void>;
    }

    entries(
        throwOnNumberLimit = AsyncIterableCollection.THROW_ON_NUMBER_LIMIT,
    ): IAsyncCollection<RecordItem<number, TInput>> {
        return new AsyncIterableCollection(
            new AsyncEntriesIterable(this, throwOnNumberLimit),
        );
    }

    keys(
        throwOnNumberLimit = AsyncIterableCollection.THROW_ON_NUMBER_LIMIT,
    ): IAsyncCollection<number> {
        return this.entries(throwOnNumberLimit).map(([key]) => key);
    }

    values(): IAsyncCollection<TInput> {
        return this.entries().map(([_key, value]) => value);
    }

    filter<TOutput extends TInput>(
        filter: AsyncFilter<TInput, IAsyncCollection<TInput>, TOutput>,
        throwOnNumberLimit = AsyncIterableCollection.THROW_ON_NUMBER_LIMIT,
    ): IAsyncCollection<TOutput> {
        return new AsyncIterableCollection<TOutput>(
            new AsyncFilterIterable(this, filter, throwOnNumberLimit),
        );
    }

    map<TOutput>(
        map: AsyncMap<TInput, IAsyncCollection<TInput>, TOutput>,
        throwOnNumberLimit = AsyncIterableCollection.THROW_ON_NUMBER_LIMIT,
    ): IAsyncCollection<TOutput> {
        return new AsyncIterableCollection(
            new AsyncMapIterable(this, map, throwOnNumberLimit),
        );
    }

    async reduce<TOutput = TInput>(
        settings: AsyncReduceSettings<
            TInput,
            IAsyncCollection<TInput>,
            TOutput
        >,
    ): Promise<TOutput> {
        const { reduceFn: reduce, initialValue, throwOnNumberLimit } = settings;
        if (initialValue === undefined && (await this.empty())) {
            throw new TypeError(
                "Reduce of empty array must be inputed a initial value",
            );
        }
        if (initialValue !== undefined) {
            let output = initialValue as TOutput;

            for await (const [index, item] of this.entries()) {
                output = await reduce(output, item, index, this);
            }
            return output;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
        let output: TOutput = (await this.firstOrFail()) as any,
            index = 0,
            isFirstIteration = true;
        for await (const item of this) {
            if (!isFirstIteration) {
                if (throwOnNumberLimit && index === Number.MAX_SAFE_INTEGER) {
                    throw new IndexOverflowError("Index has overflowed");
                }
                output = await reduce(output, item, index, this);
            }
            isFirstIteration = false;
            index++;
        }
        return output;
    }

    async join(settings?: JoinSettings): Promise<string> {
        return this.reduce({
            reduceFn(str, item) {
                if (typeof item !== "string") {
                    throw new TypeError("Item type is invalid must be string");
                }
                const separator = settings?.seperator ?? ",";
                return str + separator + item;
            },
            throwOnNumberLimit:
                settings?.throwOnNumberLimit ??
                AsyncIterableCollection.THROW_ON_NUMBER_LIMIT,
        });
    }

    collapse(): IAsyncCollection<AsyncCollapse<TInput>> {
        return new AsyncIterableCollection(new AsyncCollapseIterable(this));
    }

    flatMap<TOutput>(
        map: AsyncMap<TInput, IAsyncCollection<TInput>, Iterable<TOutput>>,
        throwOnNumberLimit = AsyncIterableCollection.THROW_ON_NUMBER_LIMIT,
    ): IAsyncCollection<TOutput> {
        return new AsyncIterableCollection(
            new AsyncFlatMapIterable(this, map, throwOnNumberLimit),
        );
    }

    update<TFilterOutput extends TInput, TMapOutput>(
        filter: AsyncFilter<TInput, IAsyncCollection<TInput>, TFilterOutput>,
        map: AsyncMap<TFilterOutput, IAsyncCollection<TInput>, TMapOutput>,
        throwOnNumberLimit = AsyncIterableCollection.THROW_ON_NUMBER_LIMIT,
    ): IAsyncCollection<UpdatedItem<TInput, TFilterOutput, TMapOutput>> {
        return new AsyncIterableCollection(
            new AsyncUpdateIterable(this, filter, map, throwOnNumberLimit),
        );
    }

    page(settings: PageSettings): IAsyncCollection<TInput> {
        const { page, pageSize, throwOnNumberLimit } = settings;
        if (page < 0) {
            return this.skip(page * pageSize, throwOnNumberLimit).take(
                pageSize,
                throwOnNumberLimit,
            );
        }
        return this.skip((page - 1) * pageSize, throwOnNumberLimit).take(
            page * pageSize,
            throwOnNumberLimit,
        );
    }

    async sum(
        throwOnNumberLimit?: boolean,
    ): Promise<EnsureType<TInput, number>> {
        try {
            let sum = 0;
            for await (const item of this) {
                if (throwOnNumberLimit && sum === Number.MAX_SAFE_INTEGER) {
                    throw new IndexOverflowError("Sum has overflowed");
                }
                if (typeof item !== "number") {
                    throw new TypeError("Item type is invalid must be number");
                }
                sum += item;
            }
            return sum as EnsureType<TInput, number>;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    async average(
        throwOnNumberLimit?: boolean,
    ): Promise<EnsureType<TInput, number>> {
        try {
            let size = 0,
                sum = 0;
            for await (const item of this) {
                if (throwOnNumberLimit && sum === Number.MAX_SAFE_INTEGER) {
                    throw new IndexOverflowError("The sum has overflowed");
                }
                if (throwOnNumberLimit && size === Number.MAX_SAFE_INTEGER) {
                    throw new IndexOverflowError("The size has overflowed");
                }
                if (typeof item !== "number") {
                    throw new TypeError("Item type is invalid must be number");
                }
                size++;
                sum += item;
            }
            return (sum / size) as EnsureType<TInput, number>;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    async median(
        throwOnNumberLimit?: boolean,
    ): Promise<EnsureType<TInput, number>> {
        if (await this.empty()) {
            return 0 as EnsureType<TInput, number>;
        }
        const size = await this.size(throwOnNumberLimit);
        if (size === 0) {
            return 0 as EnsureType<TInput, number>;
        }
        const isEven = size % 2 === 0,
            items = await this.map((item) => {
                if (typeof item !== "number") {
                    throw new TypeError("Item type is invalid must be number");
                }
                return item;
            }, throwOnNumberLimit)
                .filter((_item, index) => {
                    if (isEven) {
                        return index === size / 2 || index === size / 2 - 1;
                    }
                    return index === Math.floor(size / 2);
                }, throwOnNumberLimit)

                .toArray();
        if (isEven) {
            const [a, b] = items;
            if (a === undefined) {
                throw new UnexpectedCollectionError("Is in invalid state");
            }
            if (b === undefined) {
                throw new UnexpectedCollectionError("Is in invalid state");
            }
            return ((a + b) / 2) as EnsureType<TInput, number>;
        }
        const [median] = items;
        if (median === undefined) {
            throw new UnexpectedCollectionError("Is in invalid state");
        }
        return median as EnsureType<TInput, number>;
    }

    async min(): Promise<EnsureType<TInput, number>> {
        try {
            let min = 0;
            for await (const item of this) {
                if (typeof item !== "number") {
                    throw new TypeError("Item type is invalid must be number");
                }
                if (min === 0) {
                    min = item;
                } else if (min > item) {
                    min = item;
                }
            }
            return min as EnsureType<TInput, number>;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    async max(): Promise<EnsureType<TInput, number>> {
        try {
            let max = 0;
            for await (const item of this) {
                if (typeof item !== "number") {
                    throw new TypeError("Item type is invalid must be number");
                }
                if (max === 0) {
                    max = item;
                } else if (max < item) {
                    max = item;
                }
            }
            return max as EnsureType<TInput, number>;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    async percentage(
        filter: AsyncFilter<TInput, IAsyncCollection<TInput>>,
        throwOnNumberLimit = AsyncIterableCollection.THROW_ON_NUMBER_LIMIT,
    ): Promise<number> {
        try {
            if (await this.empty()) {
                return 0;
            }
            let part = 0,
                total = 0;
            for await (const item of this) {
                if (throwOnNumberLimit && total === Number.MAX_SAFE_INTEGER) {
                    throw new IndexOverflowError(
                        "The total amount has overflowed",
                    );
                }
                if (await filter(item, total, this)) {
                    part++;
                }
                total++;
            }
            return (part / total) * 100;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    async some<TOutput extends TInput>(
        filter: AsyncFilter<TInput, IAsyncCollection<TInput>, TOutput>,
        throwOnNumberLimit = AsyncIterableCollection.THROW_ON_NUMBER_LIMIT,
    ): Promise<boolean> {
        try {
            for await (const [index, item] of this.entries(
                throwOnNumberLimit,
            )) {
                if (await filter(item, index, this)) {
                    return true;
                }
            }
            return false;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    async every<TOutput extends TInput>(
        filter: AsyncFilter<TInput, IAsyncCollection<TInput>, TOutput>,
        throwOnNumberLimit = AsyncIterableCollection.THROW_ON_NUMBER_LIMIT,
    ): Promise<boolean> {
        try {
            let isTrue = true;
            for await (const [index, item] of this.entries(
                throwOnNumberLimit,
            )) {
                isTrue &&= await filter(item, index, this);
                if (!isTrue) {
                    break;
                }
            }
            return isTrue;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    take(
        limit: number,
        throwOnNumberLimit = AsyncIterableCollection.THROW_ON_NUMBER_LIMIT,
    ): IAsyncCollection<TInput> {
        return new AsyncIterableCollection(
            new AsyncTakeIterable(this, limit, throwOnNumberLimit),
        );
    }

    takeUntil(
        filter: AsyncFilter<TInput, IAsyncCollection<TInput>>,
        throwOnNumberLimit = AsyncIterableCollection.THROW_ON_NUMBER_LIMIT,
    ): IAsyncCollection<TInput> {
        return new AsyncIterableCollection(
            new AsyncTakeUntilIterable(this, filter, throwOnNumberLimit),
        );
    }

    takeWhile(
        filter: AsyncFilter<TInput, IAsyncCollection<TInput>>,
        throwOnNumberLimit = AsyncIterableCollection.THROW_ON_NUMBER_LIMIT,
    ): IAsyncCollection<TInput> {
        return this.takeUntil(
            async (...arguments_) => !(await filter(...arguments_)),
            throwOnNumberLimit,
        );
    }

    skip(
        offset: number,
        throwOnNumberLimit = AsyncIterableCollection.THROW_ON_NUMBER_LIMIT,
    ): IAsyncCollection<TInput> {
        return new AsyncIterableCollection(
            new AsyncSkipIterable(this, offset, throwOnNumberLimit),
        );
    }

    skipUntil(
        filter: AsyncFilter<TInput, IAsyncCollection<TInput>>,
        throwOnNumberLimit = AsyncIterableCollection.THROW_ON_NUMBER_LIMIT,
    ): IAsyncCollection<TInput> {
        return new AsyncIterableCollection(
            new AsyncSkipUntilIterable(this, filter, throwOnNumberLimit),
        );
    }

    skipWhile(
        filter: AsyncFilter<TInput, IAsyncCollection<TInput>>,
        throwOnNumberLimit = AsyncIterableCollection.THROW_ON_NUMBER_LIMIT,
    ): IAsyncCollection<TInput> {
        return this.skipUntil(
            async (...arguments_) => !(await filter(...arguments_)),
            throwOnNumberLimit,
        );
    }

    when<TExtended = TInput>(
        condition: boolean,
        callback: AsyncModifier<
            IAsyncCollection<TInput>,
            IAsyncCollection<TExtended>
        >,
    ): IAsyncCollection<TInput | TExtended> {
        return new AsyncIterableCollection(
            new AsyncWhenIterable(this, () => condition, callback),
        );
    }

    whenEmpty<TExtended = TInput>(
        callback: AsyncModifier<
            IAsyncCollection<TInput>,
            IAsyncCollection<TExtended>
        >,
    ): IAsyncCollection<TInput | TExtended> {
        return new AsyncIterableCollection(
            new AsyncWhenIterable(this, () => this.empty(), callback),
        );
    }

    whenNot<TExtended = TInput>(
        condition: boolean,
        callback: AsyncModifier<
            IAsyncCollection<TInput>,
            IAsyncCollection<TExtended>
        >,
    ): IAsyncCollection<TInput | TExtended> {
        return new AsyncIterableCollection(
            new AsyncWhenIterable(this, () => !condition, callback),
        );
    }

    whenNotEmpty<TExtended = TInput>(
        callback: AsyncModifier<
            IAsyncCollection<TInput>,
            IAsyncCollection<TExtended>
        >,
    ): IAsyncCollection<TInput | TExtended> {
        return new AsyncIterableCollection(
            new AsyncWhenIterable(this, () => this.notEmpty(), callback),
        );
    }

    async pipe<TOutput = TInput>(
        callback: AsyncTransform<IAsyncCollection<TInput>, TOutput>,
    ): Promise<TOutput> {
        try {
            return await callback(this);
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    tap(
        callback: AsyncTap<IAsyncCollection<TInput>>,
    ): IAsyncCollection<TInput> {
        return new AsyncIterableCollection(
            new AsyncTapIterable(this, callback),
        );
    }

    chunk(chunkSize: number): IAsyncCollection<IAsyncCollection<TInput>> {
        return new AsyncIterableCollection(
            new AsyncChunkIterable(
                this,
                chunkSize,
                AsyncIterableCollection.makeCollection,
            ),
        );
    }

    chunkWhile(
        filter: AsyncFilter<TInput, IAsyncCollection<TInput>>,
        throwOnNumberLimit = AsyncIterableCollection.THROW_ON_NUMBER_LIMIT,
    ): IAsyncCollection<IAsyncCollection<TInput>> {
        return new AsyncIterableCollection(
            new AsyncChunkWhileIterable(
                this,
                filter,
                throwOnNumberLimit,
                AsyncIterableCollection.makeCollection,
            ),
        );
    }

    split(
        chunkAmount: number,
        throwOnNumberLimit = AsyncIterableCollection.THROW_ON_NUMBER_LIMIT,
    ): IAsyncCollection<IAsyncCollection<TInput>> {
        return new AsyncIterableCollection(
            new AsyncSplitIterable(
                this,
                chunkAmount,
                throwOnNumberLimit,
                AsyncIterableCollection.makeCollection,
            ),
        );
    }

    partition(
        filter: AsyncFilter<TInput, IAsyncCollection<TInput>>,
        throwOnNumberLimit = AsyncIterableCollection.THROW_ON_NUMBER_LIMIT,
    ): IAsyncCollection<IAsyncCollection<TInput>> {
        return new AsyncIterableCollection(
            new AsyncPartionIterable(
                this,
                filter,
                throwOnNumberLimit,
                AsyncIterableCollection.makeCollection,
            ),
        );
    }

    sliding(
        settings: SlidingSettings,
    ): IAsyncCollection<IAsyncCollection<TInput>> {
        const {
            chunkSize,
            step = chunkSize - 1,
            throwOnNumberLimit = AsyncIterableCollection.THROW_ON_NUMBER_LIMIT,
        } = settings;
        return new AsyncIterableCollection(
            new AsyncSlidingIteralbe(this, chunkSize, step, throwOnNumberLimit),
        );
    }

    groupBy<TOutput = TInput>(
        settings?: AsyncGroupBySettings<
            TInput,
            IAsyncCollection<TInput>,
            TOutput
        >,
    ): IAsyncCollection<RecordItem<TOutput, IAsyncCollection<TInput>>> {
        return new AsyncIterableCollection(
            new AsyncGroupByIterable(
                this,
                settings?.mapFn,
                settings?.throwOnNumberLimit ??
                    AsyncIterableCollection.THROW_ON_NUMBER_LIMIT,
                AsyncIterableCollection.makeCollection,
            ),
        );
    }

    countBy<TOutput = TInput>(
        settings?: AsyncGroupBySettings<
            TInput,
            IAsyncCollection<TInput>,
            TOutput
        >,
    ): IAsyncCollection<RecordItem<TOutput, number>> {
        return new AsyncIterableCollection(
            new AsyncCountByIterable(
                this,
                settings?.mapFn,
                settings?.throwOnNumberLimit ??
                    AsyncIterableCollection.THROW_ON_NUMBER_LIMIT,
            ),
        );
    }

    unique<TOutput = TInput>(
        settings?: AsyncGroupBySettings<
            TInput,
            IAsyncCollection<TInput>,
            TOutput
        >,
    ): IAsyncCollection<TInput> {
        return new AsyncIterableCollection(
            new AsyncUniqueIterable(
                this,
                settings?.mapFn,
                settings?.throwOnNumberLimit ??
                    AsyncIterableCollection.THROW_ON_NUMBER_LIMIT,
            ),
        );
    }

    difference<TOutput = TInput>(
        iterable: AsyncIterableValue<TInput>,
        map: AsyncMap<TInput, IAsyncCollection<TInput>, TOutput> = (item) =>
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
            item as any,
    ): IAsyncCollection<TInput> {
        const differenceCollection = new AsyncIterableCollection(iterable);
        return this.filter(async (item, index, collection) => {
            return !(await differenceCollection.some(
                async (matchItem, matchIndex, matchCollection) => {
                    return (
                        (await map(item, index, collection)) ===
                        (await map(matchItem, matchIndex, matchCollection))
                    );
                },
            ));
        });
    }

    repeat(amount: number): IAsyncCollection<TInput> {
        return new AsyncIterableCollection(
            new AsyncRepeatIterable(
                this,
                amount,
                AsyncIterableCollection.makeCollection,
            ),
        );
    }

    padStart<TExtended = TInput>(
        maxLength: number,
        fillItems: AsyncIterableValue<TExtended>,
    ): IAsyncCollection<TInput | TExtended> {
        return new AsyncIterableCollection(
            new AsyncPadStartIterable(
                this,
                maxLength,
                fillItems,
                AsyncIterableCollection.makeCollection,
            ),
        );
    }

    padEnd<TExtended = TInput>(
        maxLength: number,
        fillItems: AsyncIterableValue<TExtended>,
    ): IAsyncCollection<TInput | TExtended> {
        return new AsyncIterableCollection(
            new AsyncPadEndIterable(
                this,
                maxLength,
                fillItems,
                AsyncIterableCollection.makeCollection,
            ),
        );
    }

    slice(settings?: SliceSettings): IAsyncCollection<TInput> {
        return new AsyncIterableCollection(
            new AsyncSliceIterable(
                this,
                settings?.start,
                settings?.end,
                settings?.throwOnNumberLimit ??
                    AsyncIterableCollection.THROW_ON_NUMBER_LIMIT,
            ),
        );
    }

    prepend<TExtended = TInput>(
        iterable: AsyncIterableValue<TInput | TExtended>,
    ): IAsyncCollection<TInput | TExtended> {
        return new AsyncIterableCollection(
            new AsyncMergeIterable(iterable, this),
        );
    }

    append<TExtended = TInput>(
        iterable: AsyncIterableValue<TInput | TExtended>,
    ): IAsyncCollection<TInput | TExtended> {
        return new AsyncIterableCollection(
            new AsyncMergeIterable(this, iterable),
        );
    }

    insertBefore<TExtended = TInput>(
        filter: AsyncFilter<TInput, IAsyncCollection<TInput>>,
        iterable: AsyncIterableValue<TInput | TExtended>,
        throwOnNumberLimit = AsyncIterableCollection.THROW_ON_NUMBER_LIMIT,
    ): IAsyncCollection<TInput | TExtended> {
        return new AsyncIterableCollection(
            new AsyncInsertBeforeIterable(
                this,
                filter,
                iterable,
                throwOnNumberLimit,
            ),
        );
    }

    insertAfter<TExtended = TInput>(
        filter: AsyncFilter<TInput, IAsyncCollection<TInput>>,
        iterable: AsyncIterableValue<TInput | TExtended>,
        throwOnNumberLimit = AsyncIterableCollection.THROW_ON_NUMBER_LIMIT,
    ): IAsyncCollection<TInput | TExtended> {
        return new AsyncIterableCollection(
            new AsyncInsertAfterIterable(
                this,
                filter,
                iterable,
                throwOnNumberLimit,
            ),
        );
    }

    crossJoin<TExtended = TInput>(
        ...iterables: Array<AsyncIterableValue<TExtended>>
    ): IAsyncCollection<IAsyncCollection<TInput | TExtended>> {
        return new AsyncIterableCollection(
            new AsyncCrossJoinIterable(
                this as IAsyncCollection<TInput>,
                iterables,
                AsyncIterableCollection.makeCollection,
            ),
        );
    }

    zip<TExtended>(
        iterable: AsyncIterableValue<TExtended>,
    ): IAsyncCollection<RecordItem<TInput, TExtended>> {
        return new AsyncIterableCollection(
            new AsyncZipIterable(this, iterable),
        );
    }

    sort(compare?: Comparator<TInput> | undefined): IAsyncCollection<TInput> {
        return new AsyncIterableCollection(
            new AsyncSortIterable(this, compare),
        );
    }

    reverse(settings?: ReverseSettings): IAsyncCollection<TInput> {
        return new AsyncIterableCollection(
            new AsyncReverseIterable(
                this,
                settings?.chunkSize ??
                    AsyncIterableCollection.DEFAULT_CHUNK_SIZE,
                settings?.throwOnNumberLimit ??
                    AsyncIterableCollection.THROW_ON_NUMBER_LIMIT,
                AsyncIterableCollection.makeCollection,
            ),
        );
    }

    shuffle(): IAsyncCollection<TInput> {
        return new AsyncIterableCollection(new AsyncShuffleIterable(this));
    }

    async first<TOutput extends TInput>(
        settings?: AsyncFindSettings<TInput, IAsyncCollection<TInput>, TOutput>,
    ): Promise<TOutput | null> {
        return this.firstOr({
            ...settings,
            defaultValue: null,
        });
    }

    async firstOr<TOutput extends TInput, TExtended = TInput>(
        settings: AsyncFindOrSettings<
            TInput,
            IAsyncCollection<TInput>,
            TOutput,
            TExtended
        >,
    ): Promise<TOutput | TExtended> {
        try {
            const throwOnNumberLimit =
                settings.throwOnNumberLimit ??
                AsyncIterableCollection.THROW_ON_NUMBER_LIMIT;

            const filter = settings.filterFn ?? (() => true);
            for await (const [index, item] of this.entries(
                throwOnNumberLimit,
            )) {
                if (await filter(item, index, this)) {
                    return item as TOutput;
                }
            }
            if (typeof settings.defaultValue === "function") {
                const defaultFn = settings.defaultValue as () => TOutput;
                return defaultFn();
            }
            return settings.defaultValue;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    async firstOrFail<TOutput extends TInput>(
        settings?: AsyncFindSettings<TInput, IAsyncCollection<TInput>, TOutput>,
    ): Promise<TOutput> {
        const item = await this.first(settings);
        if (item === null) {
            throw new ItemNotFoundError("Item was not found");
        }
        return item;
    }

    async last<TOutput extends TInput>(
        settings?: AsyncFindSettings<TInput, IAsyncCollection<TInput>, TOutput>,
    ): Promise<TOutput | null> {
        return this.lastOr({
            ...settings,
            defaultValue: null,
        });
    }

    async lastOr<TOutput extends TInput, TExtended = TInput>(
        settings: AsyncFindOrSettings<
            TInput,
            IAsyncCollection<TInput>,
            TOutput,
            TExtended
        >,
    ): Promise<TOutput | TExtended> {
        try {
            const throwOnNumberLimit =
                settings.throwOnNumberLimit ??
                AsyncIterableCollection.THROW_ON_NUMBER_LIMIT;

            const filter = settings.filterFn ?? (() => true);
            let matchedItem: TOutput | null = null;
            for await (const [index, item] of this.entries(
                throwOnNumberLimit,
            )) {
                if (await filter(item, index, this)) {
                    matchedItem = item as TOutput;
                }
            }
            if (matchedItem) {
                return matchedItem;
            }
            if (typeof settings.defaultValue === "function") {
                const defaultFn = settings.defaultValue as () => TOutput;
                return defaultFn();
            }
            return settings.defaultValue;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    async lastOrFail<TOutput extends TInput>(
        settings?: AsyncFindSettings<TInput, IAsyncCollection<TInput>, TOutput>,
    ): Promise<TOutput> {
        const item = await this.last(settings);
        if (item === null) {
            throw new ItemNotFoundError("Item was not found");
        }
        return item;
    }

    async before(
        filter: AsyncFilter<TInput, IAsyncCollection<TInput>>,
        throwOnNumberLimit = AsyncIterableCollection.THROW_ON_NUMBER_LIMIT,
    ): Promise<TInput | null> {
        return this.beforeOr(null, filter, throwOnNumberLimit);
    }

    async beforeOr<TExtended = TInput>(
        defaultValue: AsyncLazyable<TExtended>,
        filter: AsyncFilter<TInput, IAsyncCollection<TInput>>,
        throwOnNumberLimit = AsyncIterableCollection.THROW_ON_NUMBER_LIMIT,
    ): Promise<TInput | TExtended> {
        try {
            let beforeItem: TInput | null = null,
                index = 0;
            for await (const item of this) {
                if (throwOnNumberLimit && index === Number.MAX_SAFE_INTEGER) {
                    throw new IndexOverflowError("Index has overflowed");
                }
                if ((await filter(item, index, this)) && beforeItem) {
                    return beforeItem;
                }
                index++;
                beforeItem = item;
            }
            if (typeof defaultValue === "function") {
                const defaultFn = defaultValue as () => TExtended;
                return defaultFn();
            }
            return defaultValue;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    async beforeOrFail(
        filter: AsyncFilter<TInput, IAsyncCollection<TInput>>,
        throwOnNumberLimit = AsyncIterableCollection.THROW_ON_NUMBER_LIMIT,
    ): Promise<TInput> {
        const item = await this.before(filter, throwOnNumberLimit);
        if (item === null) {
            throw new ItemNotFoundError("Item was not found");
        }
        return item;
    }

    async after(
        filter: AsyncFilter<TInput, IAsyncCollection<TInput>>,
        throwOnNumberLimit = AsyncIterableCollection.THROW_ON_NUMBER_LIMIT,
    ): Promise<TInput | null> {
        return this.afterOr(null, filter, throwOnNumberLimit);
    }

    async afterOr<TExtended = TInput>(
        defaultValue: AsyncLazyable<TExtended>,
        filter: AsyncFilter<TInput, IAsyncCollection<TInput>>,
        throwOnNumberLimit = AsyncIterableCollection.THROW_ON_NUMBER_LIMIT,
    ): Promise<TInput | TExtended> {
        try {
            let hasMatched = false,
                index = 0;
            for await (const item of this) {
                if (hasMatched) {
                    return item;
                }
                if (throwOnNumberLimit && index === Number.MAX_SAFE_INTEGER) {
                    throw new IndexOverflowError("Index has overflowed");
                }
                hasMatched = await filter(item, index, this);
                index++;
            }
            if (typeof defaultValue === "function") {
                const defaultFn = defaultValue as () => TExtended;
                return defaultFn();
            }
            return defaultValue;
        } catch (error: unknown) {
            if (error instanceof CollectionError) {
                throw error;
            }
            throw new UnexpectedCollectionError("!!__messge__!!", error);
        }
    }

    async afterOrFail(
        filter: AsyncFilter<TInput, IAsyncCollection<TInput>>,
        throwOnNumberLimit = AsyncIterableCollection.THROW_ON_NUMBER_LIMIT,
    ): Promise<TInput> {
        const item = await this.after(filter, throwOnNumberLimit);
        if (item === null) {
            throw new ItemNotFoundError("Item was not found");
        }
        return item;
    }

    async sole<TOutput extends TInput>(
        filter: AsyncFilter<TInput, IAsyncCollection<TInput>, TOutput>,
        throwOnNumberLimit = AsyncIterableCollection.THROW_ON_NUMBER_LIMIT,
    ): Promise<TOutput> {
        try {
            let matchedItem: TOutput | null = null;
            for await (const [index, item] of this.entries(
                throwOnNumberLimit,
            )) {
                if (await filter(item, index, this)) {
                    if (matchedItem !== null) {
                        throw new MultipleItemsFoundError(
                            "Multiple items were found",
                        );
                    }
                    matchedItem = item as TOutput;
                }
            }
            if (matchedItem === null) {
                throw new ItemNotFoundError("Item was not found");
            }
            return matchedItem;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    nth(step: number): IAsyncCollection<TInput> {
        return this.filter((_item, index) => index % step === 0);
    }

    delay(timeInMs: number): IAsyncCollection<TInput> {
        return new AsyncIterableCollection(
            new AsyncDelayIterable(this, timeInMs),
        );
    }

    abort(signal: AbortSignal): IAsyncCollection<TInput> {
        return new AsyncIterableCollection(
            new AsyncAbortIterable(this, signal),
        );
    }

    timeout(timeInMs: number): IAsyncCollection<TInput> {
        return new AsyncIterableCollection(
            new AsyncTimeoutIterable(this, timeInMs),
        );
    }

    async count(
        filter: AsyncFilter<TInput, IAsyncCollection<TInput>>,
        throwOnNumberLimit = AsyncIterableCollection.THROW_ON_NUMBER_LIMIT,
    ): Promise<number> {
        try {
            let size = 0;
            for await (const item of this) {
                if (throwOnNumberLimit && size === Number.MAX_SAFE_INTEGER) {
                    throw new IndexOverflowError("Size has overflowed");
                }
                if (await filter(item, size, this)) {
                    size++;
                }
            }
            return size;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    async size(throwOnNumberLimit?: boolean): Promise<number> {
        return this.count(() => true, throwOnNumberLimit);
    }

    async empty(): Promise<boolean> {
        try {
            for await (const _ of this) {
                return false;
            }
            return true;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    async notEmpty(): Promise<boolean> {
        return !(await this.empty());
    }

    async search(
        filter: AsyncFilter<TInput, IAsyncCollection<TInput>>,
        throwOnNumberLimit = AsyncIterableCollection.THROW_ON_NUMBER_LIMIT,
    ): Promise<number> {
        try {
            for await (const [index, item] of this.entries(
                throwOnNumberLimit,
            )) {
                if (await filter(item, index, this)) {
                    return index;
                }
            }
            return -1;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    async forEach(
        callback: AsyncForEach<TInput, IAsyncCollection<TInput>>,
        throwOnNumberLimit = AsyncIterableCollection.THROW_ON_NUMBER_LIMIT,
    ): Promise<void> {
        for await (const [index, item] of this.entries(throwOnNumberLimit)) {
            await callback(item, index, this);
        }
    }

    async toArray(): Promise<TInput[]> {
        try {
            const items: TInput[] = [];
            for await (const item of this) {
                items.push(item);
            }
            return items;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }
}
