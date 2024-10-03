/**
 * @module Collections
 */

import {
    type AsyncCollapse,
    type AsyncPredicate,
    type AsyncForEach,
    type AsyncMap,
    type AsyncModifier,
    type AsyncTap,
    type AsyncTransform,
    CollectionError,
    type Comparator,
    type IAsyncCollection,
    ItemNotFoundCollectionError,
    MultipleItemsFoundCollectionError,
    UnexpectedCollectionError,
    TypeCollectionError,
    type ChangendItem,
    type AsyncReduce,
    EmptyCollectionError,
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
} from "@/collection/async-iterable-collection/_shared/_module";
import {
    type AsyncIterableValue,
    type AsyncLazyable,
    type EnsureType,
} from "@/_shared/types";
import { type RecordItem } from "@/_shared/types";
import { simplifyAsyncLazyable } from "@/_shared/utilities";

/**
 * All methods that return <i>{@link IAsyncCollection}</i> are executed lazly which means they will be executed when the <i>AsyncIterableCollection</i> is iterated with <i>forEach</i> method or "for await of" loop.
 * The rest of the methods are executed eagerly.
 * @group Adapters
 */
export class AsyncIterableCollection<TInput>
    implements IAsyncCollection<TInput>
{
    private static DEFAULT_CHUNK_SIZE = 1024;

    private static makeCollection = <TInput>(
        iterable: AsyncIterableValue<TInput>,
    ): IAsyncCollection<TInput> => {
        return new AsyncIterableCollection<TInput>(iterable);
    };

    /**
     * The <i>constructor</i> takes an <i>{@link Iterable}</i> or <i>{@link AsyncIterable}</i>.
     */
    constructor(private iterable: AsyncIterableValue<TInput> = []) {}

    async *[Symbol.asyncIterator](): AsyncIterator<TInput> {
        yield* this.iterable;
    }

    toIterator(): AsyncIterator<TInput, void> {
        return this[Symbol.asyncIterator]() as AsyncIterator<TInput, void>;
    }

    entries(): IAsyncCollection<RecordItem<number, TInput>> {
        return new AsyncIterableCollection(new AsyncEntriesIterable(this));
    }

    keys(): IAsyncCollection<number> {
        return this.entries().map(([key]) => key);
    }

    values(): IAsyncCollection<TInput> {
        return this.entries().map(([_key, value]) => value);
    }

    filter<TOutput extends TInput>(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>, TOutput>,
    ): IAsyncCollection<TOutput> {
        return new AsyncIterableCollection<TOutput>(
            new AsyncFilterIterable(this, predicateFn),
        );
    }

    reject<TOutput extends TInput>(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>, TOutput>,
    ): IAsyncCollection<Exclude<TInput, TOutput>> {
        return this.filter(
            async (...arguments_) => !(await predicateFn(...arguments_)),
        );
    }

    map<TOutput>(
        mapFn: AsyncMap<TInput, IAsyncCollection<TInput>, TOutput>,
    ): IAsyncCollection<TOutput> {
        return new AsyncIterableCollection(new AsyncMapIterable(this, mapFn));
    }

    reduce(
        reduceFn: AsyncReduce<TInput, IAsyncCollection<TInput>, TInput>,
    ): Promise<TInput>;
    reduce(
        reduceFn: AsyncReduce<TInput, IAsyncCollection<TInput>, TInput>,
        // eslint-disable-next-line @typescript-eslint/unified-signatures
        initialValue: TInput,
    ): Promise<TInput>;
    reduce<TOutput>(
        reduceFn: AsyncReduce<TInput, IAsyncCollection<TInput>, TOutput>,
        initialValue: TOutput,
    ): Promise<TOutput>;
    async reduce<TOutput = TInput>(
        reduceFn: AsyncReduce<TInput, IAsyncCollection<TInput>, TOutput>,
        initialValue?: TOutput,
    ): Promise<TOutput> {
        if (initialValue === undefined && (await this.isEmpty())) {
            throw new TypeCollectionError(
                "Reduce of empty array must be inputed a initial value",
            );
        }
        if (initialValue !== undefined) {
            let output = initialValue as TOutput;

            for await (const [index, item] of this.entries()) {
                output = await reduceFn(output, item, index, this);
            }
            return output;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
        let output: TOutput = (await this.firstOrFail()) as any,
            index = 0,
            isFirstIteration = true;
        for await (const item of this) {
            if (!isFirstIteration) {
                output = await reduceFn(output, item, index, this);
            }
            isFirstIteration = false;
            index++;
        }
        return output;
    }

    async join(separator = ","): Promise<EnsureType<TInput, string>> {
        let str: string | null = null;
        for await (const item of this) {
            if (typeof item !== "string") {
                throw new TypeCollectionError(
                    "Item type is invalid must be string",
                );
            }
            if (str === null) {
                str = item;
            } else {
                str = str + separator + item;
            }
        }
        return str as EnsureType<TInput, string>;
    }

    collapse(): IAsyncCollection<AsyncCollapse<TInput>> {
        return new AsyncIterableCollection(new AsyncCollapseIterable(this));
    }

    flatMap<TOutput>(
        mapFn: AsyncMap<TInput, IAsyncCollection<TInput>, Iterable<TOutput>>,
    ): IAsyncCollection<TOutput> {
        return new AsyncIterableCollection(
            new AsyncFlatMapIterable(this, mapFn),
        );
    }

    change<TFilterOutput extends TInput, TMapOutput>(
        predicateFn: AsyncPredicate<
            TInput,
            IAsyncCollection<TInput>,
            TFilterOutput
        >,
        mapFn: AsyncMap<TFilterOutput, IAsyncCollection<TInput>, TMapOutput>,
    ): IAsyncCollection<ChangendItem<TInput, TFilterOutput, TMapOutput>> {
        return new AsyncIterableCollection(
            new AsyncUpdateIterable(this, predicateFn, mapFn),
        );
    }

    page(page: number, pageSize: number): IAsyncCollection<TInput> {
        if (page < 0) {
            return this.skip(page * pageSize).take(pageSize);
        }
        return this.skip((page - 1) * pageSize).take(pageSize);
    }

    async sum(): Promise<EnsureType<TInput, number>> {
        try {
            if (await this.isEmpty()) {
                throw new EmptyCollectionError(
                    "Collection is empty therby operation cannot be performed",
                );
            }
            let sum = 0;
            for await (const item of this) {
                if (typeof item !== "number") {
                    throw new TypeCollectionError(
                        "Item type is invalid must be number",
                    );
                }
                sum += item;
            }
            return sum as EnsureType<TInput, number>;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    async average(): Promise<EnsureType<TInput, number>> {
        try {
            if (await this.isEmpty()) {
                throw new EmptyCollectionError(
                    "Collection is empty therby operation cannot be performed",
                );
            }
            let size = 0,
                sum = 0;
            for await (const item of this) {
                if (typeof item !== "number") {
                    throw new TypeCollectionError(
                        "Item type is invalid must be number",
                    );
                }
                size++;
                sum += item;
            }
            return (sum / size) as EnsureType<TInput, number>;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    async median(): Promise<EnsureType<TInput, number>> {
        if (await this.isEmpty()) {
            throw new EmptyCollectionError(
                "Collection is empty therby operation cannot be performed",
            );
        }
        const size = await this.size();
        if (size === 0) {
            return 0 as EnsureType<TInput, number>;
        }
        const isEven = size % 2 === 0,
            items = await this.map((item) => {
                if (typeof item !== "number") {
                    throw new TypeCollectionError(
                        "Item type is invalid must be number",
                    );
                }
                return item;
            })
                .filter((_item, index) => {
                    if (isEven) {
                        return index === size / 2 || index === size / 2 - 1;
                    }
                    return index === Math.floor(size / 2);
                })

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
            if (await this.isEmpty()) {
                throw new EmptyCollectionError(
                    "Collection is empty therby operation cannot be performed",
                );
            }
            let min = 0;
            for await (const item of this) {
                if (typeof item !== "number") {
                    throw new TypeCollectionError(
                        "Item type is invalid must be number",
                    );
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
                error instanceof TypeCollectionError
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
            if (await this.isEmpty()) {
                throw new EmptyCollectionError(
                    "Collection is empty therby operation cannot be performed",
                );
            }
            let max = 0;
            for await (const item of this) {
                if (typeof item !== "number") {
                    throw new TypeCollectionError(
                        "Item type is invalid must be number",
                    );
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
                error instanceof TypeCollectionError
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
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
    ): Promise<number> {
        try {
            if (await this.isEmpty()) {
                throw new EmptyCollectionError(
                    "Collection is empty therby operation cannot be performed",
                );
            }
            let part = 0,
                total = 0;
            for await (const item of this) {
                if (await predicateFn(item, total, this)) {
                    part++;
                }
                total++;
            }
            return (part / total) * 100;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
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
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>, TOutput>,
    ): Promise<boolean> {
        try {
            for await (const [index, item] of this.entries()) {
                if (await predicateFn(item, index, this)) {
                    return true;
                }
            }
            return false;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
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
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>, TOutput>,
    ): Promise<boolean> {
        try {
            let isTrue = true;
            for await (const [index, item] of this.entries()) {
                isTrue &&= await predicateFn(item, index, this);
                if (!isTrue) {
                    break;
                }
            }
            return isTrue;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    take(limit: number): IAsyncCollection<TInput> {
        return new AsyncIterableCollection(new AsyncTakeIterable(this, limit));
    }

    takeUntil(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
    ): IAsyncCollection<TInput> {
        return new AsyncIterableCollection(
            new AsyncTakeUntilIterable(this, predicateFn),
        );
    }

    takeWhile(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
    ): IAsyncCollection<TInput> {
        return this.takeUntil(
            async (...arguments_) => !(await predicateFn(...arguments_)),
        );
    }

    skip(offset: number): IAsyncCollection<TInput> {
        return new AsyncIterableCollection(new AsyncSkipIterable(this, offset));
    }

    skipUntil(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
    ): IAsyncCollection<TInput> {
        return new AsyncIterableCollection(
            new AsyncSkipUntilIterable(this, predicateFn),
        );
    }

    skipWhile(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
    ): IAsyncCollection<TInput> {
        return this.skipUntil(
            async (...arguments_) => !(await predicateFn(...arguments_)),
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
            new AsyncWhenIterable(this, () => this.isEmpty(), callback),
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
            new AsyncWhenIterable(this, () => this.isNotEmpty(), callback),
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
                error instanceof TypeCollectionError
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
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
    ): IAsyncCollection<IAsyncCollection<TInput>> {
        return new AsyncIterableCollection(
            new AsyncChunkWhileIterable(
                this,
                predicateFn,
                AsyncIterableCollection.makeCollection,
            ),
        );
    }

    split(chunkAmount: number): IAsyncCollection<IAsyncCollection<TInput>> {
        return new AsyncIterableCollection(
            new AsyncSplitIterable(
                this,
                chunkAmount,
                AsyncIterableCollection.makeCollection,
            ),
        );
    }

    partition(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
    ): IAsyncCollection<IAsyncCollection<TInput>> {
        return new AsyncIterableCollection(
            new AsyncPartionIterable(
                this,
                predicateFn,
                AsyncIterableCollection.makeCollection,
            ),
        );
    }

    sliding(
        chunkSize: number,
        step = chunkSize - 1,
    ): IAsyncCollection<IAsyncCollection<TInput>> {
        return new AsyncIterableCollection(
            new AsyncSlidingIteralbe(this, chunkSize, step),
        );
    }

    groupBy<TOutput = TInput>(
        selectFn?: AsyncMap<TInput, IAsyncCollection<TInput>, TOutput>,
    ): IAsyncCollection<RecordItem<TOutput, IAsyncCollection<TInput>>> {
        return new AsyncIterableCollection(
            new AsyncGroupByIterable(
                this,
                selectFn,
                AsyncIterableCollection.makeCollection,
            ),
        );
    }

    countBy<TOutput = TInput>(
        selectFn?: AsyncMap<TInput, IAsyncCollection<TInput>, TOutput>,
    ): IAsyncCollection<RecordItem<TOutput, number>> {
        return new AsyncIterableCollection(
            new AsyncCountByIterable(this, selectFn),
        );
    }

    unique<TOutput = TInput>(
        selectFn?: AsyncMap<TInput, IAsyncCollection<TInput>, TOutput>,
    ): IAsyncCollection<TInput> {
        return new AsyncIterableCollection(
            new AsyncUniqueIterable(this, selectFn),
        );
    }

    difference<TOutput = TInput>(
        iterable: AsyncIterableValue<TInput>,
        selectFn: AsyncMap<TInput, IAsyncCollection<TInput>, TOutput> = (
            item,
        ) =>
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
            item as any,
    ): IAsyncCollection<TInput> {
        const differenceCollection = new AsyncIterableCollection(iterable);
        return this.filter(async (item, index, collection) => {
            return !(await differenceCollection.some(
                async (matchItem, matchIndex, matchCollection) => {
                    return (
                        (await selectFn(item, index, collection)) ===
                        (await selectFn(matchItem, matchIndex, matchCollection))
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

    slice(start?: number, end?: number): IAsyncCollection<TInput> {
        return new AsyncIterableCollection(
            new AsyncSliceIterable(this, start, end),
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
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
        iterable: AsyncIterableValue<TInput | TExtended>,
    ): IAsyncCollection<TInput | TExtended> {
        return new AsyncIterableCollection(
            new AsyncInsertBeforeIterable(this, predicateFn, iterable),
        );
    }

    insertAfter<TExtended = TInput>(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
        iterable: AsyncIterableValue<TInput | TExtended>,
    ): IAsyncCollection<TInput | TExtended> {
        return new AsyncIterableCollection(
            new AsyncInsertAfterIterable(this, predicateFn, iterable),
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

    sort(
        comparator?: Comparator<TInput> | undefined,
    ): IAsyncCollection<TInput> {
        return new AsyncIterableCollection(
            new AsyncSortIterable(this, comparator),
        );
    }

    reverse(chunkSize?: number): IAsyncCollection<TInput> {
        return new AsyncIterableCollection(
            new AsyncReverseIterable(
                this,
                chunkSize ?? AsyncIterableCollection.DEFAULT_CHUNK_SIZE,
                AsyncIterableCollection.makeCollection,
            ),
        );
    }

    shuffle(mathRandom = Math.random): IAsyncCollection<TInput> {
        return new AsyncIterableCollection(
            new AsyncShuffleIterable(this, mathRandom),
        );
    }

    async first<TOutput extends TInput>(
        predicateFn?: AsyncPredicate<TInput, IAsyncCollection<TInput>, TOutput>,
    ): Promise<TOutput | null> {
        return this.firstOr(null, predicateFn);
    }

    async firstOr<TOutput extends TInput, TExtended = TInput>(
        defaultValue: AsyncLazyable<TExtended>,
        predicateFn: AsyncPredicate<
            TInput,
            IAsyncCollection<TInput>,
            TOutput
        > = () => true,
    ): Promise<TOutput | TExtended> {
        try {
            for await (const [index, item] of this.entries()) {
                if (await predicateFn(item, index, this)) {
                    return item as TOutput;
                }
            }
            return await simplifyAsyncLazyable(defaultValue);
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
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
        predicateFn?: AsyncPredicate<TInput, IAsyncCollection<TInput>, TOutput>,
    ): Promise<TOutput> {
        const item = await this.first(predicateFn);
        if (item === null) {
            throw new ItemNotFoundCollectionError("Item was not found");
        }
        return item;
    }

    async last<TOutput extends TInput>(
        predicateFn?: AsyncPredicate<TInput, IAsyncCollection<TInput>, TOutput>,
    ): Promise<TOutput | null> {
        return this.lastOr(null, predicateFn);
    }

    async lastOr<TOutput extends TInput, TExtended = TInput>(
        defaultValue: AsyncLazyable<TExtended>,
        predicateFn: AsyncPredicate<
            TInput,
            IAsyncCollection<TInput>,
            TOutput
        > = () => true,
    ): Promise<TOutput | TExtended> {
        try {
            let matchedItem: TOutput | null = null;
            for await (const [index, item] of this.entries()) {
                if (await predicateFn(item, index, this)) {
                    matchedItem = item as TOutput;
                }
            }
            if (matchedItem) {
                return matchedItem;
            }
            return await simplifyAsyncLazyable(defaultValue);
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
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
        predicateFn?: AsyncPredicate<TInput, IAsyncCollection<TInput>, TOutput>,
    ): Promise<TOutput> {
        const item = await this.last(predicateFn);
        if (item === null) {
            throw new ItemNotFoundCollectionError("Item was not found");
        }
        return item;
    }

    async before(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
    ): Promise<TInput | null> {
        return this.beforeOr(null, predicateFn);
    }

    async beforeOr<TExtended = TInput>(
        defaultValue: AsyncLazyable<TExtended>,
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
    ): Promise<TInput | TExtended> {
        try {
            let beforeItem: TInput | null = null,
                index = 0;
            for await (const item of this) {
                if ((await predicateFn(item, index, this)) && beforeItem) {
                    return beforeItem;
                }
                index++;
                beforeItem = item;
            }
            return await simplifyAsyncLazyable(defaultValue);
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
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
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
    ): Promise<TInput> {
        const item = await this.before(predicateFn);
        if (item === null) {
            throw new ItemNotFoundCollectionError("Item was not found");
        }
        return item;
    }

    async after(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
    ): Promise<TInput | null> {
        return this.afterOr(null, predicateFn);
    }

    async afterOr<TExtended = TInput>(
        defaultValue: AsyncLazyable<TExtended>,
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
    ): Promise<TInput | TExtended> {
        try {
            let hasMatched = false,
                index = 0;
            for await (const item of this) {
                if (hasMatched) {
                    return item;
                }
                hasMatched = await predicateFn(item, index, this);
                index++;
            }
            return await simplifyAsyncLazyable(defaultValue);
        } catch (error: unknown) {
            if (error instanceof CollectionError) {
                throw error;
            }
            throw new UnexpectedCollectionError("!!__messge__!!", error);
        }
    }

    async afterOrFail(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
    ): Promise<TInput> {
        const item = await this.after(predicateFn);
        if (item === null) {
            throw new ItemNotFoundCollectionError("Item was not found");
        }
        return item;
    }

    async sole<TOutput extends TInput>(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>, TOutput>,
    ): Promise<TOutput> {
        try {
            let matchedItem: TOutput | null = null;
            for await (const [index, item] of this.entries()) {
                if (await predicateFn(item, index, this)) {
                    if (matchedItem !== null) {
                        throw new MultipleItemsFoundCollectionError(
                            "Multiple items were found",
                        );
                    }
                    matchedItem = item as TOutput;
                }
            }
            if (matchedItem === null) {
                throw new ItemNotFoundCollectionError("Item was not found");
            }
            return matchedItem;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
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
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
    ): Promise<number> {
        try {
            let size = 0;
            for await (const item of this) {
                if (await predicateFn(item, size, this)) {
                    size++;
                }
            }
            return size;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    async size(): Promise<number> {
        return this.count(() => true);
    }

    async isEmpty(): Promise<boolean> {
        try {
            for await (const _ of this) {
                return false;
            }
            return true;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    async isNotEmpty(): Promise<boolean> {
        return !(await this.isEmpty());
    }

    async searchFirst(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
    ): Promise<number> {
        try {
            for await (const [index, item] of this.entries()) {
                if (await predicateFn(item, index, this)) {
                    return index;
                }
            }
            return -1;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    async searchLast(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
    ): Promise<number> {
        try {
            let matchedIndex = -1;
            for await (const [index, item] of this.entries()) {
                if (await predicateFn(item, index, this)) {
                    matchedIndex = index;
                }
            }
            return matchedIndex;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
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
    ): Promise<void> {
        for await (const [index, item] of this.entries()) {
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
                error instanceof TypeCollectionError
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
