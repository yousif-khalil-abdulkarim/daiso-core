/**
 * @module Collection
 */

import type {
    EnsureMap,
    EnsureRecord,
} from "@/collection/contracts/_module-exports.js";
import {
    type AsyncCollapse,
    type AsyncPredicate,
    type AsyncForEach,
    type AsyncMap,
    type AsyncModifier,
    type AsyncTap,
    type AsyncTransform,
    type Comparator,
    type IAsyncCollection,
    ItemNotFoundCollectionError,
    MultipleItemsFoundCollectionError,
    UnexpectedCollectionError,
    TypeCollectionError,
    type AsyncReduce,
    EmptyCollectionError,
    type CrossJoinResult,
} from "@/collection/contracts/_module-exports.js";
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
    AsyncChangeIterable,
    AsyncWhenIterable,
    AsyncZipIterable,
    AsyncReverseIterable,
    AsyncSliceIterable,
    AsyncRepeatIterable,
    AsyncTakeUntilAbortIterable,
    AsyncDelayIterable,
    AsyncTakeUntilTimeoutIterable,
} from "@/collection/implementations/async-iterable-collection/_shared/_module.js";
import {
    type AsyncIterableValue,
    type AsyncLazyable,
} from "@/utilities/_module-exports.js";
import { resolveAsyncLazyable } from "@/utilities/_module-exports.js";
import type { TimeSpan } from "@/utilities/_module-exports.js";
import type {
    BackoffPolicy,
    LazyPromiseSettingsBase,
    RetryPolicy,
} from "@/async/_module-exports.js";
import { LazyPromise } from "@/async/_module-exports.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection"```
 * @group Adapters
 */
export type AsyncIterableCollectionSettings = LazyPromiseSettingsBase;

/**
 * All methods that return <i>{@link IAsyncCollection}</i> are executed lazly.
 * The methods that return <i>{@link IAsyncCollection}</i> will only be executed when <i>forEach</i> method is called or <i>for await</i> loop.
 * The methods that return <i>{@link PromiseLike}</i> object will execute only when awaited or <i>then</i> method is called.
 * @group Adapters
 */
export class AsyncIterableCollection<TInput = unknown>
    implements IAsyncCollection<TInput>
{
    /**
     * The <i>concat<i> static method is a convenient utility for easily concatenating multiple <i>{@link Iterable}</i> or <i>{@link AsyncIterable}</i>.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";
     *
     * class MyAsyncIterable implements AsyncIterable<number> {
     *   async *[Symbol.iterator](): Iterator<number> {
     *     yield "a";
     *     yield "b";
     *     yield "c";
     *   }
     * }
     *
     * class MyIterable implements Iterable<number> {
     *   *[Symbol.iterator](): Iterator<number> {
     *     yield 1;
     *     yield 2;
     *     yield 3;
     *   }
     * }
     *
     * const collection = AsyncIterableCollection.concat([
     *   new MyAsyncIterable(),
     *   new MyIterable(),
     *   new Set([1, 2, 3]),
     *   new Map([["a", 1], ["b", 2]]),
     *   ["a", "b", "c"]
     * ]);
     * await collection.toArray();
     * // ["a", "b", "c", 1, 2, 3, 1, 2, 3, ["a", 1], ["b", 2], "a", "b", "c"]
     * ```
     */
    static concat<TValue>(
        iterables: AsyncIterableValue<AsyncIterableValue<TValue>>,
    ): IAsyncCollection<TValue> {
        return new AsyncIterableCollection(new AsyncMergeIterable(iterables));
    }

    /**
     * The <i>difference</i> static method is used to compute the difference between two <i>{@link Iterable}</i> instances. By default, the equality check is performed on each item.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";
     *
     * const collection = AsyncIterableCollection.difference(
     *   [1, 2, 2, 3, 4, 5],
     *   [2, 4, 6, 8]
     * );
     * await collection.toArray();
     * // [1, 3, 5]
     * ```
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";
     *
     * const collection = AsyncIterableCollection.difference(
     *   [
     *     { name: "iPhone 6", brand: "Apple", type: "phone" },
     *     { name: "iPhone 5", brand: "Apple", type: "phone" },
     *     { name: "Apple Watch", brand: "Apple", type: "watch" },
     *     { name: "Galaxy S6", brand: "Samsung", type: "phone" },
     *     { name: "Galaxy Gear", brand: "Samsung", type: "watch" },
     *   ],
     *   [
     *     { name: "Apple Watch", brand: "Apple", type: "watch" },
     *   ],
     *   (product) => product.type
     * );
     * await collection.toArray();
     * // [
     * //   { name: "iPhone 6", brand: "Apple", type: "phone" },
     * //   { name: "iPhone 5", brand: "Apple", type: "phone" },
     * //   { name: "Galaxy S6", brand: "Samsung", type: "phone" },
     * // ]
     * ```
     */
    static difference<TValue, TSelect>(
        iterableA: AsyncIterableValue<TValue>,
        iterableB: AsyncIterableValue<TValue>,
        selectFn?: AsyncMap<TValue, IAsyncCollection<TValue>, TSelect>,
    ): IAsyncCollection<TValue> {
        return new AsyncIterableCollection(iterableA).difference(
            iterableB,
            selectFn,
        );
    }

    /**
     * The <i>zip</i> static method merges together the values of <i>iterableA</i> with the values of the <i>iterableB</i> at their corresponding index.
     * The returned collection has size of the shortest collection.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = AsyncIterableCollection.zip(["Chair", "Desk"], [100, 200]);
     * await collection.toArray();
     * // [["Chair", 100], ["Desk", 200]]
     * ```
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = AsyncIterableCollection.zip(["Chair", "Desk", "Couch"], [100, 200]);
     * await collection.toArray();
     * // [["Chair", 100], ["Desk", 200]]
     * ```
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = AsyncIterableCollection.zip(["Chair", "Desk"], [100, 200, 300]);
     * await collection.toArray();
     * // [["Chair", 100], ["Desk", 200]]
     * ```
     */
    static zip<TValueA, TValueB>(
        iterableA: AsyncIterableValue<TValueA>,
        iterableB: AsyncIterableValue<TValueB>,
    ): IAsyncCollection<[TValueA, TValueB]> {
        return new AsyncIterableCollection(iterableA).zip(iterableB);
    }

    private static DEFAULT_CHUNK_SIZE = 1024;

    private static defaultRetryPolicy: RetryPolicy = (error) => {
        return !(
            error instanceof ItemNotFoundCollectionError ||
            error instanceof MultipleItemsFoundCollectionError ||
            error instanceof TypeCollectionError ||
            error instanceof EmptyCollectionError
        );
    };

    private static makeCollection = <TInput>(
        iterable: AsyncIterableValue<TInput>,
    ): IAsyncCollection<TInput> => {
        return new AsyncIterableCollection<TInput>(iterable);
    };

    private readonly retryAttempts: number | null;
    private readonly backoffPolicy: BackoffPolicy | null;
    private readonly retryPolicy: RetryPolicy | null;
    private readonly retryTimeout: TimeSpan | null;
    private readonly totalTimeout: TimeSpan | null;

    /**
     * The <i>constructor</i> takes an <i>{@link Iterable}</i> or <i>{@link AsyncIterable}</i>.
     *
     * Works with <i>Array</i>.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * ```
     *
     * Works with <i>String</i>.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";
     *
     * const collection = new AsyncIterableCollection("ABCDE");
     * ```
     *
     * Works with <i>Set</i>.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";
     *
     * const collection = new AsyncIterableCollection(new Set([1, 2, 2 4]));
     * ```
     *
     * Works with <i>Map</i>.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";
     *
     * const collection = new AsyncIterableCollection(new Map([["a", 1], ["b", 2]]));
     * ```
     *
     * Works with any <i>Iterable</i>.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";
     *
     * class MyIterable implements Iterable<number> {
     *   *[Symbol.iterator](): Iterator<number> {
     *     yield 1;
     *     yield 2;
     *     yield 3;
     *   }
     * }
     * const collection = new AsyncIterableCollection(new MyIterable());
     * ```
     *
     * Works with any <i>AsyncIterable</i>.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";
     *
     * class MyIterable implements AsyncIterable<number> {
     *   async *[Symbol.iterator](): Iterator<number> {
     *     yield 1;
     *     yield 2;
     *     yield 3;
     *   }
     * }
     * const collection = new AsyncIterableCollection(new MyIterable());
     * ```
     */
    constructor(
        private readonly iterable: AsyncIterableValue<TInput> = [],
        settings: AsyncIterableCollectionSettings = {},
    ) {
        const {
            retryAttempts = null,
            retryPolicy = AsyncIterableCollection.defaultRetryPolicy,
            backoffPolicy = null,
            retryTimeout = null,
            totalTimeout = null,
        } = settings;
        this.retryAttempts = retryAttempts;
        this.backoffPolicy = backoffPolicy;
        this.retryPolicy = retryPolicy;
        this.retryTimeout = retryTimeout;
        this.totalTimeout = totalTimeout;
    }

    private createLazyPromise<TValue = void>(
        asyncFn: () => PromiseLike<TValue>,
    ) {
        return new LazyPromise(asyncFn, {
            retryAttempts: this.retryAttempts,
            backoffPolicy: this.backoffPolicy,
            retryPolicy: this.retryPolicy,
            retryTimeout: this.retryTimeout,
            totalTimeout: this.totalTimeout,
        });
    }

    async *[Symbol.asyncIterator](): AsyncIterator<TInput> {
        yield* this.iterable;
    }

    toIterator(): AsyncIterator<TInput, void> {
        return this[Symbol.asyncIterator]() as AsyncIterator<TInput, void>;
    }

    entries(): IAsyncCollection<[number, TInput]> {
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
    ): LazyPromise<TInput>;
    reduce(
        reduceFn: AsyncReduce<TInput, IAsyncCollection<TInput>, TInput>,
        // eslint-disable-next-line @typescript-eslint/unified-signatures
        initialValue: TInput,
    ): LazyPromise<TInput>;
    reduce<TOutput>(
        reduceFn: AsyncReduce<TInput, IAsyncCollection<TInput>, TOutput>,
        initialValue: TOutput,
    ): LazyPromise<TOutput>;
    reduce<TOutput = TInput>(
        reduceFn: AsyncReduce<TInput, IAsyncCollection<TInput>, TOutput>,
        initialValue?: TOutput,
    ): LazyPromise<TOutput> {
        return this.createLazyPromise(async () => {
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
        });
    }

    join(separator = ","): LazyPromise<Extract<TInput, string>> {
        return this.createLazyPromise(async () => {
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
            return str as Extract<TInput, string>;
        });
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
    ): IAsyncCollection<TInput | TFilterOutput | TMapOutput> {
        return new AsyncIterableCollection(
            new AsyncChangeIterable(this, predicateFn, mapFn),
        );
    }

    set(
        index: number,
        value: TInput | AsyncMap<TInput, IAsyncCollection<TInput>, TInput>,
    ): IAsyncCollection<TInput> {
        if (index < 0) {
            return this;
        }
        let fn: AsyncMap<TInput, IAsyncCollection<TInput>, TInput>;
        if (typeof value === "function") {
            fn = value as AsyncMap<TInput, IAsyncCollection<TInput>, TInput>;
        } else {
            fn = () => value;
        }
        return this.change((_, indexToMatch) => indexToMatch === index, fn);
    }

    get(index: number): LazyPromise<TInput | null> {
        return this.first((_item, indexToMatch) => indexToMatch === index);
    }

    getOrFail(index: number): LazyPromise<TInput> {
        return this.firstOrFail(
            (_item, indexToMatch) => indexToMatch === index,
        );
    }

    page(page: number, pageSize: number): IAsyncCollection<TInput> {
        if (page < 0) {
            return this.skip(page * pageSize).take(pageSize);
        }
        return this.skip((page - 1) * pageSize).take(pageSize);
    }

    sum(): LazyPromise<Extract<TInput, number>> {
        return this.createLazyPromise(async () => {
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
            return sum as Extract<TInput, number>;
        });
    }

    average(): LazyPromise<Extract<TInput, number>> {
        return this.createLazyPromise(async () => {
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
            return (sum / size) as Extract<TInput, number>;
        });
    }

    median(): LazyPromise<Extract<TInput, number>> {
        return this.createLazyPromise(async () => {
            if (await this.isEmpty()) {
                throw new EmptyCollectionError(
                    "Collection is empty therby operation cannot be performed",
                );
            }
            const size = await this.size();
            if (size === 0) {
                return 0 as Extract<TInput, number>;
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
                return ((a + b) / 2) as Extract<TInput, number>;
            }
            const [median] = items;
            if (median === undefined) {
                throw new UnexpectedCollectionError("Is in invalid state");
            }
            return median as Extract<TInput, number>;
        });
    }

    min(): LazyPromise<Extract<TInput, number>> {
        return this.createLazyPromise(async () => {
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
            return min as Extract<TInput, number>;
        });
    }

    max(): LazyPromise<Extract<TInput, number>> {
        return this.createLazyPromise(async () => {
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
            return max as Extract<TInput, number>;
        });
    }

    percentage(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
    ): LazyPromise<number> {
        return this.createLazyPromise(async () => {
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
        });
    }

    some<TOutput extends TInput>(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>, TOutput>,
    ): LazyPromise<boolean> {
        return this.createLazyPromise(async () => {
            for await (const [index, item] of this.entries()) {
                if (await predicateFn(item, index, this)) {
                    return true;
                }
            }
            return false;
        });
    }

    every<TOutput extends TInput>(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>, TOutput>,
    ): LazyPromise<boolean> {
        return this.createLazyPromise(async () => {
            let isTrue = true;
            for await (const [index, item] of this.entries()) {
                isTrue &&= await predicateFn(item, index, this);
                if (!isTrue) {
                    break;
                }
            }
            return isTrue;
        });
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

    pipe<TOutput = TInput>(
        callback: AsyncTransform<IAsyncCollection<TInput>, TOutput>,
    ): LazyPromise<TOutput> {
        return this.createLazyPromise(async () => {
            return await callback(this);
        });
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
    ): IAsyncCollection<[TOutput, IAsyncCollection<TInput>]> {
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
    ): IAsyncCollection<[TOutput, number]> {
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
        ) => item as unknown as TOutput,
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
        return new AsyncIterableCollection<TInput | TExtended>(
            new AsyncMergeIterable([iterable, this]),
        );
    }

    append<TExtended = TInput>(
        iterable: AsyncIterableValue<TInput | TExtended>,
    ): IAsyncCollection<TInput | TExtended> {
        return new AsyncIterableCollection(
            new AsyncMergeIterable([this, iterable]),
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

    crossJoin<TExtended>(
        iterable: AsyncIterableValue<TExtended>,
    ): IAsyncCollection<CrossJoinResult<TInput, TExtended>> {
        return new AsyncIterableCollection(
            new AsyncCrossJoinIterable(
                this,
                iterable,
                AsyncIterableCollection.makeCollection,
            ),
        );
    }

    zip<TExtended>(
        iterable: AsyncIterableValue<TExtended>,
    ): IAsyncCollection<[TInput, TExtended]> {
        return new AsyncIterableCollection(
            new AsyncZipIterable(this, iterable),
        );
    }

    sort(comparator?: Comparator<TInput>): IAsyncCollection<TInput> {
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

    first<TOutput extends TInput>(
        predicateFn?: AsyncPredicate<TInput, IAsyncCollection<TInput>, TOutput>,
    ): LazyPromise<TOutput | null> {
        return this.firstOr(null, predicateFn);
    }

    firstOr<TOutput extends TInput, TExtended = TInput>(
        defaultValue: AsyncLazyable<TExtended>,
        predicateFn: AsyncPredicate<
            TInput,
            IAsyncCollection<TInput>,
            TOutput
        > = () => true,
    ): LazyPromise<TOutput | TExtended> {
        return this.createLazyPromise(async () => {
            for await (const [index, item] of this.entries()) {
                if (await predicateFn(item, index, this)) {
                    return item as TOutput;
                }
            }
            return await resolveAsyncLazyable(defaultValue);
        });
    }

    firstOrFail<TOutput extends TInput>(
        predicateFn?: AsyncPredicate<TInput, IAsyncCollection<TInput>, TOutput>,
    ): LazyPromise<TOutput> {
        return this.createLazyPromise<TOutput>(async () => {
            const item = await this.first(predicateFn);
            if (item === null) {
                throw new ItemNotFoundCollectionError("Item was not found");
            }
            return item;
        });
    }

    last<TOutput extends TInput>(
        predicateFn?: AsyncPredicate<TInput, IAsyncCollection<TInput>, TOutput>,
    ): LazyPromise<TOutput | null> {
        return this.lastOr(null, predicateFn);
    }

    lastOr<TOutput extends TInput, TExtended = TInput>(
        defaultValue: AsyncLazyable<TExtended>,
        predicateFn: AsyncPredicate<
            TInput,
            IAsyncCollection<TInput>,
            TOutput
        > = () => true,
    ): LazyPromise<TOutput | TExtended> {
        return this.createLazyPromise<TOutput | TExtended>(async () => {
            let matchedItem: TOutput | null = null;
            for await (const [index, item] of this.entries()) {
                if (await predicateFn(item, index, this)) {
                    matchedItem = item as TOutput;
                }
            }
            if (matchedItem) {
                return matchedItem;
            }
            return await resolveAsyncLazyable(defaultValue);
        });
    }

    lastOrFail<TOutput extends TInput>(
        predicateFn?: AsyncPredicate<TInput, IAsyncCollection<TInput>, TOutput>,
    ): LazyPromise<TOutput> {
        return this.createLazyPromise<TOutput>(async () => {
            const item = await this.last(predicateFn);
            if (item === null) {
                throw new ItemNotFoundCollectionError("Item was not found");
            }
            return item;
        });
    }

    before(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
    ): LazyPromise<TInput | null> {
        return this.beforeOr(null, predicateFn);
    }

    beforeOr<TExtended = TInput>(
        defaultValue: AsyncLazyable<TExtended>,
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
    ): LazyPromise<TInput | TExtended> {
        return this.createLazyPromise<TInput | TExtended>(async () => {
            let beforeItem: TInput | null = null,
                index = 0;
            for await (const item of this) {
                if ((await predicateFn(item, index, this)) && beforeItem) {
                    return beforeItem;
                }
                index++;
                beforeItem = item;
            }
            return await resolveAsyncLazyable(defaultValue);
        });
    }

    beforeOrFail(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
    ): LazyPromise<TInput> {
        return this.createLazyPromise<TInput>(async () => {
            const item = await this.before(predicateFn);
            if (item === null) {
                throw new ItemNotFoundCollectionError("Item was not found");
            }
            return item;
        });
    }

    after(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
    ): LazyPromise<TInput | null> {
        return this.afterOr(null, predicateFn);
    }

    afterOr<TExtended = TInput>(
        defaultValue: AsyncLazyable<TExtended>,
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
    ): LazyPromise<TInput | TExtended> {
        return this.createLazyPromise(async () => {
            let hasMatched = false,
                index = 0;
            for await (const item of this) {
                if (hasMatched) {
                    return item;
                }
                hasMatched = await predicateFn(item, index, this);
                index++;
            }
            return await resolveAsyncLazyable(defaultValue);
        });
    }

    afterOrFail(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
    ): LazyPromise<TInput> {
        return this.createLazyPromise<TInput>(async () => {
            const item = await this.after(predicateFn);
            if (item === null) {
                throw new ItemNotFoundCollectionError("Item was not found");
            }
            return item;
        });
    }

    sole<TOutput extends TInput>(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>, TOutput>,
    ): LazyPromise<TOutput> {
        return this.createLazyPromise<TOutput>(async () => {
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
        });
    }

    nth(step: number): IAsyncCollection<TInput> {
        return this.filter((_item, index) => index % step === 0);
    }

    delay(time: TimeSpan): IAsyncCollection<TInput> {
        return new AsyncIterableCollection(new AsyncDelayIterable(this, time));
    }

    takeUntilAbort(abortSignal: AbortSignal): IAsyncCollection<TInput> {
        return new AsyncIterableCollection(
            new AsyncTakeUntilAbortIterable(this, abortSignal),
        );
    }

    takeUntilTimeout(time: TimeSpan): IAsyncCollection<TInput> {
        return new AsyncIterableCollection(
            new AsyncTakeUntilTimeoutIterable(this, time),
        );
    }

    count(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
    ): LazyPromise<number> {
        return this.createLazyPromise(async () => {
            let size = 0;
            for await (const item of this) {
                if (await predicateFn(item, size, this)) {
                    size++;
                }
            }
            return size;
        });
    }

    size(): LazyPromise<number> {
        return this.count(() => true);
    }

    isEmpty(): LazyPromise<boolean> {
        return this.createLazyPromise(async () => {
            for await (const _ of this) {
                return false;
            }
            return true;
        });
    }

    isNotEmpty(): LazyPromise<boolean> {
        return this.createLazyPromise(async () => {
            return !(await this.isEmpty());
        });
    }

    searchFirst(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
    ): LazyPromise<number> {
        return this.createLazyPromise(async () => {
            for await (const [index, item] of this.entries()) {
                if (await predicateFn(item, index, this)) {
                    return index;
                }
            }
            return -1;
        });
    }

    searchLast(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
    ): LazyPromise<number> {
        return this.createLazyPromise(async () => {
            let matchedIndex = -1;
            for await (const [index, item] of this.entries()) {
                if (await predicateFn(item, index, this)) {
                    matchedIndex = index;
                }
            }
            return matchedIndex;
        });
    }

    forEach(
        callback: AsyncForEach<TInput, IAsyncCollection<TInput>>,
    ): LazyPromise<void> {
        return this.createLazyPromise(async () => {
            for await (const [index, item] of this.entries()) {
                await callback(item, index, this);
            }
        });
    }

    toArray(): LazyPromise<TInput[]> {
        return this.createLazyPromise(async () => {
            const items: TInput[] = [];
            for await (const item of this) {
                items.push(item);
            }
            return items;
        });
    }

    toRecord(): LazyPromise<EnsureRecord<TInput>> {
        return this.createLazyPromise(async () => {
            const record: Record<string | number | symbol, unknown> = {};
            for await (const item of this) {
                if (!Array.isArray(item)) {
                    throw new TypeCollectionError(
                        "Item type is invalid must be a tuple of size 2 where first tuple item is a string or number or symbol",
                    );
                }
                if (item.length !== 2) {
                    throw new TypeCollectionError(
                        "Item type is invalid must be a tuple of size 2 where first tuple item is a string or number or symbol",
                    );
                }
                const [key, value] = item;
                if (
                    !(
                        typeof key === "string" ||
                        typeof key === "number" ||
                        typeof key === "symbol"
                    )
                ) {
                    throw new TypeCollectionError(
                        "Item type is invalid must be a tuple of size 2 where first tuple item is a string or number or symbol",
                    );
                }
                record[key] = value;
            }
            return record as EnsureRecord<TInput>;
        });
    }

    toMap(): LazyPromise<EnsureMap<TInput>> {
        return this.createLazyPromise(async () => {
            const map = new Map();
            for await (const item of this) {
                if (!Array.isArray(item)) {
                    throw new TypeCollectionError(
                        "Item type is invalid must be a tuple of size 2",
                    );
                }
                if (item.length !== 2) {
                    throw new TypeCollectionError(
                        "Item type is invalid must be a tuple of size 2",
                    );
                }
                const [key, value] = item;
                map.set(key, value);
            }
            return map as EnsureMap<TInput>;
        });
    }
}
