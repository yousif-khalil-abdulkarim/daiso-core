/**
 * @module Collection
 */

import { isIterable } from "@/collection/implementations/_shared.js";
import type {
    EnsureMap,
    EnsureRecord,
} from "@/collection/contracts/_module-exports.js";
import {
    type Collapse,
    type Comparator,
    type SyncPredicate,
    type ICollection,
    ItemNotFoundCollectionError,
    type SyncMap,
    type SyncModifier,
    MultipleItemsFoundCollectionError,
    type SyncTap,
    type SyncTransform,
    UnexpectedCollectionError,
    TypeCollectionError,
    type SyncReduce,
    type SyncForEach,
    EmptyCollectionError,
    type CrossJoinResult,
} from "@/collection/contracts/_module-exports.js";
import { type Lazyable } from "@/utilities/_module-exports.js";
import { resolveLazyable } from "@/utilities/_module-exports.js";

/**
 * All methods in <i>ListCollection</i> are executed eagerly.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection"```
 * @group Adapters
 */
export class ListCollection<TInput = unknown> implements ICollection<TInput> {
    /**
     * The <i>concat<i> static method is a convenient utility for easily concatenating multiple <i>{@link Iterable}</i>.
     * @example
     * ```ts
     * import { ListCollection } from "@daiso-tech/core";
     *
     * class MyIterable implements Iterable<number> {
     *   *[Symbol.iterator](): Iterator<number> {
     *     yield 1;
     *     yield 2;
     *     yield 3;
     *   }
     * }
     *
     * const collection = ListCollection.concat([
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
        let array: TValue[] = [];
        for (const iterable of iterables) {
            array = [...array, ...iterable];
        }
        return new ListCollection(array);
    }

    /**
     * The <i>difference</i> static method is used to compute the difference between two <i>{@link Iterable}</i> instances. By default, the equality check is performed on each item.
     * @example
     * ```ts
     * import { ListCollection } from "@daiso-tech/core";
     *
     * const collection = ListCollection.difference(
     *   [1, 2, 2, 3, 4, 5],
     *   [2, 4, 6, 8]
     * );
     * collection.toArray();
     * // [1, 3, 5]
     * ```
     * @example
     * ```ts
     * import { ListCollection } from "@daiso-tech/core";
     *
     * const collection = ListCollection.difference(
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
        selectFn?: SyncMap<TValue, ICollection<TValue>, TSelect>,
    ): ICollection<TValue> {
        return new ListCollection(iterableA).difference(iterableB, selectFn);
    }

    /**
     * The <i>zip</i> static method merges together the values of <i>iterableA</i> with the values of the <i>iterableB</i> at their corresponding index.
     * The returned collection has size of the shortest collection.
     * @example
     * ```ts
     * import { ListCollection } from "@daiso-tech/core";;
     *
     * const collection = ListCollection.zip(["Chair", "Desk"], [100, 200]);
     * collection.toArray();
     * // [["Chair", 100], ["Desk", 200]]
     * ```
     * @example
     * ```ts
     * import { ListCollection } from "@daiso-tech/core";;
     *
     * const collection = ListCollection.zip(["Chair", "Desk", "Couch"], [100, 200]);
     * collection.toArray();
     * // [["Chair", 100], ["Desk", 200]]
     * ```
     * @example
     * ```ts
     * import { ListCollection } from "@daiso-tech/core";;
     *
     * const collection = ListCollection.zip(["Chair", "Desk"], [100, 200, 300]);
     * collection.toArray();
     * // [["Chair", 100], ["Desk", 200]]
     * ```
     */
    static zip<TValueA, TValueB>(
        iterableA: Iterable<TValueA>,
        iterableB: Iterable<TValueB>,
    ): ICollection<[TValueA, TValueB]> {
        return new ListCollection(iterableA).zip(iterableB);
    }

    static deserialize<TInput>(serializedValue: TInput[]): ICollection<TInput> {
        return new ListCollection(serializedValue);
    }

    private array: TInput[];

    /**
     * The <i>constructor</i> takes an <i>{@link Iterable}</i>.
     *
     * Works with <i>Array</i>.
     * @example
     * ```ts
     * import { ListCollection } from "@daiso-tech/core";
     *
     * const collection = new ListCollection([1, 2, 3, 4]);
     * ```
     *
     * Works with <i>String</i>.
     * @example
     * ```ts
     * import { ListCollection } from "@daiso-tech/core";
     *
     * const collection = new ListCollection("ABCDE");
     * ```
     *
     * Works with <i>Set</i>.
     * @example
     * ```ts
     * import { ListCollection } from "@daiso-tech/core";
     *
     * const collection = new ListCollection(new Set([1, 2, 2 4]));
     * ```
     *
     * Works with <i>Map</i>.
     * @example
     * ```ts
     * import { ListCollection } from "@daiso-tech/core";
     *
     * const collection = new ListCollection(new Map([["a", 1], ["b", 2]]));
     * ```
     *
     * Works with any <i>Iterable</i>.
     * @example
     * ```ts
     * import { ListCollection } from "@daiso-tech/core";
     *
     * class MyIterable implements Iterable<number> {
     *   *[Symbol.iterator](): Iterator<number> {
     *     yield 1;
     *     yield 2;
     *     yield 3;
     *   }
     * }
     * const collection = new ListCollection(new MyIterable());
     * ```
     */
    constructor(iterable: Iterable<TInput> = []) {
        this.array = [...iterable];
    }

    serialize(): TInput[] {
        return this.toArray();
    }

    *[Symbol.iterator](): Iterator<TInput> {
        yield* this.array;
    }

    toIterator(): Iterator<TInput, void> {
        return this[Symbol.iterator]() as Iterator<TInput, void>;
    }

    entries(): ICollection<[number, TInput]> {
        return new ListCollection(this.array.entries());
    }

    keys(): ICollection<number> {
        return new ListCollection(this.array.keys());
    }

    values(): ICollection<TInput> {
        return new ListCollection(this);
    }

    filter<TOutput extends TInput>(
        predicateFn: SyncPredicate<TInput, ICollection<TInput>, TOutput>,
    ): ICollection<TOutput> {
        return new ListCollection(
            this.array.filter((item, index) =>
                predicateFn(item, index, this),
            ) as TOutput[],
        );
    }

    reject<TOutput extends TInput>(
        predicateFn: SyncPredicate<TInput, ICollection<TInput>, TOutput>,
    ): ICollection<Exclude<TInput, TOutput>> {
        return new ListCollection(
            this.array.filter(
                (item, index) => !predicateFn(item, index, this),
            ) as Exclude<TInput, TOutput>[],
        );
    }

    map<TOutput>(
        mapFn: SyncMap<TInput, ICollection<TInput>, TOutput>,
    ): ICollection<TOutput> {
        return new ListCollection(
            this.array.map((item, index) => mapFn(item, index, this)),
        );
    }

    reduce(reduceFn: SyncReduce<TInput, ICollection<TInput>, TInput>): TInput;
    reduce(
        reduceFn: SyncReduce<TInput, ICollection<TInput>, TInput>,
        // eslint-disable-next-line @typescript-eslint/unified-signatures
        initialValue: TInput,
    ): TInput;
    reduce<TOutput>(
        reduceFn: SyncReduce<TInput, ICollection<TInput>, TOutput>,
        initialValue: TOutput,
    ): TOutput;
    reduce<TOutput = TInput>(
        reduceFn: SyncReduce<TInput, ICollection<TInput>, TOutput>,
        initialValue?: TOutput,
    ): TOutput {
        if (initialValue === undefined && this.isEmpty()) {
            throw new TypeCollectionError(
                "Reduce of empty array must be inputed a initial value",
            );
        }
        if (initialValue !== undefined) {
            return this.array.reduce<TOutput>(
                (initialValue, item, index) =>
                    reduceFn(initialValue, item, index, this),
                initialValue,
            );
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this.array.reduce((initialValue, item, index) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
            const reduce = reduceFn as any;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
            return reduce(initialValue, item, index, this);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }) as any;
    }

    join(separator = ","): Extract<TInput, string> {
        for (const item of this) {
            if (typeof item !== "string") {
                throw new TypeCollectionError(
                    "Item type is invalid must be string",
                );
            }
        }
        return this.array.join(separator) as Extract<TInput, string>;
    }

    collapse(): ICollection<Collapse<TInput>> {
        const items: TInput[] = [];
        for (const item of this.array) {
            if (isIterable<TInput>(item)) {
                items.push(...item);
            } else {
                items.push(item);
            }
        }
        return new ListCollection(items as Collapse<TInput>[]);
    }

    flatMap<TOutput>(
        mapFn: SyncMap<TInput, ICollection<TInput>, Iterable<TOutput>>,
    ): ICollection<TOutput> {
        return new ListCollection(
            this.array.flatMap((item, index) => [...mapFn(item, index, this)]),
        );
    }

    change<TFilterOutput extends TInput, TMapOutput>(
        predicateFn: SyncPredicate<TInput, ICollection<TInput>, TFilterOutput>,
        mapFn: SyncMap<TFilterOutput, ICollection<TInput>, TMapOutput>,
    ): ICollection<TInput | TFilterOutput | TMapOutput> {
        return new ListCollection(
            this.array.map((item, index) => {
                if (predicateFn(item, index, this)) {
                    return mapFn(item as TFilterOutput, index, this);
                }
                return item;
            }),
        );
    }

    set(
        index: number,
        value: TInput | SyncMap<TInput, ICollection<TInput>, TInput>,
    ): ICollection<TInput> {
        if (index < 0) {
            return this;
        }
        if (index >= this.array.length) {
            return this;
        }
        const item = this.array[index];
        if (item === undefined) {
            return this;
        }
        if (typeof value === "function") {
            const fn = value as SyncMap<TInput, ICollection<TInput>, TInput>;
            value = fn(item, index, this);
        }
        const newArray = [...this.array];
        newArray[index] = value;
        return new ListCollection(newArray);
    }

    get(index: number): TInput | null {
        return this.array[index] ?? null;
    }

    getOrFail(index: number): TInput {
        const item = this.get(index);
        if (item === null) {
            throw new ItemNotFoundCollectionError("Item was not found");
        }
        return item;
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
        const result = this.reduce((sum, item) => {
            if (typeof item !== "number") {
                throw new TypeCollectionError(
                    "Item type is invalid must be number",
                );
            }
            return sum + item;
        }, 0);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
        return result as any;
    }

    average(): Extract<TInput, number> {
        if (this.isEmpty()) {
            throw new EmptyCollectionError(
                "Collection is empty therby operation cannot be performed",
            );
        }
        return ((this.sum() as number) / this.size()) as Extract<
            TInput,
            number
        >;
    }

    median(): Extract<TInput, number> {
        if (this.isEmpty()) {
            throw new EmptyCollectionError(
                "Collection is empty therby operation cannot be performed",
            );
        }
        const nbrs = this.array.map((item) => {
                if (typeof item !== "number") {
                    throw new TypeCollectionError(
                        "Item type is invalid must be number",
                    );
                }
                return item;
            }),
            index = Math.floor(this.array.length / 2),
            isEven = this.array.length % 2 === 0,
            a = nbrs[index];
        if (a === undefined) {
            throw new UnexpectedCollectionError("Is in invalid state");
        }
        const b = nbrs[index - 1];
        if (isEven) {
            if (b === undefined) {
                throw new UnexpectedCollectionError("Is in invalid state");
            }
            return ((a + b) / 2) as Extract<TInput, number>;
        }
        return a as Extract<TInput, number>;
    }

    min(): Extract<TInput, number> {
        if (this.isEmpty()) {
            throw new EmptyCollectionError(
                "Collection is empty therby operation cannot be performed",
            );
        }
        let min = 0;
        for (const item of this.array) {
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
        for (const item of this.array) {
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

    percentage(
        predicateFn: SyncPredicate<TInput, ICollection<TInput>>,
    ): number {
        if (this.isEmpty()) {
            throw new EmptyCollectionError(
                "Collection is empty therby operation cannot be performed",
            );
        }
        return (this.count(predicateFn) / this.size()) * 100;
    }

    some<TOutput extends TInput>(
        predicateFn: SyncPredicate<TInput, ICollection<TInput>, TOutput>,
    ): boolean {
        return this.array.some((item, index) => predicateFn(item, index, this));
    }

    every<TOutput extends TInput>(
        predicateFn: SyncPredicate<TInput, ICollection<TInput>, TOutput>,
    ): boolean {
        return this.array.every((item, index) =>
            predicateFn(item, index, this),
        );
    }

    take(limit: number): ICollection<TInput> {
        return new ListCollection(this.array.slice(0, limit));
    }

    takeUntil(
        predicateFn: SyncPredicate<TInput, ICollection<TInput>>,
    ): ICollection<TInput> {
        const items: TInput[] = [];
        for (const [index, item] of this.array.entries()) {
            if (predicateFn(item, index, this)) {
                break;
            }
            items.push(item);
        }
        return new ListCollection(items);
    }

    takeWhile(
        predicateFn: SyncPredicate<TInput, ICollection<TInput>>,
    ): ICollection<TInput> {
        return this.takeUntil((...arguments_) => !predicateFn(...arguments_));
    }

    skip(offset: number): ICollection<TInput> {
        return new ListCollection(this.array.slice(offset));
    }

    skipUntil(
        predicateFn: SyncPredicate<TInput, ICollection<TInput>>,
    ): ICollection<TInput> {
        let hasMatched = false;
        const items: TInput[] = [];
        for (const [index, item] of this.array.entries()) {
            if (!hasMatched) {
                hasMatched = predicateFn(item, index, this);
            }
            if (hasMatched) {
                items.push(item);
            }
        }
        return new ListCollection(items);
    }

    skipWhile(
        predicateFn: SyncPredicate<TInput, ICollection<TInput>>,
    ): ICollection<TInput> {
        return this.skipUntil((...arguments_) => !predicateFn(...arguments_));
    }

    when<TExtended = TInput>(
        condition: boolean,
        callback: SyncModifier<ICollection<TInput>, ICollection<TExtended>>,
    ): ICollection<TInput | TExtended> {
        if (condition) {
            return callback(this) as ICollection<TInput | TExtended>;
        }
        return this as ICollection<TInput | TExtended>;
    }

    whenEmpty<TExtended = TInput>(
        callback: SyncModifier<ICollection<TInput>, ICollection<TExtended>>,
    ): ICollection<TInput | TExtended> {
        return this.when(this.isEmpty(), callback);
    }

    whenNot<TExtended = TInput>(
        condition: boolean,
        callback: SyncModifier<ICollection<TInput>, ICollection<TExtended>>,
    ): ICollection<TInput | TExtended> {
        return this.when(!condition, callback);
    }

    whenNotEmpty<TExtended = TInput>(
        callback: SyncModifier<ICollection<TInput>, ICollection<TExtended>>,
    ): ICollection<TInput | TExtended> {
        return this.when(this.isNotEmpty(), callback);
    }

    pipe<TOutput = TInput>(
        callback: SyncTransform<ICollection<TInput>, TOutput>,
    ): TOutput {
        return callback(this);
    }

    tap(callback: SyncTap<ICollection<TInput>>): ICollection<TInput> {
        callback(new ListCollection(this));
        return this;
    }

    chunk(chunkSize: number): ICollection<ICollection<TInput>> {
        const chunks: ICollection<TInput>[] = [];
        for (let index = 0; index < this.size(); index += chunkSize) {
            chunks.push(
                new ListCollection(this.array.slice(index, index + chunkSize)),
            );
        }
        return new ListCollection(chunks);
    }

    chunkWhile(
        predicateFn: SyncPredicate<TInput, ICollection<TInput>>,
    ): ICollection<ICollection<TInput>> {
        let currentChunk: ICollection<TInput> = new ListCollection<TInput>([]);
        const chunks: ICollection<TInput>[] = [];
        for (const [index, item] of this.array.entries()) {
            if (index === 0) {
                currentChunk = currentChunk.append([item]);
            } else if (predicateFn(item, index, currentChunk)) {
                currentChunk = currentChunk.append([item]);
            } else {
                chunks.push(currentChunk);
                currentChunk = new ListCollection<TInput>([item]);
            }
        }
        chunks.push(currentChunk);
        return new ListCollection(chunks);
    }

    split(chunkAmount: number): ICollection<ICollection<TInput>> {
        const size = this.size(),
            minChunkSize = Math.floor(size / chunkAmount),
            restSize = size % chunkAmount,
            chunkSizes = Array.from<number>({
                length: chunkAmount,
            }).fill(minChunkSize);

        for (let index = 1; index <= restSize; index++) {
            const chunkIndex = (index - 1) % chunkAmount;
            if (chunkSizes[chunkIndex]) {
                chunkSizes[chunkIndex] = chunkSizes[chunkIndex] + 1;
            }
        }

        let end = 0,
            start = 0;
        const chunks: ICollection<TInput>[] = [];
        for (const chunkSize of chunkSizes) {
            end += chunkSize;
            chunks.push(new ListCollection(this.array.slice(start, end)));
            start += chunkSize;
        }

        return new ListCollection<ICollection<TInput>>(chunks);
    }

    partition(
        predicateFn: SyncPredicate<TInput, ICollection<TInput>>,
    ): ICollection<ICollection<TInput>> {
        const chunkA: TInput[] = [],
            chunkB: TInput[] = [];
        for (const [index, item] of this.array.entries()) {
            if (predicateFn(item, index, this)) {
                chunkA.push(item);
            } else {
                chunkB.push(item);
            }
        }
        return new ListCollection<ICollection<TInput>>([
            new ListCollection(chunkA),
            new ListCollection(chunkB),
        ]);
    }

    sliding(
        chunkSize: number,
        step = chunkSize - 1,
    ): ICollection<ICollection<TInput>> {
        let chunks: ICollection<ICollection<TInput>> = new ListCollection<
            ICollection<TInput>
        >([]);
        if (step <= 0) {
            return new ListCollection<ICollection<TInput>>([]);
        }
        for (let index = 0; index < this.size(); index += step) {
            const start = index;
            const end = index + chunkSize;
            chunks = chunks.append([this.slice(start, end)]);
            if (end >= this.size()) {
                break;
            }
        }
        return chunks;
    }

    groupBy<TOutput = TInput>(
        selectFn: SyncMap<TInput, ICollection<TInput>, TOutput> = (item) =>
            item as unknown as TOutput,
    ): ICollection<[TOutput, ICollection<TInput>]> {
        const map = new Map<TOutput, ICollection<TInput>>();
        for (const [index, item] of this.array.entries()) {
            const key = selectFn(item, index, this);
            let collection: ICollection<TInput> | undefined = map.get(key);
            if (collection === undefined) {
                collection = new ListCollection<TInput>([]);
                map.set(key, collection);
            }

            map.set(key, collection.append([item]));
        }
        return new ListCollection<[TOutput, ICollection<TInput>]>(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
            map as any,
        );
    }

    countBy<TOutput = TInput>(
        selectFn: SyncMap<TInput, ICollection<TInput>, TOutput> = (item) =>
            item as unknown as TOutput,
    ): ICollection<[TOutput, number]> {
        const map = new Map<TOutput, number>();
        for (const [index, item] of this.array.entries()) {
            const key = selectFn(item, index, this);
            if (!map.has(key)) {
                map.set(key, 0);
            }
            const counter = map.get(key);
            if (counter !== undefined) {
                map.set(key, counter + 1);
            }
        }
        return new ListCollection(map);
    }

    unique<TOutput = TInput>(
        selectFn: SyncMap<TInput, ICollection<TInput>, TOutput> = (item) =>
            item as unknown as TOutput,
    ): ICollection<TInput> {
        const set = new Set<TOutput>([]),
            items: TInput[] = [];
        for (const [index, item] of this.array.entries()) {
            const item_ = selectFn(item, index, this);
            if (!set.has(item_)) {
                items.push(item);
            }
            set.add(item_);
        }
        return new ListCollection(items);
    }

    difference<TOutput = TInput>(
        iterable: Iterable<TInput>,
        selectFn: SyncMap<TInput, ICollection<TInput>, TOutput> = (item) =>
            item as unknown as TOutput,
    ): ICollection<TInput> {
        const differenceCollection = new ListCollection(iterable);
        return this.filter((item, index, collection) => {
            return !differenceCollection.some(
                (matchItem, matchIndex, matchCollection) => {
                    return (
                        selectFn(item, index, collection) ===
                        selectFn(matchItem, matchIndex, matchCollection)
                    );
                },
            );
        });
    }

    repeat(amount: number): ICollection<TInput> {
        let collection: ICollection<TInput> = new ListCollection<TInput>([]);
        for (let index = 0; index < amount; index++) {
            collection = collection.append(this);
        }
        return collection;
    }

    padStart<TExtended = TInput>(
        maxLength: number,
        fillItems: Iterable<TExtended>,
    ): ICollection<TInput | TExtended> {
        const fillItemsArray = [...fillItems];
        const size = this.size();
        const repeat = Math.floor((maxLength - size) / fillItemsArray.length);
        const resultItemsArray: Array<TInput | TExtended> = [];
        for (let index = 0; index < repeat; index++) {
            resultItemsArray.push(...fillItemsArray);
        }
        const restAmount = maxLength - (repeat * fillItemsArray.length + size);
        for (let index = 0; index < restAmount; index++) {
            const fillItem = fillItemsArray[index];
            if (fillItem) {
                resultItemsArray.push(fillItem);
            }
        }
        resultItemsArray.push(...this);
        return new ListCollection<TInput | TExtended>(resultItemsArray);
    }

    padEnd<TExtended = TInput>(
        maxLength: number,
        fillItems: Iterable<TExtended>,
    ): ICollection<TInput | TExtended> {
        const fillItemsArray = [...fillItems];
        const size = this.size();
        const repeat = Math.floor((maxLength - size) / fillItemsArray.length);
        const resultItemsArray: Array<TInput | TExtended> = [];
        for (let index = 0; index < repeat; index++) {
            resultItemsArray.push(...fillItemsArray);
        }
        const restAmount = maxLength - (repeat * fillItemsArray.length + size);
        for (let index = 0; index < restAmount; index++) {
            const fillItem = fillItemsArray[index];
            if (fillItem) {
                resultItemsArray.push(fillItem);
            }
        }
        resultItemsArray.unshift(...this);
        return new ListCollection<TInput | TExtended>(resultItemsArray);
    }

    slice(start?: number, end?: number): ICollection<TInput> {
        return new ListCollection(this.array.slice(start, end));
    }

    prepend<TExtended = TInput>(
        iterable: Iterable<TInput | TExtended>,
    ): ICollection<TInput | TExtended> {
        return new ListCollection([...iterable, ...this.array]);
    }

    append<TExtended = TInput>(
        iterable: Iterable<TInput | TExtended>,
    ): ICollection<TInput | TExtended> {
        return new ListCollection([...this.array, ...iterable]);
    }

    insertBefore<TExtended = TInput>(
        predicateFn: SyncPredicate<TInput, ICollection<TInput>>,
        iterable: Iterable<TInput | TExtended>,
    ): ICollection<TInput | TExtended> {
        const index = this.array.findIndex((item, index) =>
            predicateFn(item, index, this),
        );
        if (index === -1) {
            return new ListCollection<TInput | TExtended>(this.array);
        }
        const newArray = [...this.array] as Array<TInput | TExtended>;
        newArray.splice(index, 0, ...iterable);
        return new ListCollection(newArray);
    }

    insertAfter<TExtended = TInput>(
        predicateFn: SyncPredicate<TInput, ICollection<TInput>>,
        iterable: Iterable<TInput | TExtended>,
    ): ICollection<TInput | TExtended> {
        const index = this.array.findIndex((item, index) =>
            predicateFn(item, index, this),
        );
        if (index === -1) {
            return new ListCollection(this.array) as ICollection<
                TInput | TExtended
            >;
        }
        const firstPart = this.array.slice(0, index + 1),
            lastPart = this.array.slice(index + 1);
        return new ListCollection([
            ...firstPart,
            ...iterable,
            ...lastPart,
        ]) as ICollection<TInput | TExtended>;
    }

    crossJoin<TExtended>(
        iterable: Iterable<TExtended>,
    ): ICollection<CrossJoinResult<TInput, TExtended>> {
        const array: Array<Array<TInput | TExtended>> = [
            [...this],
            [...iterable],
        ]
            .reduce<Array<Array<TInput | TExtended>>>(
                (a, b) => {
                    return a
                        .map((x) => {
                            return b.map((y) => {
                                return [...x, y];
                            });
                        })
                        .reduce<Array<Array<TInput | TExtended>>>(
                            (c, b) => [...c, ...b],
                            [],
                        );
                },
                [[] as Array<TInput | TExtended>],
            )
            .map((combination) => {
                // Flatting the array
                return combination.reduce<Array<TInput | TExtended>>((a, b) => {
                    return [...a, ...(isIterable(b) ? b : [b])] as Array<
                        TInput | TExtended
                    >;
                }, []);
            });

        return new ListCollection(
            array as Array<CrossJoinResult<TInput, TExtended>>,
        );
    }

    zip<TExtended>(
        iterable: Iterable<TExtended>,
    ): ICollection<[TInput, TExtended]> {
        const iterableArray = [...iterable];
        let size = iterableArray.length;
        if (size > this.size()) {
            size = this.size();
        }
        const items: Array<[TInput, TExtended]> = [];
        for (let index = 0; index < size; index++) {
            const itemA = this.array[index],
                itemB = iterableArray[index];
            if (itemA === undefined || itemB === undefined) {
                continue;
            }
            items.push([itemA, itemB]);
        }
        return new ListCollection(items);
    }

    sort(comparator?: Comparator<TInput>): ICollection<TInput> {
        return new ListCollection(this.array.sort(comparator));
    }

    reverse(_chunkSize?: number): ICollection<TInput> {
        return new ListCollection([...this.array].reverse());
    }

    shuffle(mathRandom = Math.random): ICollection<TInput> {
        const newArray = [...this.array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(mathRandom() * (i + 1));
            const temp = newArray[i];
            if (newArray[j] !== undefined) {
                newArray[i] = newArray[j];
            }
            if (temp !== undefined) {
                newArray[j] = temp;
            }
        }
        return new ListCollection(newArray);
    }

    first<TOutput extends TInput>(
        predicateFn?: SyncPredicate<TInput, ICollection<TInput>, TOutput>,
    ): TOutput | null {
        return this.firstOr(null, predicateFn);
    }

    firstOr<TOutput extends TInput, TExtended = TInput>(
        defaultValue: Lazyable<TExtended>,
        predicateFn?: SyncPredicate<TInput, ICollection<TInput>, TOutput>,
    ): TOutput | TExtended {
        if (predicateFn) {
            for (const [index, item] of this.array.entries()) {
                if (predicateFn(item, index, this)) {
                    return item as TOutput;
                }
            }
        } else {
            const firstItem = this.array[0];
            if (firstItem) {
                return firstItem as TOutput;
            }
        }
        return resolveLazyable(defaultValue);
    }

    firstOrFail<TOutput extends TInput>(
        predicateFn?: SyncPredicate<TInput, ICollection<TInput>, TOutput>,
    ): TOutput {
        const item = this.first(predicateFn);
        if (item === null) {
            throw new ItemNotFoundCollectionError("Item was not found");
        }
        return item;
    }

    last<TOutput extends TInput>(
        predicateFn?: SyncPredicate<TInput, ICollection<TInput>, TOutput>,
    ): TOutput | null {
        return this.lastOr(null, predicateFn);
    }

    lastOr<TOutput extends TInput, TExtended = TInput>(
        defaultValue: Lazyable<TExtended>,
        predicateFn?: SyncPredicate<TInput, ICollection<TInput>, TOutput>,
    ): TOutput | TExtended {
        if (predicateFn) {
            let matchedItem: TOutput | null = null;
            for (const [index, item] of this.array.entries()) {
                if (predicateFn(item, index, this)) {
                    matchedItem = item as TOutput;
                }
            }
            if (matchedItem) {
                return matchedItem;
            }
        } else {
            const lastItem = this.array.at(-1);
            if (lastItem) {
                return lastItem as TOutput;
            }
        }
        return resolveLazyable(defaultValue);
    }

    lastOrFail<TOutput extends TInput>(
        predicateFn?: SyncPredicate<TInput, ICollection<TInput>, TOutput>,
    ): TOutput {
        const item = this.last(predicateFn);
        if (item === null) {
            throw new ItemNotFoundCollectionError("Item was not found");
        }
        return item;
    }

    before(
        predicateFn: SyncPredicate<TInput, ICollection<TInput>>,
    ): TInput | null {
        return this.beforeOr(null, predicateFn);
    }

    beforeOr<TExtended = TInput>(
        defaultValue: Lazyable<TExtended>,
        predicateFn: SyncPredicate<TInput, ICollection<TInput>>,
    ): TInput | TExtended {
        for (const [index, item] of this.array.entries()) {
            const beforeItem = this.array[index - 1];
            if (predicateFn(item, index, this) && beforeItem !== undefined) {
                return beforeItem;
            }
        }
        return resolveLazyable(defaultValue);
    }

    beforeOrFail(
        predicateFn: SyncPredicate<TInput, ICollection<TInput>>,
    ): TInput {
        const item = this.before(predicateFn);
        if (item === null) {
            throw new ItemNotFoundCollectionError("Item was not found");
        }
        return item;
    }

    after(
        predicateFn: SyncPredicate<TInput, ICollection<TInput>>,
    ): TInput | null {
        return this.afterOr(null, predicateFn);
    }

    afterOr<TExtended = TInput>(
        defaultValue: Lazyable<TExtended>,
        predicateFn: SyncPredicate<TInput, ICollection<TInput>>,
    ): TInput | TExtended {
        for (const [index, item] of this.array.entries()) {
            const beforeItem = this.array[index + 1];
            if (predicateFn(item, index, this) && beforeItem !== undefined) {
                return beforeItem;
            }
        }
        return resolveLazyable(defaultValue);
    }

    afterOrFail(
        predicateFn: SyncPredicate<TInput, ICollection<TInput>>,
    ): TInput {
        const item = this.after(predicateFn);
        if (item === null) {
            throw new ItemNotFoundCollectionError("Item was not found");
        }
        return item;
    }

    sole<TOutput extends TInput>(
        predicateFn: SyncPredicate<TInput, ICollection<TInput>, TOutput>,
    ): TOutput {
        const matchedItems: TInput[] = [];
        for (const [index, item] of this.array.entries()) {
            if (predicateFn(item, index, this)) {
                matchedItems.push(item);
            }
            if (matchedItems.length > 1) {
                throw new MultipleItemsFoundCollectionError(
                    "Multiple items were found",
                );
            }
        }
        const [matchedItem] = matchedItems;
        if (matchedItem === undefined) {
            throw new ItemNotFoundCollectionError("Item was not found");
        }
        return matchedItem as TOutput;
    }

    nth(step: number): ICollection<TInput> {
        return this.filter((_item, index) => index % step === 0);
    }

    count(predicateFn: SyncPredicate<TInput, ICollection<TInput>>): number {
        return this.filter(predicateFn).size();
    }

    size(): number {
        return this.array.length;
    }

    isEmpty(): boolean {
        return this.array.length === 0;
    }

    isNotEmpty(): boolean {
        return this.array.length !== 0;
    }

    searchFirst(
        predicateFn: SyncPredicate<TInput, ICollection<TInput>>,
    ): number {
        return this.array.findIndex((item, index) =>
            predicateFn(item, index, this),
        );
    }

    searchLast(
        predicateFn: SyncPredicate<TInput, ICollection<TInput>>,
    ): number {
        let matchedIndex = -1;
        for (const [index, item] of this.array.entries()) {
            if (predicateFn(item, index, this)) {
                matchedIndex = index;
            }
        }
        return matchedIndex;
    }

    forEach(callback: SyncForEach<TInput, ICollection<TInput>>): void {
        for (const [index, item] of this.array.entries()) {
            callback(item, index, this);
        }
    }

    toArray(): TInput[] {
        return [...this.array];
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
