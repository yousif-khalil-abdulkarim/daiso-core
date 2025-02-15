/**
 * @module Collection
 */

import type {
    Comparator,
    Predicate,
    ForEach,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ItemNotFoundCollectionError,
    Map,
    Modifier,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    MultipleItemsFoundCollectionError,
    Tap,
    Transform,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    UnexpectedCollectionError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    TypeCollectionError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    EmptyCollectionError,
    Reduce,
    CrossJoinResult,
    EnsureMap,
    EnsureRecord,
} from "@/collection/contracts/_module";
import type { ISerializable } from "@/serde/contracts/_module";
import type { Lazyable } from "@/utilities/_module";

export type Collapse<TValue> = TValue extends
    | Array<infer TItem>
    | Iterable<infer TItem>
    | ICollection<infer TItem>
    ? TItem
    : TValue;

/**
 * The <i>ICollection</i> contract offers a fluent and efficient approach to working with {@link Iterable} objects.
 * <i>ICollection</i> is immutable.
 * @group Contracts
 * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
 */
export type ICollection<TInput = unknown> = Iterable<TInput> &
    ISerializable<TInput[]> & {
        /**
         * The <i>toIterator</i> method converts the collection to a new iterator.
         */
        toIterator(): Iterator<TInput, void>;

        /**
         * The <i>entries</i> returns an ICollection of key, value pairs for every entry in the collection.
         */
        entries(): ICollection<[number, TInput]>;

        /**
         * The <i>keys</i> method returns an ICollection of keys in the collection.
         */
        keys(): ICollection<number>;

        /**
         * The <i>values</i> method returns a copy of the collection.
         */
        values(): ICollection<TInput>;

        /**
         * The <i>filter</i> method filters the collection using <i>predicateFn</i>, keeping only those items that pass <i>predicateFn</i>.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .append([1, 2, 3, 4, 5, 6])
         *     .filter(item => 2 < item && item < 5)
         *     .toArray();
         *   // [3, 4]
         * }
         * ```
         */
        filter<TOutput extends TInput>(
            predicateFn: Predicate<TInput, ICollection<TInput>, TOutput>,
        ): ICollection<TOutput>;

        /**
         * The <i>reject</i> method filters the collection using <i>predicateFn</i>, keeping only those items that not pass <i>predicateFn</i>.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .append([1, 2, 3, 4, 5, 6])
         *     .reject(item => 2 < item && item < 5)
         *     .toArray();
         *   // [1, 2, 5, 6]
         * }
         * ```
         */
        reject<TOutput extends TInput>(
            predicateFn: Predicate<TInput, ICollection<TInput>, TOutput>,
        ): ICollection<Exclude<TInput, TOutput>>;

        /**
         * The <i>map</i> method iterates through the collection and passes each item to <i>mapFn</i>.
         * The <i>mapFn</i> is free to modify the item and return it, thus forming a new collection of modified items.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .append([1, 2, 3, 4, 5])
         *     .map(item => item * 2)
         *     .toArray();
         *   // [2, 4, 6, 8, 10]
         * }
         * ```
         */
        map<TOutput>(
            mapFn: Map<TInput, ICollection<TInput>, TOutput>,
        ): ICollection<TOutput>;

        /**
         * The <i>reduce</i> method executes <i> reduceFn </i> function on each item of the array, passing in the return value from the calculation on the preceding item.
         * The final result of running the reducer across all items of the array is a single value.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .append([1, 2, 3]);
         *     .reduce((sum, item) => sum + item);
         *   // 6
         * }
         * ```
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<string>): void {
         *   collection
         *     .append(["a", "b", "c"])
         *     .entries()
         *     .reduce(
         *       (record, [key, value]) => ({
         *         ...record,
         *         [key]: value
         *       }),
         *       {} as Record<number, string>
         *     );
         *   // { 0: "a", 1: "b", 2: "c" }
         * }
         * ```
         */
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

        /**
         * The <i>join</i> method joins the collection's items with <i> separator </i>. An error will be thrown when if a none string item is encounterd.
         * @throws {TypeCollectionError}
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .append([1, 2, 3, 4])
         *     .map(item => item.toString())
         *     .join();
         *   // "1,2,3,4"
         * }
         * ```
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .append([1, 2, 3, 4])
         *     .map(item => item.toString())
         *     .join("_");
         *   // "1_2_3_4"
         * }
         * ```
         */
        join(separator?: string): Extract<TInput, string>;

        /**
         * The <i>collapse</i> method collapses a collection of iterables into a single, flat collection.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number[]>): void {
         *   collection
         *     .append([[1, 2], [3, 4]])
         *     .collapse()
         *      .toArray();
         *   // [1, 2, 3, 4]
         * }
         * ```
         */
        collapse(): ICollection<Collapse<TInput>>;

        /**
         * The <i>flatMap</i> method returns a new array formed by applying <i>mapFn</i> to each item of the array, and then collapses the result by one level.
         * It is identical to a <i>map</i> method followed by a <i>collapse</i> method.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<string[]>): void {
         *   collection
         *     .append([["a", "b"], ["c", "d"]])
         *     .flatMap(item => [item.length, ...item])
         *     .toArray();
         *   // [2, "a", "b", 2, "c", "d"]
         * }
         * ```
         */
        flatMap<TOutput>(
            mapFn: Map<TInput, ICollection<TInput>, Iterable<TOutput>>,
        ): ICollection<TOutput>;

        /**
         * The <i>change</i> method changes only the items that passes <i>predicateFn</i> using <i>mapFn</i>.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .append([1, 2, 3, 4, 5])
         *     .change(item => item % 2 === 0, item => item * 2)
         *     .toArray();
         *   // [1, 4, 3, 8, 5]
         * }
         * ```
         */
        change<TFilterOutput extends TInput, TMapOutput>(
            predicateFn: Predicate<TInput, ICollection<TInput>, TFilterOutput>,
            mapFn: Map<TFilterOutput, ICollection<TInput>, TMapOutput>,
        ): ICollection<TInput | TFilterOutput | TMapOutput>;

        /**
         * The <i>set</i> method changes a item by i>index</i> using <i>value</i>.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .append([1, 2, 3, 4, 5])
         *     .set(1, -1)
         *     .toArray();
         *   // [1, -1, 3, 4, 5]
         * }
         * ```
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .append([1, 2, 3, 4, 5])
         *     .set(1, (prevValue) => prevValue - 2)
         *     .toArray();
         *   // [1, 0, 3, 4, 5]
         * }
         * ```
         */
        set(
            index: number,
            value: TInput | Map<TInput, ICollection<TInput>, TInput>,
        ): ICollection<TInput>;

        /**
         * The <i>get</i> method returns the item by index. If the item is not found null will returned.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection = collection.append([1, 4, 2, 8, -2]);
         *
         *   // Will be 2
         *   collection.get(2);
         *
         *   // Will be null
         *   collection.get(5);
         * }
         * ```
         */
        get(index: number): TInput | null;

        /**
         * The <i>getOrFail</i> method returns the item by index. If the item is not found an error will be thrown.
         * @throws {ItemNotFoundCollectionError} {@link ItemNotFoundCollectionError}
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection = collection.append([1, 4, 2, 8, -2]);
         *
         *   // Will be 2
         *   collection.getOrFail(2);
         *
         *   // An error will thrown
         *   collection.getOrFail(5);
         * }
         * ```
         */
        getOrFail(index: number): TInput;

        /**
         * The <i>page</i> method returns a new collection containing the items that would be present on <i> page </i> with custom <i> pageSize </i>.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .append([1, 2, 3, 4, 5, 6, 7, 8, 9])
         *     .page(2, 3)
         *     .toArray()
         *   // [4, 5, 6]
         * }
         * ```
         */
        page(page: number, pageSize: number): ICollection<TInput>;

        /**
         * The <i>sum</i> method returns the sum of all items in the collection. If the collection includes other than number items an error will be thrown.
         * If the collection is empty an error will also be thrown.
         * @throws {TypeCollectionError} {@link TypeCollectionError}
         * @throws {EmptyCollectionError} {@link EmptyCollectionError}
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .append([1, 2, 3])
         *     .sum();
         *   // 6
         * }
         * ```
         */
        sum(): Extract<TInput, number>;

        /**
         * The <i>average</i> method returns the average of all items in the collection. If the collection includes other than number items an error will be thrown.
         * If the collection is empty an error will also be thrown.
         * @throws {TypeCollectionError} {@link TypeCollectionError}
         * @throws {EmptyCollectionError} {@link EmptyCollectionError}
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .append([1, 2, 3])
         *     .average()
         *   // 2
         * }
         * ```
         */
        average(): Extract<TInput, number>;

        /**
         * The <i>median</i> method returns the median of all items in the collection. If the collection includes other than number items an error will be thrown.
         * If the collection is empty an error will also be thrown.
         * @throws {TypeCollectionError} {@link TypeCollectionError}
         * @throws {EmptyCollectionError} {@link EmptyCollectionError}
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .append([1, 2, 3])
         *     .median();
         *   // 2
         * }
         * ```
         */
        median(): Extract<TInput, number>;

        /**
         * The <i>min</i> method returns the min of all items in the collection. If the collection includes other than number items an error will be thrown.
         * If the collection is empty an error will also be thrown.
         * @throws {TypeCollectionError} {@link TypeCollectionError}
         * @throws {EmptyCollectionError} {@link EmptyCollectionError}
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .append([1, 2, 3])
         *     .min();
         *   // 1
         * }
         * ```
         */
        min(): Extract<TInput, number>;

        /**
         * The <i>max</i> method returns the max of all items in the collection. If the collection includes other than number items an error will be thrown.
         * If the collection is empty an error will also be thrown.
         * @throws {TypeCollectionError} {@link TypeCollectionError}
         * @throws {EmptyCollectionError} {@link EmptyCollectionError}
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .append([1, 2, 3])
         *     .max();
         *   // 3
         * }
         * ```
         */
        max(): Extract<TInput, number>;

        /**
         * The <i>percentage</i> method may be used to quickly determine the percentage of items in the collection that pass <i>predicateFn</i>.
         * If the collection is empty an error will also be thrown.
         * @throws {EmptyCollectionError} {@link EmptyCollectionError}
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .append([1, 1, 2, 2, 2, 3])
         *     .percentage(value => value === 1);
         *   // 33.333
         * }
         * ```
         */
        percentage(predicateFn: Predicate<TInput, ICollection<TInput>>): number;

        /**
         * The <i>some</i> method determines whether at least one item in the collection matches <i>predicateFn</i>.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .append([0, 1, 2, 3, 4, 5])
         *     .some(item => item === 1);
         *   // true
         * }
         * ```
         */
        some<TOutput extends TInput>(
            predicateFn: Predicate<TInput, ICollection<TInput>, TOutput>,
        ): boolean;

        /**
         * The <i>every</i> method determines whether all items in the collection matches <i>predicateFn</i>.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .append([0, 1, 2, 3, 4, 5])
         *     .every(item => item < 6);
         *   // true
         * }
         * ```
         */
        every<TOutput extends TInput>(
            predicateFn: Predicate<TInput, ICollection<TInput>, TOutput>,
        ): boolean;

        /**
         * The <i>take</i> method takes the first <i>limit</i> items.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .append([0, 1, 2, 3, 4, 5])
         *     .take(3)
         *     .toArray();
         *   // [0, 1, 2]
         * }
         * ```
         *
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .append([0, 1, 2, 3, 4, 5])
         *     .take(-2)
         *     .toArray();
         *   // [0, 1, 2, 3]
         * }
         * ```
         */
        take(limit: number): ICollection<TInput>;

        /**
         * The <i>takeUntil</i> method takes items until <i>predicateFn</i> returns true.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .append([1, 2, 3, 4])
         *     .takeUntil(item => item >= 3)
         *     .toArray();
         *   // [1, 2]
         * }
         * ```
         */
        takeUntil(
            predicateFn: Predicate<TInput, ICollection<TInput>>,
        ): ICollection<TInput>;

        /**
         * The <i>takeWhile</i> method takes items until <i>predicateFn</i> returns false.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .append([1, 2, 3, 4])
         *     .takeWhile(item => item < 4)
         *     .toArray();
         *   // [1, 2, 3]
         * }
         * ```
         */
        takeWhile(
            predicateFn: Predicate<TInput, ICollection<TInput>>,
        ): ICollection<TInput>;

        /**
         * The <i>skip</i> method skips the first <i>offset</i> items.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .append([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
         *     .skip(4)
         *     .toArray();
         *   // [5, 6, 7, 8, 9, 10]
         * }
         * ```
         */
        skip(offset: number): ICollection<TInput>;

        /**
         * The <i>skipUntil</i> method skips items until <i>predicateFn</i> returns true.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 2, 3, 4])
         *     .skipUntil(item => item >= 3)
         *     .toArray();
         *   // [3, 4]
         * }
         * ```
         */
        skipUntil(
            predicateFn: Predicate<TInput, ICollection<TInput>>,
        ): ICollection<TInput>;

        /**
         * The <i>skipWhile</i> method skips items until <i>predicateFn</i> returns false.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 2, 3, 4])
         *     .skipWhile(item => item <= 3)
         *     .toArray();
         *   // [4]
         * }
         * ```
         */
        skipWhile(
            predicateFn: Predicate<TInput, ICollection<TInput>>,
        ): ICollection<TInput>;

        /**
         * The <i>when</i> method will execute <i>callback</i> when <i>condition</i> evaluates to true.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 2, 3, 4])
         *     .when(true, collection => collection.append([-3]))
         *     .when(false, collection => collection.append([20]))
         *     .toArray();
         *   // [1, 2, 3, 4, -3]
         * }
         * ```
         */
        when<TExtended = TInput>(
            condition: boolean,
            callback: Modifier<ICollection<TInput>, ICollection<TExtended>>,
        ): ICollection<TInput | TExtended>;

        /**
         * The <i>whenEmpty</i> method will execute <i>callback</i> when the collection is empty.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([])
         *     .whenEmpty(collection => collection.append([-3]))
         *     .toArray();
         *   // [-3]
         * }
         * ```
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1])
         *     .whenEmpty(collection => collection.append([-3]))
         *     .toArray();
         *   // [1]
         * }
         * ```
         */
        whenEmpty<TExtended = TInput>(
            callback: Modifier<ICollection<TInput>, ICollection<TExtended>>,
        ): ICollection<TInput | TExtended>;

        /**
         * The <i>whenNot</i> method will execute <i>callback</i> when <i>condition</i> evaluates to false.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection.apppend([1, 2, 3, 4])
         *     .whenNot(true, collection => collection.append([-3]))
         *     .whenNot(false, collection => collection.append([20]))
         *     .toArray();
         *   // [1, 2, 3, 4, 20]
         * }
         * ```
         */
        whenNot<TExtended = TInput>(
            condition: boolean,
            callback: Modifier<ICollection<TInput>, ICollection<TExtended>>,
        ): ICollection<TInput | TExtended>;

        /**
         * The <i>whenNotEmpty</i> method will execute <i>callback</i> when the collection is not empty.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection.apppend([])
         *     .whenNotEmpty(collection => collection.append([-3]))
         *     .toArray();
         *   // []
         * }
         * ```
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection = collection
         *     .apppend([1])
         *     .whenNotEmpty(collection => collection.append([-3]))
         *     .toArray();
         *   // [1, -3]
         * }
         * ```
         */
        whenNotEmpty<TExtended = TInput>(
            callback: Modifier<ICollection<TInput>, ICollection<TExtended>>,
        ): ICollection<TInput | TExtended>;

        /**
         * The <i>pipe</i> method passes the orignal collection to <i>callback</i> and returns the result from <i>callback</i>.
         * This method is useful when you want compose multiple smaller functions.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   function toNbrs<TInput>(
         *     collection: ICollection<TInput>,
         *   ): ICollection<number> {
         *     return collection
         *       .map((item) => Number(item))
         *       .reject((nbr) => Number.isNaN(nbr));
         *   }
         *
         *   function nbrToStr(collection: ICollection<number>): number[] {
         *     return collection.repeat(2).toArray();
         *   }
         *
         *   const piped = collection
         *     .apppend([1, "2", "a", 1, 3, {}])
         *     .pipe(toNbrs)
         *     .pipe(nbrToStr);
         *   // [ 1, 2, 1, 3 ]
         * }
         * ```
         */
        pipe<TOutput = TInput>(
            callback: Transform<ICollection<TInput>, TOutput>,
        ): TOutput;

        /**
         * The <i>tap</i> method passes a copy of the original collection to <i>callback</i>, allowing you to do something with the items while not affecting the original collection.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection.apppend([1, 2, 3, 4, 5, 6])
         *     .tap(collection => {
         *       collection
         *         .filter(value => value % 2 === 0)
         *         .forEach(value => console.log(value))
         *     })
         *     .toArray();
         *   // [1, 2, 3, 4, 5, 6]
         * }
         * ```
         */
        tap(callback: Tap<ICollection<TInput>>): ICollection<TInput>;

        /**
         * The <i>chunk</i> method breaks the collection into multiple, smaller collections of size <i>chunkSize</i>.
         * If <i>chunkSize</i> is not divisible with total number of items then the last chunk will contain the remaining items.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection.apppend([1, 2, 3, 4, 5, 6, 7]);
         *   const chunks = collection.chunk(4);
         *   chunks.map(chunk => chunk.toArray()).toArray();
         *   // [[1, 2, 3, 4], [5, 6, 7]]
         * }
         * ```
         */
        chunk(chunkSize: number): ICollection<ICollection<TInput>>;

        /**
         * The <i>chunkWhile</i> method breaks the collection into multiple, smaller collections based on the evaluation of <i>predicateFn</i>.
         * The chunk variable passed to the <i>predicateFn</i> may be used to inspect the previous item.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<string>): void {
         *   collection
         *     .apppend("AABBCCCD")
         *     .chunkWhile((value, index, chunk) => {
         *       return value === chunk.last();
         *     })
         *     .map(chunk => chunk.toArray())
         *     .toArray();
         *   //  [["A", "A"], ["B", "B"], ["C", "C", "C"], ["D"]]
         * }
         * ```
         */
        chunkWhile(
            predicateFn: Predicate<TInput, ICollection<TInput>>,
        ): ICollection<ICollection<TInput>>;

        /**
         * The <i>split</i> method breaks a collection evenly into <i>chunkAmount</i> of chunks.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 2, 3, 4, 5])
         *     .split(3)
         *     .map(chunk => chunk.toArray())
         *     .toArray();
         *   // [[1, 2], [3, 4], [5]]
         * }
         * ```
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 2, 3, 4, 5, 6])
         *     .split(3)
         *     .map(chunk => chunk.toArray())
         *     .toArray()
         *   // [[1, 2], [3, 4], [5, 6]]
         * }
         * ```
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 2, 3, 4, 5, 6, 7])
         *     .split(3)
         *     .map(chunk => chunk.toArray())
         *     .toArray();
         *   // [[1, 2, 7], [3, 4], [5, 6]]
         * }
         * ```
         */
        split(chunkAmount: number): ICollection<ICollection<TInput>>;

        /**
         * The <i>partition</i> method is used to separate items that pass <i>predicateFn</i> from those that do not.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 2, 3, 4, 5, 6])
         *     .partition(item => item < 3)
         *     .map(chunk => chunk.toArray())
         *     .toArray();
         *   // [[1, 2], [3, 4, 5, 6]]
         * }
         * ```
         */
        partition(
            predicateFn: Predicate<TInput, ICollection<TInput>>,
        ): ICollection<ICollection<TInput>>;

        /**
         * The <i>sliding</i> method returns a new collection of chunks representing a "sliding window" view of the items in the collection.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 2, 3, 4, 5])
         *     .sliding(2)
         *     .map(chunk => chunk.toArray())
         *     .toArray();
         *   // [[1, 2], [2, 3], [3, 4], [4, 5]]
         * }
         * ```
         */
        sliding(
            chunkSize: number,
            step?: number,
        ): ICollection<ICollection<TInput>>;

        /**
         * The <i>groupBy</i> method groups the collection's items by <i> selectFn </i>.
         * By default the equality check occurs on the item.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<string>): void {
         *   collection
         *     .apppend(["a", "a", "a", "b", "b", "c"])
         *     .groupBy()
         *     .map(([key, collection]) => [key, .toArray()])
         *     .toArray();
         *   // [
         *   //  [
         *   //    "a",
         *   //    ["a", "a", "a"]
         *   //  ],
         *   //  [
         *   //    "b",
         *   //    ["b", "b"]
         *   //  ],
         *   //  [
         *   //    "c",
         *   //    ["c"]
         *   //  ]
         *   // ]
         * }
         * ```
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<string>): void {
         * collection.apppend(["alice@gmail.com", "bob@yahoo.com", "carlos@gmail.com"]);
         *   const group = collection
         *     .groupBy(item => item.split("@")[1])
         *     .map(([key, collection]) => [key, .toArray()])
         *     .toArray();
         *   // [
         *   //   [
         *   //     "gmail.com",
         *   //     ["alice@gmail.com", "carlos@gmail.com"]
         *   //   ],
         *   //   [
         *   //     "yahoo.com",
         *   //     ["bob@yahoo.com"]
         *   //   ]
         *   // ]
         * }
         * ```
         */
        groupBy<TOutput = TInput>(
            selectFn?: Map<TInput, ICollection<TInput>, TOutput>,
        ): ICollection<[TOutput, ICollection<TInput>]>;

        /**
         * The <i>countBy</i> method counts the occurrences of values in the collection by <i> selectFn </i>.
         * By default the equality check occurs on the item.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<string>): void {
         *   collection
         *     .apppend(["a", "a", "a", "b", "b", "c"])
         *     .countBy()
         *     .map(([key, collection]) => [key, .toArray()])
         *     .toArray();
         *   // [
         *   //  ["a", 3],
         *   //  ["b", 2],
         *   //  ["c", 1]
         *   // ]
         * }
         * ```
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<string>): void {
         *   collection
         *     .apppend(["alice@gmail.com", "bob@yahoo.com", "carlos@gmail.com"])
         *     .countBy(item => item.split("@")[1])
         *     .toArray();
         *   // [
         *   //   ["gmail.com", 2],
         *   //   ["yahoo.com", 1]
         *   // ]
         * }
         * ```
         */
        countBy<TOutput = TInput>(
            selectFn?: Map<TInput, ICollection<TInput>, TOutput>,
        ): ICollection<[TOutput, number]>;

        /**
         * The <i>unique</i> method removes all duplicate values from the collection by <i> selectFn </i>.
         * By default the equality check occurs on the item.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 1, 2, 2, 3, 4, 2])
         *     .unique()
         *     .toArray();
         *   // [1, 2, 3, 4]
         * }
         * ```
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * type Phone = {
         *   name: string;
         *   brand: string;
         *   type: string;
         * };
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<Phone>): void {
         *   collection
         *     .apppend([
         *       { name: "iPhone 6", brand: "Apple", type: "phone" },
         *       { name: "iPhone 5", brand: "Apple", type: "phone" },
         *       { name: "Apple Watch", brand: "Apple", type: "watch" },
         *       { name: "Galaxy S6", brand: "Samsung", type: "phone" },
         *       { name: "Galaxy Gear", brand: "Samsung", type: "watch" },
         *     ])
         *     .unique(item => item.brand)
         *     .toArray();
         *   // [
         *   //   { name: "iPhone 6", brand: "Apple", type: "phone" },
         *   //   { name: "Galaxy S6", brand: "Samsung", type: "phone" },
         *   // ]
         * }
         * ```
         */
        unique<TOutput = TInput>(
            selectFn?: Map<TInput, ICollection<TInput>, TOutput>,
        ): ICollection<TInput>;

        /**
         * The <i>difference</i> method will return the values in the original collection that are not present in <i>iterable</i>.
         * By default the equality check occurs on the item.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 2, 2, 3, 4, 5])
         *     .difference([2, 4, 6, 8])
         *     .toArray();
         *   // [1, 3, 5]
         * }
         * ```
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * type Phone = {
         *   name: string;
         *   brand: string;
         *   type: string;
         * };
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<Phone>): void {
         *   collection
         *     .apppend([
         *       { name: "iPhone 6", brand: "Apple", type: "phone" },
         *       { name: "iPhone 5", brand: "Apple", type: "phone" },
         *       { name: "Apple Watch", brand: "Apple", type: "watch" },
         *       { name: "Galaxy S6", brand: "Samsung", type: "phone" },
         *       { name: "Galaxy Gear", brand: "Samsung", type: "watch" },
         *     ])
         *     .difference(
         *       [
         *         { name: "Apple Watch", brand: "Apple", type: "watch" },
         *       ],
         *       (product) => product.type
         *     )
         *     .toArray();
         *   // [
         *   //   { name: "iPhone 6", brand: "Apple", type: "phone" },
         *   //   { name: "iPhone 5", brand: "Apple", type: "phone" },
         *   //   { name: "Galaxy S6", brand: "Samsung", type: "phone" },
         *   // ]
         * }
         * ```
         */
        difference<TOutput = TInput>(
            iterable: Iterable<TInput>,
            selectFn?: Map<TInput, ICollection<TInput>, TOutput>,
        ): ICollection<TInput>;

        /**
         * The <i>repeat</i> method will repeat the original collection <i>amount</i> times.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 2, 3])
         *     .repeat(3)
         *     .toArray();
         *   // [1, 2, 3,  1, 2, 3,  1, 2, 3]
         * }
         * ```
         */
        repeat(amount: number): ICollection<TInput>;

        /**
         * The <i>padStart</i> method pads this collection with <i>fillItems</i> until the resulting collection size reaches <i>maxLength</i>.
         * The padding is applied from the start of this collection.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<string>): void {
         *   collection
         *     .append("abc")
         *     .padStart(10, "foo")
         *     .join("");
         *     // "foofoofabc"
         * }
         * ```
         * @example
         * ```ts
         * function main(collection: ICollection<string>): void {
         *   collection
         *     .append("abc")
         *     .padStart(6, "123465")
         *     .join("");
         *   // "123abc"
         * }
         * ```
         * @example
         * ```ts
         * function main(collection: ICollection<string>): void {
         *   collection
         *     .append("abc")
         *     .padStart(8, "0")
         *     .join("");
         *   // "00000abc"
         * }
         * ```
         * @example
         * ```ts
         * function main(collection: ICollection<string>): void {
         *   collection
         *     .append("abc")
         *     .padStart(1, "_")
         *     .join("");
         *   // "abc"
         * }
         * ```
         */
        padStart<TExtended = TInput>(
            maxLength: number,
            fillItems: Iterable<TExtended>,
        ): ICollection<TInput | TExtended>;

        /**
         * The <i>padEnd</i> method pads this collection with <i>fillItems</i> until the resulting collection size reaches <i>maxLength</i>.
         * The padding is applied from the end of this collection.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<string>): void {
         *   collection
         *     .append("abc")
         *     .padEnd(10, "foo")
         *     .join("");
         *   // "abcfoofoof"
         * }
         * ```
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<string>): void {
         *   collection
         *     .append("abc")
         *     .padEnd(6, "123465")
         *     .join("");
         *   // "abc123"
         * }
         * ```
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<string>): void {
         *   collection
         *     .append("abc")
         *     .padEnd(8, "0")
         *     .join("");
         *   // "abc00000"
         *
         * }
         * ```
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<string>): void {
         *   collection
         *     .append("abc")
         *     .padEnd(1, "_")
         *     .join("");
         *   // "abc"
         * }
         * ```
         */
        padEnd<TExtended = TInput>(
            maxLength: number,
            fillItems: Iterable<TExtended>,
        ): ICollection<TInput | TExtended>;

        /**
         * The <i>slice</i> method creates porition of the original collection selected from <i>start</i> and <i>end</i>
         * where <i>start</i> and <i>end</i> (end not included) represent the index of items in the collection.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<string>): void {
         *   collection
         *     .apppend(["a", "b", "c", "d", "e", "f"])
         *     .slice(3)
         *     .toArray();
         *   // ["d", "e", "f"]
         * }
         * ```
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<string>): void {
         *   collection
         *     .apppend(["a", "b", "c", "d", "e", "f"])
         *     .slice(undefined, 2)
         *     .toArray()
         *   // ["a", "b"]
         * }
         * ```
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<string>): void {
         *   collection
         *     .apppend(["a", "b", "c", "d", "e", "f"])
         *     .slice(2, 5)
         *     .toArray()
         *   // ["c", "d", "e"]
         * }
         * ```
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<string>): void {
         *   collection
         *     .apppend(["a", "b", "c", "d", "e", "f"])
         *     .slice(-2)
         *     .toArray();
         *   // ["e", "f"]
         * }
         * ```
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<string>): void {
         *   collection
         *     .apppend(["a", "b", "c", "d", "e", "f"])
         *     .slice(undefined, -2)
         *     .toArray()
         *   // ["a", "b", "c", "d"]
         * }
         * ```
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<string>): void {
         *   collection
         *     .apppend(["a", "b", "c", "d", "e", "f"])
         *     .slice(-4, -2)
         *     .toArray();
         *   // ["c", "d"]
         * }
         * ```
         */
        slice(start?: number, end?: number): ICollection<TInput>;

        /**
         * The <i>prepend</i> method adds <i>iterable</i> to the beginning of the collection.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 2, 3, 4, 5])
         *     .prepend([-1, 20])
         *     .toArray();
         *   // [-1, 20, 1, 2, 3, 4, 5]
         * }
         * ```
         */
        prepend<TExtended = TInput>(
            iterable: Iterable<TInput | TExtended>,
        ): ICollection<TInput | TExtended>;

        /**
         * The <i>append</i> method adds <i>iterable</i> to the end of the collection.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 2, 3, 4, 5])
         *     .append([-1, -2])
         *     .toArray();
         *   // [1, 2, 3, 4, 5, -1, -2,]
         * }
         * ```
         */
        append<TExtended = TInput>(
            iterable: Iterable<TInput | TExtended>,
        ): ICollection<TInput | TExtended>;

        /**
         * The <i>insertBefore</i> method adds <i>iterable</i> before the first item that matches <i>predicateFn</i>.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 2, 2, 3, 4, 5])
         *     .insertBefore(item => item === 2, [-1, 20])
         *     .toArray();
         *   // [1, -1, 20, 2, 2, 3, 4, 5]
         * }
         * ```
         */
        insertBefore<TExtended = TInput>(
            predicateFn: Predicate<TInput, ICollection<TInput>>,
            iterable: Iterable<TInput | TExtended>,
        ): ICollection<TInput | TExtended>;

        /**
         * The <i>insertAfter</i> method adds <i>iterable</i> after the first item that matches <i>predicateFn</i>.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 2, 2, 3, 4, 5])
         *     .insertAfter(item => item === 2, [-1, 20])
         *     .toArray();
         *   // [1, 2, -1, 20, 2, 3, 4, 5]
         * }
         * ```
         */
        insertAfter<TExtended = TInput>(
            predicateFn: Predicate<TInput, ICollection<TInput>>,
            iterable: Iterable<TInput | TExtended>,
        ): ICollection<TInput | TExtended>;

        /**
         * The <i>crossJoin</i> method cross joins the collection's values among <i>iterables</i>, returning a Cartesian product with all possible permutations.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 2])
         *     .cross(["a", "b"])
         *     .toArray();
         *   // [
         *   //  [1, "a"],
         *   //  [1, "b"],
         *   //  [2, "a"],
         *   //  [2, "b"],
         *   // ]
         * }
         * ```
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 2])
         *     .cross(["a", "b"])
         *     .cross(["I", "II"])
         *     .toArray();
         *   // [
         *   //  [1, "a", "I"],
         *   //  [1, "a", "II"],
         *   //  [1, "b", "I"],
         *   //  [1, "b", "II"],
         *   //  [2, "a", "I"],
         *   //  [2, "a", "II"],
         *   //  [2, "b", "I"],
         *   //  [2, "b", "II"],
         *   // ]
         * }
         * ```
         */
        crossJoin<TExtended>(
            iterable: Iterable<TExtended>,
        ): ICollection<CrossJoinResult<TInput, TExtended>>;

        /**
         * The <i>zip</i> method merges together the values of <i>iterable</i> with the values of the collection at their corresponding index.
         * The returned collection has size of the shortest collection.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<string>): void {
         *   collection
         *     .apppend(["Chair", "Desk"]);
         *     .zip([100, 200]);
         *     .toArray();
         *   // [["Chair", 100], ["Desk", 200]]
         * }
         * ```
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<string>): void {
         *   collection
         *     .apppend(["Chair", "Desk", "Couch"])
         *     .zip([100, 200])
         *     .toArray();
         *   // [["Chair", 100], ["Desk", 200]]
         * }
         * ```
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<string>): void {
         *   collection
         *     .apppend(["Chair", "Desk"])
         *     .zip([100, 200, 300])
         *     .toArray();
         *   // [["Chair", 100], ["Desk", 200]]
         * }
         * ```
         */
        zip<TExtended>(
            iterable: Iterable<TExtended>,
        ): ICollection<[TInput, TExtended]>;

        /**
         * The <i>sort</i> method sorts the collection. You can provide a <i>comparator</i> function.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([-1, 2, 4, 3])
         *     .sort()
         *     .toArray()
         *   // [-1, 2, 3, 4]
         * }
         * ```
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * type Person = {
         *   name: string;
         *   age: number;
         * };
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<Person>): void {
         *   collection
         *     .apppend([
         *       { name: "Anders", age: 30 },
         *       { name: "Joe", age: 20 },
         *       { name: "Hasan", age: 25 },
         *       { name: "Linda", age: 19 }
         *     ])
         *     .sort(({ age: ageA }, { age: ageB }) => ageA - ageB)
         *     .toArray();
         *   // [
         *   //   { name: "Linda", age: 19 }
         *   //   { name: "Joe", age: 20 },
         *   //   { name: "Hasan", age: 25 },
         *   //   { name: "Anders", age: 30 },
         *   // ]
         * }
         * ```
         */
        sort(comparator?: Comparator<TInput>): ICollection<TInput>;

        /**
         * The <i>reverse</i> method will reverse the order of the collection.
         * The reversing of the collection will be applied in chunks that are the size of <i> chunkSize </i>.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([-1, 2, 4, 3])
         *     .reverse()
         *     .toArray();
         *   // [3, 4, 2, -1]
         * }
         * ```
         */
        reverse(chunkSize?: number): ICollection<TInput>;

        /**
         * The <i>shuffle</i> method randomly shuffles the items in the collection. You can provide a custom Math.random function by passing in <i>mathRandom</i>.
         */
        shuffle(mathRandom?: () => number): ICollection<TInput>;

        /**
         * The <i>first</i> method returns the first item in the collection that passes <i> predicateFn </i>.
         * By default it will get the first item. If the collection is empty or no items passes <i> predicateFn </i> than null i returned.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 2, 3, 4])
         *     .first();
         *   // 1
         * }
         * ```
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 2, 3, 4])
         *     .first(item => item > 2);
         *   // 3
         * }
         * ```
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 2, 3, 4])
         *     .first(item => item > 10);
         *   // null
         * }
         * ```
         * // 3
         */
        first<TOutput extends TInput>(
            predicateFn?: Predicate<TInput, ICollection<TInput>, TOutput>,
        ): TOutput | null;

        /**
         * The <i>firstOr</i> method returns the first item in the collection that passes <i> predicateFn </i>
         * By default it will get the first item. If the collection is empty or no items passes <i> predicateFn </i> than <i> defaultValue </i>.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 2, 3, 4])
         *     .firstOr(-1);
         *   // 1
         * }
         * ```
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 2, 3, 4])
         *     .firstOr(-1, item => item > 2);
         *   // 3
         * }
         * ```
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 2, 3, 4])
         *     .firstOr(-1, item => item > 10);
         *   // -1
         * }
         * ```
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 2, 3, 4])
         *     .firstOr(() => -1, item => item > 10);
         *   // -1
         * }
         * ```
         */
        firstOr<TOutput extends TInput, TExtended = TInput>(
            defaultValue: Lazyable<TExtended>,
            predicateFn?: Predicate<TInput, ICollection<TInput>, TOutput>,
        ): TOutput | TExtended;

        /**
         * The <i>firstOrFail</i> method returns the first item in the collection that passes <i> predicateFn </i>.
         * By default it will get the first item. If the collection is empty or no items passes <i> predicateFn </i> than error is thrown.
         * @throws {ItemNotFoundCollectionError} {@link ItemNotFoundCollectionError}
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 2, 3, 4])
         *     .firstOrFail();
         *   // 1
         * }
         * ```
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 2, 3, 4])
         *     .firstOrFail(item => item > 2);
         *   // 3
         * }
         * ```
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 2, 3, 4])
         *     .firstOrFail(item => item > 10);
         *   // throws an error
         * }
         * ```
         */
        firstOrFail<TOutput extends TInput>(
            predicateFn?: Predicate<TInput, ICollection<TInput>, TOutput>,
        ): TOutput;

        /**
         * The <i>last</i> method returns the last item in the collection that passes <i> predicateFn </i>.
         * By default it will get the last item. If the collection is empty or no items passes <i> predicateFn </i> than null i returned.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 2, 3, 4])
         *     .last();
         *   // 4
         * }
         * ```
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 2, 3, 4])
         *     .last(item => item < 4);
         *   // 3
         * }
         * ```
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 2, 3, 4])
         *     .last(item => item > 10);
         *   // null
         * }
         * ```
         */
        last<TOutput extends TInput>(
            predicateFn?: Predicate<TInput, ICollection<TInput>, TOutput>,
        ): TOutput | null;

        /**
         * The <i>lastOr</i> method returns the last item in the collection that passes <i> predicateFn </i>.
         * By default it will get the last item. If the collection is empty or no items passes <i> predicateFn </i> than <i> defaultValue </i>.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 2, 3, 4])
         *     .lastOr(-1);
         *   // 4
         * }
         * ```
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 2, 3, 4])
         *     .lastOr(-1, item => item < 4);
         *   // 3
         * }
         * ```
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 2, 3, 4])
         *     .lastOr(-1, item => item > 10);
         *   // -1
         * }
         * ```
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 2, 3, 4])
         *     .lastOr(() => -1, item => item > 10);
         *   // -1
         * }
         * ```
         */
        lastOr<TOutput extends TInput, TExtended = TInput>(
            defaultValue: Lazyable<TExtended>,
            predicateFn?: Predicate<TInput, ICollection<TInput>, TOutput>,
        ): TOutput | TExtended;

        /**
         * The <i>lastOrFail</i> method returns the last item in the collection that passes <i> predicateFn </i>.
         * By default it will get the last item. If the collection is empty or no items passes <i> predicateFn </i> than error is thrown.
         * @throws {ItemNotFoundCollectionError} {@link ItemNotFoundCollectionError}
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 2, 3, 4])
         *     .lastOrFail();
         *   // 4
         * }
         * ```
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 2, 3, 4])
         *     .lastOrFail(item => item < 4);
         *   // 3
         * }
         * ```
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .lastOrFail(item => item > 10);
         *     .apppend([1, 2, 3, 4])
         *   // throws an error
         * }
         * ```
         */
        lastOrFail<TOutput extends TInput>(
            predicateFn?: Predicate<TInput, ICollection<TInput>, TOutput>,
        ): TOutput;

        /**
         * The <i>before</i> method returns the item that comes before the first item that matches <i>predicateFn</i>.
         * If the <i>predicateFn</i> does not match or matches the first item then null is returned.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 2, 3, 4])
         *     .before(item => item === 2);
         *   // 1
         * }
         * ```
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 2, 3, 4])
         *     .before(item => item === 1);
         *   // null
         * }
         * ```
         */
        before(
            predicateFn: Predicate<TInput, ICollection<TInput>>,
        ): TInput | null;

        /**
         * The <i>beforeOr</i> method returns the item that comes before the first item that matches <i>predicateFn</i>.
         * If the collection is empty or the <i>predicateFn</i> does not match or matches the first item then <i>defaultValue</i> is returned.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 2, 3, 4])
         *     .beforeOr(-1, item => item === 2);
         *   // 1
         * }
         * ```
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 2, 3, 4])
         *     .beforeOr(-1, item => item === 1);
         *   // -1
         * }
         * ```
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 2, 3, 4])
         *     .beforeOr(() => -1, item => item === 1);
         *   // -1
         * }
         * ```
         */
        beforeOr<TExtended = TInput>(
            defaultValue: Lazyable<TExtended>,
            predicateFn: Predicate<TInput, ICollection<TInput>>,
        ): TInput | TExtended;

        /**
         * The <i>beforeOrFail</i> method returns the item that comes before the first item that matches <i>predicateFn</i>.
         * If the collection is empty or the <i>predicateFn</i> does not match or matches the first item then an error is thrown.
         * @throws {ItemNotFoundCollectionError} {@link ItemNotFoundCollectionError}
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 2, 3, 4])
         *     .beforeOrFail(item => item === 2);
         *   // 1
         * }
         * ```
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 2, 3, 4])
         *     .beforeOrFail(item => item === 1);
         * // error is thrown
         * }
         * ```
         */
        beforeOrFail(
            predicateFn: Predicate<TInput, ICollection<TInput>>,
        ): TInput;

        /**
         * The <i>after</i> method returns the item that comes after the first item that matches <i>predicateFn</i>.
         * If the collection is empty or the <i>predicateFn</i> does not match or matches the last item then null is returned.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 2, 3, 4])
         *     .after(item => item === 2);
         *   // 3
         * }
         * ```
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 2, 3, 4])
         *     .after(item => item === 4);
         *   // null
         * }
         * ```
         */
        after(
            predicateFn: Predicate<TInput, ICollection<TInput>>,
        ): TInput | null;

        /**
         * The <i>afterOr</i> method returns the item that comes after the first item that matches <i>predicateFn</i>.
         * If the collection is empty or the <i>predicateFn</i> does not match or matches the last item then <i>defaultValue</i> is returned.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 2, 3, 4])
         *     .afterOr(-1, item => item === 2);
         *   // 3
         * }
         * ```
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 2, 3, 4])
         *     .afterOr(-1, item => item === 4);
         *   // -1
         * }
         * ```
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 2, 3, 4])
         *     .afterOr(() => -1, item => item === 4);
         *   // -1
         * }
         * ```
         */
        afterOr<TExtended = TInput>(
            defaultValue: Lazyable<TExtended>,
            predicateFn: Predicate<TInput, ICollection<TInput>>,
        ): TInput | TExtended;

        /**
         * The <i>afterOrFail</i> method returns the item that comes after the first item that matches <i>predicateFn</i>.
         * If the collection is empty or the <i>predicateFn</i> does not match or matches the last item then an error is thrown.
         * @throws {ItemNotFoundCollectionError} {@link ItemNotFoundCollectionError}
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 2, 3, 4])
         *     .afterOrFail(item => item === 2);
         *   // 3
         * }
         * ```
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 2, 3, 4])
         *     .afterOrFail(item => item === 4);
         *   // error is thrown
         * }
         * ```
         */
        afterOrFail(
            predicateFn: Predicate<TInput, ICollection<TInput>>,
        ): TInput;

        /**
         * The <i>sole</i> method returns the first item in the collection that passes <i>predicateFn</i>, but only if <i>predicateFn</i> matches exactly one item.
         * If no items matches or multiple items are found an error will be thrown.
         * @throws {ItemNotFoundCollectionError} {@link ItemNotFoundCollectionError}
         * @throws {MultipleItemsFoundCollectionError} {@link MultipleItemsFoundCollectionError}
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 2, 3, 4, 5])
         *     .sole(item => item === 4);
         *   // 4
         * }
         * ```
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 2, 3, 4, 4, 5])
         *     .sole(item => item === 4);
         *   // error is thrown
         * }
         * ```
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 2, 3, 5])
         *     .sole(item => item === 4);
         *   // error is thrown
         * }
         * ```
         */
        sole<TOutput extends TInput>(
            predicateFn: Predicate<TInput, ICollection<TInput>, TOutput>,
        ): TOutput;

        /**
         * The <i>nth</i> method creates a new collection consisting of every n-th item.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<string>): void {
         *   collection
         *     .apppend(["a", "b", "c", "d", "e", "f"])
         *     .nth(4)
         *     .toArray();
         *   // ["a", "e"]
         * }
         * ```
         */
        nth(step: number): ICollection<TInput>;

        /**
         * The <i>count</i> method returns the total number of items in the collection that passes <i>predicateFn</i>.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<number>): void {
         *   collection
         *     .apppend([1, 2, 3, 4, 5, 6])
         *     .count(value => value % 2 === 0);
         *   // 3
         * }
         * ```
         */
        count(predicateFn: Predicate<TInput, ICollection<TInput>>): number;

        /**
         * The <i>size</i> returns the size of the collection.
         */
        size(): number;

        /**
         * The <i>isEmpty</i> returns true if the collection is empty.
         */
        isEmpty(): boolean;

        /**
         * The <i>isNotEmpty</i> returns true if the collection is not empty.
         */
        isNotEmpty(): boolean;

        /**
         * The <i>searchFirst</i> return the index of the first item that matches <i>predicateFn</i>.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<string>): void {
         *   collection
         *     .apppend(["a", "b", "b", "c"])
         *     .searchFirst(item => item === "b");
         *   // 1
         * }
         * ```
         */
        searchFirst(
            predicateFn: Predicate<TInput, ICollection<TInput>>,
        ): number;

        /**
         * The <i>searchLast</i> return the index of the last item that matches <i>predicateFn</i>.
         * @example
         * ```ts
         * import type { ICollection } from "@daiso-tech/core";
         *
         * // Assume the inputed collection is empty.
         * function main(collection: ICollection<string>): void {
         *   collection
         *     .apppend(["a", "b", "b", "c"])
         *     .searchLast(item => item === "b");
         *   // 2
         * }
         * ```
         */
        searchLast(predicateFn: Predicate<TInput, ICollection<TInput>>): number;

        /**
         * The <i>forEach</i> method iterates through all items in the collection.
         */
        forEach(callback: ForEach<TInput, ICollection<TInput>>): void;

        /**
         * The <i>toArray</i> method converts the collection to a new <i>{@link Array}</i>.
         */
        toArray(): TInput[];

        /**
         * The <i>toRecord</i> method converts the collection to a new <i>{@link Record}</i>.
         * An error will be thrown if item is not a tuple of size 2 where the first element is a string or a number.
         * @throws {TypeCollectionError} {@link TypeCollectionError}
         */
        toRecord(): EnsureRecord<TInput>;

        /**
         * The <i>toMap</i> method converts the collection to a new <i>{@link Map}</i>.
         * An error will be thrown if item is not a tuple of size 2.
         * @throws {TypeCollectionError} {@link TypeCollectionError}
         */
        toMap(): EnsureMap<TInput>;
    };
