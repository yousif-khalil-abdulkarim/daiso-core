/**
 * @module Collection
 */

import type {
    EnsureMap,
    EnsureRecord,
} from "@/collection/contracts/_module-exports.js";
import {
    type Collapse,
    type Comparator,
    type Predicate,
    type ForEach,
    type ICollection,
    ItemNotFoundCollectionError,
    type Map,
    type Modifier,
    MultipleItemsFoundCollectionError,
    type Tap,
    type Transform,
    UnexpectedCollectionError,
    TypeCollectionError,
    type Reduce,
    EmptyCollectionError,
    type CrossJoinResult,
} from "@/collection/contracts/_module-exports.js";
import {
    CrossJoinIterable,
    SlidingIteralbe,
    ShuffleIterable,
    EntriesIterable,
    FilterIterable,
    ChunkIterable,
    ChunkWhileIterable,
    CollapseIterable,
    CountByIterable,
    FlatMapIterable,
    GroupByIterable,
    InsertAfterIterable,
    InsertBeforeIterable,
    MapIterable,
    MergeIterable,
    PadEndIterable,
    PadStartIterable,
    PartionIterable,
    SkipIterable,
    SkipUntilIterable,
    SortIterable,
    SplitIterable,
    TakeIterable,
    TakeUntilIterable,
    TapIterable,
    UniqueIterable,
    ChangeIterable,
    WhenIterable,
    ZipIterable,
    ReverseIterable,
    SliceIterable,
    RepeatIterable,
} from "@/collection/implementations/iterable-collection/_shared/_module.js";
import { type Lazyable } from "@/utilities/_module-exports.js";
import { simplifyLazyable } from "@/utilities/_module-exports.js";

/**
 * All methods that return <i>{@link ICollection}</i> are executed lazly which means they will be executed when the <i>IterableCollection</i> is iterated with <i>forEach</i> method or "for of" loop.
 * The rest of the methods are executed eagerly.
 * @group Adapters
 */
export class IterableCollection<TInput = unknown>
    implements ICollection<TInput>
{
    /**
     * The <i>concat<i> static method is a convenient utility for easily concatenating multiple <i>{@link Iterable}</i>.
     * @example
     * ```ts
     * import { IterableCollection } from "@daiso-tech/core";
     *
     * class MyIterable implements Iterable<number> {
     *   *[Symbol.iterator](): Iterator<number> {
     *     yield 1;
     *     yield 2;
     *     yield 3;
     *   }
     * }
     *
     * const collection = IterableCollection.concat([
     *   new MyIterable(),
     *   new Set([1, 2, 3]),
     *   new Map([["a", 1], ["b", 2]]),
     *   ["a", "b", "c"]
     * ]);
     * collection.toArray();
     * // [1, 2, 3, 1, 2, 3, ["a", 1], ["b", 2], "a", "b", "c"]
     * ```
     */
    static concat<TValue>(
        iterables: Iterable<Iterable<TValue>>,
    ): ICollection<TValue> {
        return new IterableCollection(new MergeIterable(iterables));
    }

    /**
     * The <i>difference</i> static method is used to compute the difference between two <i>{@link Iterable}</i> instances. By default, the equality check is performed on each item.
     * @example
     * ```ts
     * import { IterableCollection } from "@daiso-tech/core";
     *
     * const collection = IterableCollection.difference(
     *   [1, 2, 2, 3, 4, 5],
     *   [2, 4, 6, 8]
     * );
     * collection.toArray();
     * // [1, 3, 5]
     * ```
     * @example
     * ```ts
     * import { IterableCollection } from "@daiso-tech/core";
     *
     * const collection = IterableCollection.difference(
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
     * collection.toArray();
     * // [
     * //   { name: "iPhone 6", brand: "Apple", type: "phone" },
     * //   { name: "iPhone 5", brand: "Apple", type: "phone" },
     * //   { name: "Galaxy S6", brand: "Samsung", type: "phone" },
     * // ]
     * ```
     */
    static difference<TValue, TSelect>(
        iterableA: Iterable<TValue>,
        iterableB: Iterable<TValue>,
        selectFn?: Map<TValue, ICollection<TValue>, TSelect>,
    ): ICollection<TValue> {
        return new IterableCollection(iterableA).difference(
            iterableB,
            selectFn,
        );
    }

    /**
     * The <i>zip</i> static method merges together the values of <i>iterableA</i> with the values of the <i>iterableB</i> at their corresponding index.
     * The returned collection has size of the shortest collection.
     * @example
     * ```ts
     * import { IterableCollection } from "@daiso-tech/core";;
     *
     * const collection = IterableCollection.zip(["Chair", "Desk"], [100, 200]);
     * collection.toArray();
     * // [["Chair", 100], ["Desk", 200]]
     * ```
     * @example
     * ```ts
     * import { IterableCollection } from "@daiso-tech/core";;
     *
     * const collection = IterableCollection.zip(["Chair", "Desk", "Couch"], [100, 200]);
     * collection.toArray();
     * // [["Chair", 100], ["Desk", 200]]
     * ```
     * @example
     * ```ts
     * import { IterableCollection } from "@daiso-tech/core";;
     *
     * const collection = IterableCollection.zip(["Chair", "Desk"], [100, 200, 300]);
     * collection.toArray();
     * // [["Chair", 100], ["Desk", 200]]
     * ```
     */
    static zip<TValueA, TValueB>(
        iterableA: Iterable<TValueA>,
        iterableB: Iterable<TValueB>,
    ): ICollection<[TValueA, TValueB]> {
        return new IterableCollection(iterableA).zip(iterableB);
    }

    static deserialize<TInput>(serializedValue: TInput[]): ICollection<TInput> {
        return new IterableCollection(serializedValue);
    }

    private static DEFAULT_CHUNK_SIZE = 1024;

    private static makeCollection = <TInput>(
        iterable: Iterable<TInput> = [],
    ): ICollection<TInput> => {
        return new IterableCollection<TInput>(iterable);
    };

    /**
     * The <i>constructor</i> takes an <i>{@link Iterable}</i>.
     *
     * Works with <i>Array</i>.
     * @example
     * ```ts
     * import { IterableCollection } from "@daiso-tech/core";
     *
     * const collection = new IterableCollection([1, 2, 3, 4]);
     * ```
     *
     * Works with <i>String</i>.
     * @example
     * ```ts
     * import { IterableCollection } from "@daiso-tech/core";
     *
     * const collection = new IterableCollection("ABCDE");
     * ```
     *
     * Works with <i>Set</i>.
     * @example
     * ```ts
     * import { IterableCollection } from "@daiso-tech/core";
     *
     * const collection = new IterableCollection(new Set([1, 2, 2 4]));
     * ```
     *
     * Works with <i>Map</i>.
     * @example
     * ```ts
     * import { IterableCollection } from "@daiso-tech/core";
     *
     * const collection = new IterableCollection(new Map([["a", 1], ["b", 2]]));
     * ```
     *
     * Works with any <i>Iterable</i>.
     * @example
     * ```ts
     * import { IterableCollection } from "@daiso-tech/core";
     *
     * class MyIterable implements Iterable<number> {
     *   *[Symbol.iterator](): Iterator<number> {
     *     yield 1;
     *     yield 2;
     *     yield 3;
     *   }
     * }
     * const collection = new IterableCollection(new MyIterable());
     * ```
     */
    constructor(private readonly iterable: Iterable<TInput>) {}

    serialize(): TInput[] {
        return this.toArray();
    }

    *[Symbol.iterator](): Iterator<TInput> {
        yield* this.iterable;
    }

    toIterator(): Iterator<TInput, void> {
        return this[Symbol.iterator]() as Iterator<TInput, void>;
    }

    entries(): ICollection<[number, TInput]> {
        return new IterableCollection(new EntriesIterable(this));
    }

    keys(): ICollection<number> {
        return this.entries().map(([key]) => key);
    }

    values(): ICollection<TInput> {
        return this.entries().map(([_key, value]) => value);
    }

    filter<TOutput extends TInput>(
        predicateFn: Predicate<TInput, ICollection<TInput>, TOutput>,
    ): ICollection<TOutput> {
        return new IterableCollection<TOutput>(
            new FilterIterable(this, predicateFn),
        );
    }

    reject<TOutput extends TInput>(
        predicateFn: Predicate<TInput, ICollection<TInput>, TOutput>,
    ): ICollection<Exclude<TInput, TOutput>> {
        return this.filter((...arguments_) => !predicateFn(...arguments_));
    }

    map<TOutput>(
        mapFn: Map<TInput, ICollection<TInput>, TOutput>,
    ): ICollection<TOutput> {
        return new IterableCollection(new MapIterable(this, mapFn));
    }

    reduce(reduceFn: Reduce<TInput, ICollection<TInput>, TInput>): TInput;
    reduce(
        reduceFn: Reduce<TInput, ICollection<TInput>, TInput>,
        // eslint-disable-next-line @typescript-eslint/unified-signatures
        initialValue: TInput,
    ): TInput;
    reduce<TOutput>(
        reduceFn: Reduce<TInput, ICollection<TInput>, TOutput>,
        initialValue: TOutput,
    ): TOutput;
    reduce<TOutput = TInput>(
        reduceFn: Reduce<TInput, ICollection<TInput>, TOutput>,
        initialValue?: TOutput,
    ): TOutput {
        if (initialValue === undefined && this.isEmpty()) {
            throw new TypeCollectionError(
                "Reduce of empty array must be inputed a initial value",
            );
        }
        if (initialValue !== undefined) {
            let output = initialValue as TOutput,
                index = 0;
            for (const item of this) {
                output = reduceFn(output, item, index, this);
                index++;
            }
            return output;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-explicit-any
        let output: TOutput = this.firstOrFail() as any,
            index = 0,
            isFirstIteration = true;
        for (const item of this) {
            if (!isFirstIteration) {
                output = reduceFn(output, item, index, this);
            }
            isFirstIteration = false;
            index++;
        }
        return output;
    }

    join(separator = ","): Extract<TInput, string> {
        let str: string | null = null;
        for (const item of this) {
            if (typeof item !== "string") {
                throw new TypeCollectionError(
                    "Item type is invalid must be string",
                );
            }
            if (str === null) {
                str = item as string;
            } else {
                str = str + separator + (item as string);
            }
        }
        return str as Extract<TInput, string>;
    }

    collapse(): ICollection<Collapse<TInput>> {
        return new IterableCollection(new CollapseIterable(this));
    }

    flatMap<TOutput>(
        mapFn: Map<TInput, ICollection<TInput>, Iterable<TOutput>>,
    ): ICollection<TOutput> {
        return new IterableCollection(new FlatMapIterable(this, mapFn));
    }

    change<TFilterOutput extends TInput, TMapOutput>(
        predicateFn: Predicate<TInput, ICollection<TInput>, TFilterOutput>,
        mapFn: Map<TFilterOutput, ICollection<TInput>, TMapOutput>,
    ): ICollection<TInput | TFilterOutput | TMapOutput> {
        return new IterableCollection(
            new ChangeIterable(this, predicateFn, mapFn),
        );
    }

    set(
        index: number,
        value: TInput | Map<TInput, ICollection<TInput>, TInput>,
    ): ICollection<TInput> {
        if (index < 0) {
            return this;
        }
        let fn: Map<TInput, ICollection<TInput>, TInput>;
        if (typeof value === "function") {
            fn = value as Map<TInput, ICollection<TInput>, TInput>;
        } else {
            fn = () => value;
        }
        return this.change((_, indexToMatch) => indexToMatch === index, fn);
    }

    get(index: number): TInput | null {
        return this.first((_item, indexToMatch) => indexToMatch === index);
    }

    getOrFail(index: number): TInput {
        return this.firstOrFail(
            (_item, indexToMatch) => indexToMatch === index,
        );
    }

    page(page: number, pageSize: number): ICollection<TInput> {
        if (page < 0) {
            return this.skip(page * pageSize).take(pageSize);
        }
        return this.skip((page - 1) * pageSize).take(pageSize);
    }

    sum(): Extract<TInput, number> {
        if (this.isEmpty()) {
            throw new EmptyCollectionError(
                "Collection is empty therby operation cannot be performed",
            );
        }
        let sum = 0;
        for (const item of this) {
            if (typeof item !== "number") {
                throw new TypeCollectionError(
                    "Item type is invalid must be number",
                );
            }
            sum += item;
        }
        return sum as Extract<TInput, number>;
    }

    average(): Extract<TInput, number> {
        if (this.isEmpty()) {
            throw new EmptyCollectionError(
                "Collection is empty therby operation cannot be performed",
            );
        }
        let size = 0,
            sum = 0;
        for (const item of this) {
            if (typeof item !== "number") {
                throw new TypeCollectionError(
                    "Item type is invalid must be number",
                );
            }
            size++;
            sum += item;
        }
        return (sum / size) as Extract<TInput, number>;
    }

    median(): Extract<TInput, number> {
        if (this.isEmpty()) {
            throw new EmptyCollectionError(
                "Collection is empty therby operation cannot be performed",
            );
        }
        const size = this.size();
        if (size === 0) {
            return 0 as Extract<TInput, number>;
        }
        const isEven = size % 2 === 0,
            items = this.map((item) => {
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
    }

    min(): Extract<TInput, number> {
        if (this.isEmpty()) {
            throw new EmptyCollectionError(
                "Collection is empty therby operation cannot be performed",
            );
        }
        let min = 0;
        for (const item of this) {
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
    }

    max(): Extract<TInput, number> {
        if (this.isEmpty()) {
            throw new EmptyCollectionError(
                "Collection is empty therby operation cannot be performed",
            );
        }
        let max = 0;
        for (const item of this) {
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
    }

    percentage(predicateFn: Predicate<TInput, ICollection<TInput>>): number {
        if (this.isEmpty()) {
            throw new EmptyCollectionError(
                "Collection is empty therby operation cannot be performed",
            );
        }
        let part = 0,
            total = 0;
        for (const item of this) {
            if (predicateFn(item, total, this)) {
                part++;
            }
            total++;
        }
        return (part / total) * 100;
    }

    some<TOutput extends TInput>(
        predicateFn: Predicate<TInput, ICollection<TInput>, TOutput>,
    ): boolean {
        let index = 0;
        for (const item of this) {
            if (predicateFn(item, index, this)) {
                return true;
            }
            index++;
        }
        return false;
    }

    every<TOutput extends TInput>(
        predicateFn: Predicate<TInput, ICollection<TInput>, TOutput>,
    ): boolean {
        let index = 0,
            isTrue = true;
        for (const item of this) {
            isTrue &&= predicateFn(item, index, this);
            if (!isTrue) {
                break;
            }
            index++;
        }
        return isTrue;
    }

    take(limit: number): ICollection<TInput> {
        return new IterableCollection(new TakeIterable(this, limit));
    }

    takeUntil(
        predicateFn: Predicate<TInput, ICollection<TInput>>,
    ): ICollection<TInput> {
        return new IterableCollection(new TakeUntilIterable(this, predicateFn));
    }

    takeWhile(
        predicateFn: Predicate<TInput, ICollection<TInput>>,
    ): ICollection<TInput> {
        return this.takeUntil((...arguments_) => !predicateFn(...arguments_));
    }

    skip(offset: number): ICollection<TInput> {
        return new IterableCollection(new SkipIterable(this, offset));
    }

    skipUntil(
        predicateFn: Predicate<TInput, ICollection<TInput>>,
    ): ICollection<TInput> {
        return new IterableCollection(new SkipUntilIterable(this, predicateFn));
    }

    skipWhile<TOutput extends TInput>(
        predicateFn: Predicate<TInput, ICollection<TInput>, TOutput>,
    ): ICollection<TInput> {
        return this.skipUntil((...arguments_) => !predicateFn(...arguments_));
    }

    when<TExtended = TInput>(
        condition: boolean,
        callback: Modifier<ICollection<TInput>, ICollection<TExtended>>,
    ): ICollection<TInput | TExtended> {
        return new IterableCollection(
            new WhenIterable(this, () => condition, callback),
        );
    }

    whenEmpty<TExtended = TInput>(
        callback: Modifier<ICollection<TInput>, ICollection<TExtended>>,
    ): ICollection<TInput | TExtended> {
        return new IterableCollection(
            new WhenIterable(this, () => this.isEmpty(), callback),
        );
    }

    whenNot<TExtended = TInput>(
        condition: boolean,
        callback: Modifier<ICollection<TInput>, ICollection<TExtended>>,
    ): ICollection<TInput | TExtended> {
        return this.when(!condition, callback);
    }

    whenNotEmpty<TExtended = TInput>(
        callback: Modifier<ICollection<TInput>, ICollection<TExtended>>,
    ): ICollection<TInput | TExtended> {
        return new IterableCollection(
            new WhenIterable(this, () => this.isNotEmpty(), callback),
        );
    }

    pipe<TOutput = TInput>(
        callback: Transform<ICollection<TInput>, TOutput>,
    ): TOutput {
        return callback(this);
    }

    tap(callback: Tap<ICollection<TInput>>): ICollection<TInput> {
        return new IterableCollection(new TapIterable(this, callback));
    }

    chunk(chunkSize: number): ICollection<ICollection<TInput>> {
        return new IterableCollection(
            new ChunkIterable(
                this,
                chunkSize,
                IterableCollection.makeCollection,
            ),
        );
    }

    chunkWhile(
        predicateFn: Predicate<TInput, ICollection<TInput>>,
    ): ICollection<ICollection<TInput>> {
        return new IterableCollection(
            new ChunkWhileIterable(
                this,
                predicateFn,
                IterableCollection.makeCollection,
            ),
        );
    }

    split(chunkAmount: number): ICollection<ICollection<TInput>> {
        return new IterableCollection(
            new SplitIterable(
                this,
                chunkAmount,
                IterableCollection.makeCollection,
            ),
        );
    }

    partition(
        predicateFn: Predicate<TInput, ICollection<TInput>>,
    ): ICollection<ICollection<TInput>> {
        return new IterableCollection(
            new PartionIterable(
                this,
                predicateFn,
                IterableCollection.makeCollection,
            ),
        );
    }

    sliding(
        chunkSize: number,
        step = chunkSize - 1,
    ): ICollection<ICollection<TInput>> {
        return new IterableCollection(
            new SlidingIteralbe(this, chunkSize, step),
        );
    }

    groupBy<TOutput = TInput>(
        selectFn?: Map<TInput, ICollection<TInput>, TOutput>,
    ): ICollection<[TOutput, ICollection<TInput>]> {
        return new IterableCollection(
            new GroupByIterable(
                this,
                selectFn,
                IterableCollection.makeCollection,
            ),
        );
    }

    countBy<TOutput = TInput>(
        selectFn?: Map<TInput, ICollection<TInput>, TOutput>,
    ): ICollection<[TOutput, number]> {
        return new IterableCollection(new CountByIterable(this, selectFn));
    }

    unique<TOutput>(
        selectFn?: Map<TInput, ICollection<TInput>, TOutput>,
    ): ICollection<TInput> {
        return new IterableCollection(new UniqueIterable(this, selectFn));
    }

    difference<TOutput = TInput>(
        iterable: Iterable<TInput>,
        mapFn: Map<TInput, ICollection<TInput>, TOutput> = (item) =>
            item as unknown as TOutput,
    ): ICollection<TInput> {
        const differenceCollection = new IterableCollection(iterable);
        return this.filter((item, index, collection) => {
            return !differenceCollection.some(
                (matchItem, matchIndex, matchCollection) => {
                    return (
                        mapFn(item, index, collection) ===
                        mapFn(matchItem, matchIndex, matchCollection)
                    );
                },
            );
        });
    }

    repeat(amount: number): ICollection<TInput> {
        return new IterableCollection(
            new RepeatIterable(this, amount, IterableCollection.makeCollection),
        );
    }

    padStart<TExtended = TInput>(
        maxLength: number,
        fillItems: Iterable<TExtended>,
    ): ICollection<TInput | TExtended> {
        return new IterableCollection(
            new PadStartIterable(
                this,
                maxLength,
                fillItems,
                IterableCollection.makeCollection,
            ),
        );
    }

    padEnd<TExtended = TInput>(
        maxLength: number,
        fillItems: Iterable<TExtended>,
    ): ICollection<TInput | TExtended> {
        return new IterableCollection(
            new PadEndIterable(
                this,
                maxLength,
                fillItems,
                IterableCollection.makeCollection,
            ),
        );
    }

    slice(start?: number, end?: number): ICollection<TInput> {
        return new IterableCollection(new SliceIterable(this, start, end));
    }

    prepend<TExtended = TInput>(
        iterable: Iterable<TInput | TExtended>,
    ): ICollection<TInput | TExtended> {
        return new IterableCollection(new MergeIterable([iterable, this]));
    }

    append<TExtended = TInput>(
        iterable: Iterable<TInput | TExtended>,
    ): ICollection<TInput | TExtended> {
        return new IterableCollection(new MergeIterable([this, iterable]));
    }

    insertBefore<TExtended = TInput>(
        predicateFn: Predicate<TInput, ICollection<TInput>>,
        iterable: Iterable<TInput | TExtended>,
    ): ICollection<TInput | TExtended> {
        return new IterableCollection(
            new InsertBeforeIterable(this, predicateFn, iterable),
        );
    }

    insertAfter<TExtended = TInput>(
        predicateFn: Predicate<TInput, ICollection<TInput>>,
        iterable: Iterable<TInput | TExtended>,
    ): ICollection<TInput | TExtended> {
        return new IterableCollection(
            new InsertAfterIterable(this, predicateFn, iterable),
        );
    }

    crossJoin<TExtended>(
        iterable: Iterable<TExtended>,
    ): ICollection<CrossJoinResult<TInput, TExtended>> {
        return new IterableCollection(
            new CrossJoinIterable(
                this,
                iterable,
                IterableCollection.makeCollection,
            ),
        );
    }

    zip<TExtended>(
        iterable: Iterable<TExtended>,
    ): ICollection<[TInput, TExtended]> {
        return new IterableCollection(new ZipIterable(this, iterable));
    }

    sort(comparator?: Comparator<TInput>): ICollection<TInput> {
        return new IterableCollection(new SortIterable(this, comparator));
    }

    reverse(
        chunkSize = IterableCollection.DEFAULT_CHUNK_SIZE,
    ): ICollection<TInput> {
        return new IterableCollection(
            new ReverseIterable(
                this,
                chunkSize,
                IterableCollection.makeCollection,
            ),
        );
    }

    shuffle(mathRandom = Math.random): ICollection<TInput> {
        return new IterableCollection(new ShuffleIterable(this, mathRandom));
    }

    first<TOutput extends TInput>(
        predicateFn?: Predicate<TInput, ICollection<TInput>, TOutput>,
    ): TOutput | null {
        return this.firstOr(null, predicateFn);
    }

    firstOr<TOutput extends TInput, TExtended = TInput>(
        defaultValue: Lazyable<TExtended>,
        predicateFn: Predicate<TInput, ICollection<TInput>, TOutput> = () =>
            true,
    ): TOutput | TExtended {
        let index = 0;
        for (const item of this) {
            if (predicateFn(item, index, this)) {
                return item as TOutput;
            }
            index++;
        }
        return simplifyLazyable(defaultValue);
    }

    firstOrFail<TOutput extends TInput>(
        predicateFn?: Predicate<TInput, ICollection<TInput>, TOutput>,
    ): TOutput {
        const item = this.first(predicateFn);
        if (item === null) {
            throw new ItemNotFoundCollectionError("Item was not found");
        }
        return item;
    }

    last<TOutput extends TInput>(
        predicateFn?: Predicate<TInput, ICollection<TInput>, TOutput>,
    ): TOutput | null {
        return this.lastOr(null, predicateFn);
    }

    lastOr<TOutput extends TInput, TExtended = TInput>(
        defaultValue: Lazyable<TExtended>,
        predicateFn: Predicate<TInput, ICollection<TInput>, TOutput> = () =>
            true,
    ): TOutput | TExtended {
        let index = 0;
        let matchedItem: TOutput | null = null;
        for (const item of this) {
            if (predicateFn(item, index, this)) {
                matchedItem = item as TOutput;
            }
            index++;
        }
        if (matchedItem) {
            return matchedItem;
        }
        return simplifyLazyable(defaultValue);
    }

    lastOrFail<TOutput extends TInput>(
        predicateFn?: Predicate<TInput, ICollection<TInput>, TOutput>,
    ): TOutput {
        const item = this.last(predicateFn);
        if (item === null) {
            throw new ItemNotFoundCollectionError("Item was not found");
        }
        return item;
    }

    before(predicateFn: Predicate<TInput, ICollection<TInput>>): TInput | null {
        return this.beforeOr(null, predicateFn);
    }

    beforeOr<TExtended = TInput>(
        defaultValue: Lazyable<TExtended>,
        predicateFn: Predicate<TInput, ICollection<TInput>>,
    ): TInput | TExtended {
        let beforeItem: TInput | null = null,
            index = 0;
        for (const item of this) {
            if (predicateFn(item, index, this) && beforeItem) {
                return beforeItem;
            }
            index++;
            beforeItem = item;
        }
        return simplifyLazyable(defaultValue);
    }

    beforeOrFail(predicateFn: Predicate<TInput, ICollection<TInput>>): TInput {
        const item = this.before(predicateFn);
        if (item === null) {
            throw new ItemNotFoundCollectionError("Item was not found");
        }
        return item;
    }

    after(predicateFn: Predicate<TInput, ICollection<TInput>>): TInput | null {
        return this.afterOr(null, predicateFn);
    }

    afterOr<TExtended = TInput>(
        defaultValue: Lazyable<TExtended>,
        predicateFn: Predicate<TInput, ICollection<TInput>>,
    ): TInput | TExtended {
        let hasMatched = false,
            index = 0;
        for (const item of this) {
            if (hasMatched) {
                return item;
            }
            hasMatched = predicateFn(item, index, this);
            index++;
        }
        return simplifyLazyable(defaultValue);
    }

    afterOrFail(predicateFn: Predicate<TInput, ICollection<TInput>>): TInput {
        const item = this.after(predicateFn);
        if (item === null) {
            throw new ItemNotFoundCollectionError("Item was not found");
        }
        return item;
    }

    sole<TOutput extends TInput>(
        predicateFn: Predicate<TInput, ICollection<TInput>, TOutput>,
    ): TOutput {
        let index = 0,
            matchedItem: TOutput | null = null;
        for (const item of this) {
            if (predicateFn(item, index, this)) {
                if (matchedItem !== null) {
                    throw new MultipleItemsFoundCollectionError(
                        "Multiple items were found",
                    );
                }
                matchedItem = item as TOutput;
            }
            index++;
        }
        if (matchedItem === null) {
            throw new ItemNotFoundCollectionError("Item was not found");
        }
        return matchedItem;
    }

    nth(step: number): ICollection<TInput> {
        return this.filter((_item, index) => index % step === 0);
    }

    count(predicateFn: Predicate<TInput, ICollection<TInput>>): number {
        let size = 0;
        for (const item of this) {
            if (predicateFn(item, size, this)) {
                size++;
            }
        }
        return size;
    }

    size(): number {
        return this.count(() => true);
    }

    isEmpty(): boolean {
        for (const _ of this) {
            return false;
        }
        return true;
    }

    isNotEmpty(): boolean {
        return !this.isEmpty();
    }

    searchFirst(predicateFn: Predicate<TInput, ICollection<TInput>>): number {
        let index = 0;
        for (const item of this) {
            if (predicateFn(item, index, this)) {
                return index;
            }
            index++;
        }
        return -1;
    }

    searchLast(predicateFn: Predicate<TInput, ICollection<TInput>>): number {
        let index = 0;
        let matchedIndex = -1;
        for (const item of this) {
            if (predicateFn(item, index, this)) {
                matchedIndex = index;
            }
            index++;
        }
        return matchedIndex;
    }

    forEach(callback: ForEach<TInput, ICollection<TInput>>): void {
        let index = 0;
        for (const item of this) {
            callback(item, index, this);
            index++;
        }
    }

    toArray(): TInput[] {
        return [...this];
    }

    toRecord(): EnsureRecord<TInput> {
        const record: Record<string | number | symbol, unknown> = {};
        for (const item of this) {
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
    }

    toMap(): EnsureMap<TInput> {
        const map = new Map();
        for (const item of this) {
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
    }
}
