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
    AsyncValidateIterable,
} from "@/collection/implementations/async-iterable-collection/_shared/_module.js";
import {
    isInvokable,
    resolveInvokable,
    type AsyncIterableValue,
    type AsyncLazyable,
} from "@/utilities/_module-exports.js";
import { resolveAsyncLazyable } from "@/utilities/_module-exports.js";
import type {
    AsyncLazy,
    Factory,
    FactoryFn,
} from "@/utilities/_module-exports.js";
import { Task } from "@/task/_module-exports.js";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    UnexpectedError,
} from "@/utilities/_module-exports.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/collection"`
 * @group Adapters
 */
export type AsyncIterableCollectionSettings = {
    taskFactory?: Factory<AsyncLazy<any>, Task<any>>;
};

/**
 * All methods that return {@link IAsyncCollection | `IAsyncCollection`} are executed lazly, meaning the execution will occur iterating the items withthe `forEach` method or `for await` loop.
 *
 * IMPORT_PATH: `"@daiso-tech/core/collection"`
 * @group Adapters
 */
export class AsyncIterableCollection<TInput = unknown>
    implements IAsyncCollection<TInput>
{
    /**
     * The `concat` static method is a convenient utility for easily concatenating multiple {@link Iterable | `Iterable`} or {@link AsyncIterable | `AsyncIterable`}.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core/collection";
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
     * The `difference` static method is used to compute the difference between two {@link Iterable | `Iterable`} instances. By default, the equality check is performed on each item.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core/collection";
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
     * import { AsyncIterableCollection } from "@daiso-tech/core/collection";
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
     * The `zip` static method merges together the values of `iterableA` with the values of the `iterableB` at their corresponding index.
     * The returned collection has size of the shortest collection.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core/collection";
     *
     * const collection = AsyncIterableCollection.zip(["Chair", "Desk"], [100, 200]);
     * await collection.toArray();
     * // [["Chair", 100], ["Desk", 200]]
     * ```
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core/collection";
     *
     * const collection = AsyncIterableCollection.zip(["Chair", "Desk", "Couch"], [100, 200]);
     * await collection.toArray();
     * // [["Chair", 100], ["Desk", 200]]
     * ```
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core/collection";
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

    private static makeCollection = <TInput>(
        iterable: AsyncIterableValue<TInput>,
    ): IAsyncCollection<TInput> => {
        return new AsyncIterableCollection<TInput>(iterable);
    };

    private readonly taskFactory: FactoryFn<AsyncLazy<any>, Task<any>>;

    /**
     * The `constructor` takes an {@link Iterable | `Iterable`} or {@link AsyncIterable | `AsyncIterable`}.
     *
     * Works with `Array`.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core/collection";
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * ```
     *
     * Works with `String`.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core/collection";
     *
     * const collection = new AsyncIterableCollection("ABCDE");
     * ```
     *
     * Works with `Set`.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core/collection";
     *
     * const collection = new AsyncIterableCollection(new Set([1, 2, 2 4]));
     * ```
     *
     * Works with `Map`.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core/collection";
     *
     * const collection = new AsyncIterableCollection(new Map([["a", 1], ["b", 2]]));
     * ```
     *
     * Works with any `Iterable`.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core/collection";
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
     * Works with any `AsyncIterable`.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core/collection";
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
        const { taskFactory = (invokable) => new Task(invokable) } = settings;
        this.taskFactory = resolveInvokable(taskFactory);
    }

    private createTask<TValue = void>(asyncFn: () => PromiseLike<TValue>) {
        return this.taskFactory(asyncFn);
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

    copy(): IAsyncCollection<TInput> {
        return this.entries().map(([_key, value]) => value);
    }

    filter<TOutput extends TInput>(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>, TOutput>,
    ): IAsyncCollection<TOutput> {
        return new AsyncIterableCollection<TOutput>(
            new AsyncFilterIterable(this, predicateFn),
        );
    }

    validate<TOutput>(
        schema: StandardSchemaV1<TInput, TOutput>,
    ): IAsyncCollection<TOutput> {
        return new AsyncIterableCollection(
            new AsyncValidateIterable(this, schema),
        );
    }

    reject<TOutput extends TInput>(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>, TOutput>,
    ): IAsyncCollection<Exclude<TInput, TOutput>> {
        return this.filter(
            async (...arguments_) =>
                !(await resolveInvokable(predicateFn)(...arguments_)),
        );
    }

    map<TOutput>(
        mapFn: AsyncMap<TInput, IAsyncCollection<TInput>, TOutput>,
    ): IAsyncCollection<TOutput> {
        return new AsyncIterableCollection(new AsyncMapIterable(this, mapFn));
    }

    reduce(
        reduce: AsyncReduce<TInput, IAsyncCollection<TInput>, TInput>,
    ): Task<TInput>;
    reduce(
        reduce: AsyncReduce<TInput, IAsyncCollection<TInput>, TInput>,
        // eslint-disable-next-line @typescript-eslint/unified-signatures
        initialValue: TInput,
    ): Task<TInput>;
    reduce<TOutput>(
        reduce: AsyncReduce<TInput, IAsyncCollection<TInput>, TOutput>,
        initialValue: TOutput,
    ): Task<TOutput>;
    reduce<TOutput = TInput>(
        reduce: AsyncReduce<TInput, IAsyncCollection<TInput>, TOutput>,
        initialValue?: TOutput,
    ): Task<TOutput> {
        return this.createTask(async () => {
            if (initialValue === undefined && (await this.isEmpty())) {
                throw new TypeCollectionError(
                    "AsyncReduce of empty array must be inputed a initial value",
                );
            }
            if (initialValue !== undefined) {
                let output = initialValue as TOutput;

                for await (const [index, item] of this.entries()) {
                    output = await resolveInvokable(reduce)(
                        output,
                        item,
                        index,
                        this,
                    );
                }
                return output;
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
            let output: TOutput = (await this.firstOrFail()) as any,
                index = 0,
                isFirstIteration = true;
            for await (const item of this) {
                if (!isFirstIteration) {
                    output = await resolveInvokable(reduce)(
                        output,
                        item,
                        index,
                        this,
                    );
                }
                isFirstIteration = false;
                index++;
            }
            return output;
        });
    }

    join(separator = ","): Task<Extract<TInput, string>> {
        return this.createTask(async () => {
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
        if (isInvokable(value)) {
            fn = value;
        } else {
            fn = () => value;
        }
        return this.change((_, indexToMatch) => indexToMatch === index, fn);
    }

    get(index: number): Task<TInput | null> {
        return this.first((_item, indexToMatch) => indexToMatch === index);
    }

    getOrFail(index: number): Task<TInput> {
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

    sum(): Task<Extract<TInput, number>> {
        return this.createTask(async () => {
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

    average(): Task<Extract<TInput, number>> {
        return this.createTask(async () => {
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

    median(): Task<Extract<TInput, number>> {
        return this.createTask(async () => {
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
                    throw new UnexpectedError("Is in invalid state");
                }
                if (b === undefined) {
                    throw new UnexpectedError("Is in invalid state");
                }
                return ((a + b) / 2) as Extract<TInput, number>;
            }
            const [median] = items;
            if (median === undefined) {
                throw new UnexpectedError("Is in invalid state");
            }
            return median as Extract<TInput, number>;
        });
    }

    min(): Task<Extract<TInput, number>> {
        return this.createTask(async () => {
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

    max(): Task<Extract<TInput, number>> {
        return this.createTask(async () => {
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
    ): Task<number> {
        return this.createTask(async () => {
            if (await this.isEmpty()) {
                throw new EmptyCollectionError(
                    "Collection is empty therby operation cannot be performed",
                );
            }
            let part = 0,
                total = 0;
            for await (const item of this) {
                if (await resolveInvokable(predicateFn)(item, total, this)) {
                    part++;
                }
                total++;
            }
            return (part / total) * 100;
        });
    }

    some<TOutput extends TInput>(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>, TOutput>,
    ): Task<boolean> {
        return this.createTask(async () => {
            for await (const [index, item] of this.entries()) {
                if (await resolveInvokable(predicateFn)(item, index, this)) {
                    return true;
                }
            }
            return false;
        });
    }

    every<TOutput extends TInput>(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>, TOutput>,
    ): Task<boolean> {
        return this.createTask(async () => {
            let isTrue = true;
            for await (const [index, item] of this.entries()) {
                isTrue &&= await resolveInvokable(predicateFn)(
                    item,
                    index,
                    this,
                );
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
            async (...arguments_) =>
                !(await resolveInvokable(predicateFn)(...arguments_)),
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
            async (...arguments_) =>
                !(await resolveInvokable(predicateFn)(...arguments_)),
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
    ): Task<TOutput> {
        return this.createTask(async () => {
            return resolveInvokable(callback)(this);
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
                        (await resolveInvokable(selectFn)(
                            item,
                            index,
                            collection,
                        )) ===
                        (await resolveInvokable(selectFn)(
                            matchItem,
                            matchIndex,
                            matchCollection,
                        ))
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
    ): Task<TOutput | null> {
        return this.firstOr(null, predicateFn);
    }

    firstOr<TOutput extends TInput, TExtended = TInput>(
        defaultValue: AsyncLazyable<TExtended>,
        predicateFn: AsyncPredicate<
            TInput,
            IAsyncCollection<TInput>,
            TOutput
        > = () => true,
    ): Task<TOutput | TExtended> {
        return this.createTask(async () => {
            for await (const [index, item] of this.entries()) {
                if (await resolveInvokable(predicateFn)(item, index, this)) {
                    return item as TOutput;
                }
            }
            return await resolveAsyncLazyable(defaultValue);
        });
    }

    firstOrFail<TOutput extends TInput>(
        predicateFn?: AsyncPredicate<TInput, IAsyncCollection<TInput>, TOutput>,
    ): Task<TOutput> {
        return this.createTask<TOutput>(async () => {
            const item = await this.first(predicateFn);
            if (item === null) {
                throw new ItemNotFoundCollectionError("Item was not found");
            }
            return item;
        });
    }

    last<TOutput extends TInput>(
        predicateFn?: AsyncPredicate<TInput, IAsyncCollection<TInput>, TOutput>,
    ): Task<TOutput | null> {
        return this.lastOr(null, predicateFn);
    }

    lastOr<TOutput extends TInput, TExtended = TInput>(
        defaultValue: AsyncLazyable<TExtended>,
        predicateFn: AsyncPredicate<
            TInput,
            IAsyncCollection<TInput>,
            TOutput
        > = () => true,
    ): Task<TOutput | TExtended> {
        return this.createTask<TOutput | TExtended>(async () => {
            let matchedItem: TOutput | null = null;
            for await (const [index, item] of this.entries()) {
                if (await resolveInvokable(predicateFn)(item, index, this)) {
                    matchedItem = item as TOutput;
                }
            }
            if (matchedItem !== null) {
                return matchedItem;
            }
            return await resolveAsyncLazyable(defaultValue);
        });
    }

    lastOrFail<TOutput extends TInput>(
        predicateFn?: AsyncPredicate<TInput, IAsyncCollection<TInput>, TOutput>,
    ): Task<TOutput> {
        return this.createTask<TOutput>(async () => {
            const item = await this.last(predicateFn);
            if (item === null) {
                throw new ItemNotFoundCollectionError("Item was not found");
            }
            return item;
        });
    }

    before(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
    ): Task<TInput | null> {
        return this.beforeOr(null, predicateFn);
    }

    beforeOr<TExtended = TInput>(
        defaultValue: AsyncLazyable<TExtended>,
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
    ): Task<TInput | TExtended> {
        return this.createTask<TInput | TExtended>(async () => {
            let beforeItem: TInput | null = null,
                index = 0;
            for await (const item of this) {
                if (
                    (await resolveInvokable(predicateFn)(item, index, this)) &&
                    beforeItem !== null
                ) {
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
    ): Task<TInput> {
        return this.createTask<TInput>(async () => {
            const item = await this.before(predicateFn);
            if (item === null) {
                throw new ItemNotFoundCollectionError("Item was not found");
            }
            return item;
        });
    }

    after(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
    ): Task<TInput | null> {
        return this.afterOr(null, predicateFn);
    }

    afterOr<TExtended = TInput>(
        defaultValue: AsyncLazyable<TExtended>,
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
    ): Task<TInput | TExtended> {
        return this.createTask(async () => {
            let hasMatched = false,
                index = 0;
            for await (const item of this) {
                if (hasMatched) {
                    return item;
                }
                hasMatched = await resolveInvokable(predicateFn)(
                    item,
                    index,
                    this,
                );
                index++;
            }
            return await resolveAsyncLazyable(defaultValue);
        });
    }

    afterOrFail(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
    ): Task<TInput> {
        return this.createTask<TInput>(async () => {
            const item = await this.after(predicateFn);
            if (item === null) {
                throw new ItemNotFoundCollectionError("Item was not found");
            }
            return item;
        });
    }

    sole<TOutput extends TInput>(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>, TOutput>,
    ): Task<TOutput> {
        return this.createTask<TOutput>(async () => {
            let matchedItem: TOutput | null = null;
            for await (const [index, item] of this.entries()) {
                if (await resolveInvokable(predicateFn)(item, index, this)) {
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

    count(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
    ): Task<number> {
        return this.createTask(async () => {
            let size = 0;
            for await (const item of this) {
                if (await resolveInvokable(predicateFn)(item, size, this)) {
                    size++;
                }
            }
            return size;
        });
    }

    size(): Task<number> {
        return this.count(() => true);
    }

    isEmpty(): Task<boolean> {
        return this.createTask(async () => {
            for await (const _ of this) {
                return false;
            }
            return true;
        });
    }

    isNotEmpty(): Task<boolean> {
        return this.createTask(async () => {
            return !(await this.isEmpty());
        });
    }

    searchFirst(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
    ): Task<number> {
        return this.createTask(async () => {
            for await (const [index, item] of this.entries()) {
                if (await resolveInvokable(predicateFn)(item, index, this)) {
                    return index;
                }
            }
            return -1;
        });
    }

    searchLast(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
    ): Task<number> {
        return this.createTask(async () => {
            let matchedIndex = -1;
            for await (const [index, item] of this.entries()) {
                if (await resolveInvokable(predicateFn)(item, index, this)) {
                    matchedIndex = index;
                }
            }
            return matchedIndex;
        });
    }

    forEach(
        callback: AsyncForEach<TInput, IAsyncCollection<TInput>>,
    ): Task<void> {
        return this.createTask(async () => {
            for await (const [index, item] of this.entries()) {
                await resolveInvokable(callback)(item, index, this);
            }
        });
    }

    toArray(): Task<TInput[]> {
        return this.createTask(async () => {
            const items: TInput[] = [];
            for await (const item of this) {
                items.push(item);
            }
            return items;
        });
    }

    toRecord(): Task<EnsureRecord<TInput>> {
        return this.createTask(async () => {
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

    toMap(): Task<EnsureMap<TInput>> {
        return this.createTask(async () => {
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
