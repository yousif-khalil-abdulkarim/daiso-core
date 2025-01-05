/**
 * @module Collection
 */

import type {
    AsyncReduce,
    CrossJoinResult,
    AsyncPredicate,
    AsyncForEach,
    AsyncMap,
    AsyncModifier,
    AsyncTap,
    AsyncTransform,
    Comparator,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ItemNotFoundCollectionError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    MultipleItemsFoundCollectionError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    UnexpectedCollectionError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    TypeCollectionError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    EmptyCollectionError,
} from "@/collection/contracts/_shared";
import type {
    RecordItem,
    AsyncLazyable,
    AsyncIterableValue,
} from "@/_shared/types";
import type { TimeSpan } from "@/utilities/_module";

export type AsyncCollapse<TValue> = TValue extends
    | Array<infer TItem>
    | Iterable<infer TItem>
    | IAsyncCollection<infer TItem>
    ? TItem
    : TValue;

/**
 * The <i>IAsyncCollection</i> contract offers a fluent and efficient approach to working with {@link AsyncIterable} objects.
 * <i>IAsyncCollection</i> is immutable.
 * @group Contracts
 */
export type IAsyncCollection<TInput> = AsyncIterable<TInput> & {
    /**
     * The <i>toIterator</i> method converts the collection to a new iterator.
     */
    toIterator(): AsyncIterator<TInput, void>;

    /**
     * The <i>entries</i> returns an IAsyncCollection of key, value pairs for every entry in the collection.
     */
    entries(): IAsyncCollection<RecordItem<number, TInput>>;

    /**
     * The <i>keys</i> method returns an IAsyncCollection of keys in the collection.
     */
    keys(): IAsyncCollection<number>;

    /**
     * The <i>values</i> method returns a copy of the collection.
     */
    values(): IAsyncCollection<TInput>;

    /**
     * The <i>filter</i> method filters the collection using <i>predicateFn</i>, keeping only those items that pass <i>predicateFn</i>.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4, 5, 6]);
     * const filtered = collection.filter(item => 2 < item && item < 5);
     * await filtered.toArray();
     * // [3, 4]
     * ```
     */
    filter<TOutput extends TInput>(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>, TOutput>,
    ): IAsyncCollection<TOutput>;

    /**
     * The <i>reject</i> method filters the collection using <i>predicateFn</i>, keeping only those items that not pass <i>predicateFn</i>.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4, 5, 6]);
     * const filtered = collection.reject(item => 2 < item && item < 5);
     * await filtered.toArray();
     * // [1, 2, 5, 6]
     * ```
     */
    reject<TOutput extends TInput>(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>, TOutput>,
    ): IAsyncCollection<Exclude<TInput, TOutput>>;

    /**
     * The <i>map</i> method iterates through the collection and passes each item to <i>mapFn</i>.
     * The <i>mapFn</i> is free to modify the item and return it, thus forming a new collection of modified items.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4, 5]);
     * const mapped = collection.map(item => item * 2);
     * await mapped.toArray();
     * // [2, 4, 6, 8, 10]
     * ```
     */
    map<TOutput>(
        mapFn: AsyncMap<TInput, IAsyncCollection<TInput>, TOutput>,
    ): IAsyncCollection<TOutput>;

    /**
     * The <i>reduce</i> method executes <i> reduceFn </i> function on each item of the array, passing in the return value from the calculation on the preceding item.
     * The final result of running the reducer across all items of the array is a single value.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3]);
     * await collection.reduce((sum, item) => sum + item);
     * // 6
     * ```
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection(["a", "b", "c"]);
     * await collection.entries().reduce(
     *   (record, [key, value]) => ({
     *     ...record,
     *     [key]: value
     *   }),
     *   {} as Record<number, string>
     * );
     * // { 0: "a", 1: "b", 2: "c" }
     * ```
     */
    reduce(
        reduceFn: AsyncReduce<TInput, IAsyncCollection<TInput>, TInput>,
    ): PromiseLike<TInput>;
    reduce(
        reduceFn: AsyncReduce<TInput, IAsyncCollection<TInput>, TInput>,
        // eslint-disable-next-line @typescript-eslint/unified-signatures
        initialValue: TInput,
    ): PromiseLike<TInput>;
    reduce<TOutput>(
        reduceFn: AsyncReduce<TInput, IAsyncCollection<TInput>, TOutput>,
        initialValue: TOutput,
    ): PromiseLike<TOutput>;

    /**
     * The <i>join</i> method joins the collection's items with <i> separator </i>. An error will be thrown when if a none string item is encounterd.
     * @throws {TypeCollectionError}
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.map(item => item.toString()).join();
     * // "1,2,3,4"
     * ```
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.map(item => item.toString()).join("_");
     * // "1_2_3_4"
     * ```
     */
    join(separator?: string): PromiseLike<Extract<TInput, string>>;

    /**
     * The <i>collapse</i> method collapses a collection of iterables into a single, flat collection.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([[1, 2], [3, 4]]);
     * const collapsed = collection.collapse();
     * await collapsed.toArray();
     * // [1, 2, 3, 4]
     * ```
     */
    collapse(): IAsyncCollection<AsyncCollapse<TInput>>;

    /**
     * The <i>flatMap</i> method returns a new array formed by applying <i>mapFn</i> to each item of the array, and then collapses the result by one level.
     * It is identical to a <i>map</i> method followed by a <i>collapse</i> method.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([["a", "b"], ["c", "d"]]).flatMap(item => [item.length, ...item]);
     * await collection.toArray();
     * // [2, "a", "b", 2, "c", "d"]
     * ```
     */
    flatMap<TOutput>(
        mapFn: AsyncMap<TInput, IAsyncCollection<TInput>, Iterable<TOutput>>,
    ): IAsyncCollection<TOutput>;

    /**
     * The <i>change</i> method changes only the items that passes <i>predicateFn</i> using <i>mapFn</i>.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4, 5]);
     * const newCollection = collection.change(item => item % 2 === 0, item => item * 2);
     * await newCollection.toArray();
     * // [1, 4, 3, 8, 5]
     * ```
     */
    change<TFilterOutput extends TInput, TMapOutput>(
        predicateFn: AsyncPredicate<
            TInput,
            IAsyncCollection<TInput>,
            TFilterOutput
        >,
        mapFn: AsyncMap<TFilterOutput, IAsyncCollection<TInput>, TMapOutput>,
    ): IAsyncCollection<TInput | TFilterOutput | TMapOutput>;

    /**
     * The <i>page</i> method returns a new collection containing the items that would be present on <i> page </i> with custom <i> pageSize </i>.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4, 5, 6, 7, 8, 9]);
     * const page = collection.page(2, 3);
     * await page.toArray();
     * // [4, 5, 6]
     * ```
     */
    page(page: number, pageSize: number): IAsyncCollection<TInput>;

    /**
     * The <i>sum</i> method returns the sum of all items in the collection. If the collection includes other than number items an error will be thrown.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3]);
     * await collection.sum();
     * // 6
     * ```
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {TypeCollectionError} {@link TypeCollectionError}
     * @throws {EmptyCollectionError} {@link EmptyCollectionError}
     */
    sum(): PromiseLike<Extract<TInput, number>>;

    /**
     * The <i>average</i> method returns the average of all items in the collection. If the collection includes other than number items an error will be thrown.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3]);
     * await collection.average();
     * // 2
     * ```
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {TypeCollectionError} {@link TypeCollectionError}
     * @throws {EmptyCollectionError} {@link EmptyCollectionError}
     */
    average(): PromiseLike<Extract<TInput, number>>;

    /**
     * The <i>median</i> method returns the median of all items in the collection. If the collection includes other than number items an error will be thrown.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3]);
     * await collection.median();
     * // 2
     * ```
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {TypeCollectionError} {@link TypeCollectionError}
     * @throws {EmptyCollectionError} {@link EmptyCollectionError}
     */
    median(): PromiseLike<Extract<TInput, number>>;

    /**
     * The <i>min</i> method returns the min of all items in the collection. If the collection includes other than number items an error will be thrown.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3]);
     * await collection.min();
     * // 1
     * ```
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {TypeCollectionError} {@link TypeCollectionError}
     * @throws {EmptyCollectionError} {@link EmptyCollectionError}
     */
    min(): PromiseLike<Extract<TInput, number>>;

    /**
     * The <i>max</i> method returns the max of all items in the collection. If the collection includes other than number items an error will be thrown.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3]);
     * await collection.max();
     * // 3
     * ```
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {TypeCollectionError} {@link TypeCollectionError}
     * @throws {EmptyCollectionError} {@link EmptyCollectionError}
     */
    max(): PromiseLike<Extract<TInput, number>>;

    /**
     * The <i>percentage</i> method may be used to quickly determine the percentage of items in the collection that pass <i>predicateFn</i>.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 1, 2, 2, 2, 3]);
     * await collection.percentage(value => value === 1);
     * // 33.333
     * ```
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {EmptyCollectionError} {@link EmptyCollectionError}
     */
    percentage(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
    ): PromiseLike<number>;

    /**
     * The <i>some</i> method determines whether at least one item in the collection matches <i>predicateFn</i>.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([0, 1, 2, 3, 4, 5]);
     * await collection.some(item => item === 1);
     * // true
     * ```
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     */
    some<TOutput extends TInput>(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>, TOutput>,
    ): PromiseLike<boolean>;

    /**
     * The <i>every</i> method determines whether all items in the collection matches <i>predicateFn</i>.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([0, 1, 2, 3, 4, 5]);
     * await collection.every(item => item < 6);
     * // true
     * ```
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     */
    every<TOutput extends TInput>(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>, TOutput>,
    ): PromiseLike<boolean>;

    /**
     * The <i>take</i> method takes the first <i>limit</i> items.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([0, 1, 2, 3, 4, 5]);
     * const chunk = collection.take(3);
     * await chunk.toArray();
     * // [0, 1, 2]
     * ```
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([0, 1, 2, 3, 4, 5]);
     * const chunk = collection.take(-2);
     * await chunk.toArray();
     * // [0, 1, 2, 3]
     * ```
     */
    take(limit: number): IAsyncCollection<TInput>;

    /**
     * The <i>takeUntil</i> method takes items until <i>predicateFn</i> returns true.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * const chunk = collection.takeUntil(item => item >= 3);
     * await chunk.toArray();
     * // [1, 2]
     * ```
     */
    takeUntil(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
    ): IAsyncCollection<TInput>;

    /**
     * The <i>takeWhile</i> method takes items until <i>predicateFn</i> returns false.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * const chunk = collection.takeWhile(item => item < 4);
     * await chunk.toArray();
     * // [1, 2, 3]
     * ```
     */
    takeWhile(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
    ): IAsyncCollection<TInput>;

    /**
     * The <i>skip</i> method skips the first <i>offset</i> items.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).skip(4);
     * await collection.toArray();
     * // [5, 6, 7, 8, 9, 10]
     * ```
     */
    skip(offset: number): IAsyncCollection<TInput>;

    /**
     * The <i>skipUntil</i> method skips items until <i>predicateFn</i> returns true.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]).skipUntil(item => item >= 3);
     * await collection.toArray();
     * // [3, 4]
     * ```
     */
    skipUntil(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
    ): IAsyncCollection<TInput>;

    /**
     * The <i>skipWhile</i> method skips items until <i>predicateFn</i> returns false.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]).skipWhile(item => item <= 3);
     * await collection.toArray();
     * // [4]
     * ```
     */
    skipWhile(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
    ): IAsyncCollection<TInput>;

    /**
     * The <i>when</i> method will execute <i>callback</i> when <i>condition</i> evaluates to true.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4])
     *  .when(true, collection => collection.append([-3]))
     *  .when(false, collection => collection.append([20]));
     * await collection.toArray();
     * // [1, 2, 3, 4, -3]
     * ```
     */
    when<TExtended = TInput>(
        condition: boolean,
        callback: AsyncModifier<
            IAsyncCollection<TInput>,
            IAsyncCollection<TExtended>
        >,
    ): IAsyncCollection<TInput | TExtended>;

    /**
     * The <i>whenEmpty</i> method will execute <i>callback</i> when the collection is empty.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([])
     *  .whenEmpty(collection => collection.append([-3]))
     * await collection.toArray();
     * // [-3]
     * ```
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1])
     *  .whenEmpty(collection => collection.append([-3]))
     * await collection.toArray();
     * // [1]
     * ```
     */
    whenEmpty<TExtended = TInput>(
        callback: AsyncModifier<
            IAsyncCollection<TInput>,
            IAsyncCollection<TExtended>
        >,
    ): IAsyncCollection<TInput | TExtended>;

    /**
     * The <i>whenNot</i> method will execute <i>callback</i> when <i>condition</i> evaluates to false.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4])
     *  .whenNot(true, collection => collection.append([-3]))
     *  .whenNot(false, collection => collection.append([20]));
     * await collection.toArray();
     * // [1, 2, 3, 4, 20]
     * ```
     */
    whenNot<TExtended = TInput>(
        condition: boolean,
        callback: AsyncModifier<
            IAsyncCollection<TInput>,
            IAsyncCollection<TExtended>
        >,
    ): IAsyncCollection<TInput | TExtended>;

    /**
     * The <i>whenNotEmpty</i> method will execute <i>callback</i> when the collection is not empty.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([])
     *  .whenNotEmpty(collection => collection.append([-3]))
     * await collection.toArray();
     * // []
     * ```
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1])
     *  .whenNotEmpty(collection => collection.append([-3]))
     * await collection.toArray();
     * // [1, -3]
     * ```
     */
    whenNotEmpty<TExtended = TInput>(
        callback: AsyncModifier<
            IAsyncCollection<TInput>,
            IAsyncCollection<TExtended>
        >,
    ): IAsyncCollection<TInput | TExtended>;

    /**
     * The <i>pipe</i> method passes the orignal collection to <i>callback</i> and returns the result from <i>callback</i>.
     * This method is useful when you want compose multiple smaller functions.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, "2", "a", 1, 3, {}]);
     * function toNbrs<TInput>(
     *       collection: IAsyncCollection<TInput>,
     * ): IAsyncCollection<number> {
     *   return collection
     *     .map((item) => Number(item))
     *     .reject((nbr) => Number.isNaN(nbr));
     * }
     * function nbrToStr(collection: IAsyncCollection<number>): number[] {
     *   return collection.repeat(2).toArray();
     * }
     * const piped = await collection.pipe(toNbrs).then(nbrToStr);
     * console.log(piped);
     * // [ 1, 2, 1, 3 ]
     * ```
     */
    pipe<TOutput = TInput>(
        callback: AsyncTransform<IAsyncCollection<TInput>, TOutput>,
    ): PromiseLike<TOutput>;

    /**
     * The <i>tap</i> method passes a copy of the original collection to <i>callback</i>, allowing you to do something with the items while not affecting the original collection.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = await new AsyncIterableCollection([1, 2, 3, 4, 5, 6])
     *   .tap(collection => {
     *     collection
     *       .filter(value => value % 2 === 0)
     *       .forEach(value => console.log(value))
     *   })
     *   .toArray();
     * // [1, 2, 3, 4, 5, 6]
     * ```
     */
    tap(callback: AsyncTap<IAsyncCollection<TInput>>): IAsyncCollection<TInput>;

    /**
     * The <i>chunk</i> method breaks the collection into multiple, smaller collections of size <i>chunkSize</i>.
     * If <i>chunkSize</i> is not divisible with total number of items then the last chunk will contain the remaining items.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4, 5, 6, 7]);
     * const chunks = collection.chunk(4);
     * await chunks.map(chunk => chunk.toArray()).toArray();
     * // [[1, 2, 3, 4], [5, 6, 7]]
     * ```
     */
    chunk(chunkSize: number): IAsyncCollection<IAsyncCollection<TInput>>;

    /**
     * The <i>chunkWhile</i> method breaks the collection into multiple, smaller collections based on the evaluation of <i>predicateFn</i>.
     * The chunk variable passed to the <i>predicateFn</i> may be used to inspect the previous item.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection("AABBCCCD");
     * const chunks = collection.chunkWhile((value, index, chunk) => {
     *  return value === chunk.last();
     * });
     * await chunks.map(chunk => chunk.toArray()).toArray();
     * //  [["A", "A"], ["B", "B"], ["C", "C", "C"], ["D"]]
     * ```
     */
    chunkWhile(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
    ): IAsyncCollection<IAsyncCollection<TInput>>;

    /**
     * The <i>split</i> method breaks a collection evenly into <i>chunkAmount</i> of chunks.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4, 5]);
     * const chunks = collection.split(3);
     * await chunks.map(chunk => chunk.toArray()).toArray();
     * // [[1, 2], [3, 4], [5]]
     * ```
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4, 5, 6]);
     * const chunks = collection.split(3);
     * await chunks.map(chunk => chunk.toArray()).toArray();
     * // [[1, 2], [3, 4], [5, 6]]
     * ```
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4, 5, 6, 7]);
     * const chunks = collection.split(3);
     * await chunks.map(chunk => chunk.toArray()).toArray();
     * // [[1, 2, 7], [3, 4], [5, 6]]
     */
    split(chunkAmount: number): IAsyncCollection<IAsyncCollection<TInput>>;

    /**
     * The <i>partition</i> method is used to separate items that pass <i>predicateFn</i> from those that do not.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4, 5, 6]);
     * const chunks = collection.partition(item => item < 3);
     * await chunks.map(chunk => chunk.toArray()).toArray();
     * // [[1, 2], [3, 4, 5, 6]]
     * ```
     */
    partition(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
    ): IAsyncCollection<IAsyncCollection<TInput>>;

    /**
     * The <i>sliding</i> method returns a new collection of chunks representing a "sliding window" view of the items in the collection.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4, 5])
     * const chunks = collection.sliding(2);
     * await chunks.map(chunk => chunk.toArray()).toArray();
     * // [[1, 2], [2, 3], [3, 4], [4, 5]]
     * ```
     */
    sliding(
        chunkSize: number,
        step?: number,
    ): IAsyncCollection<IAsyncCollection<TInput>>;

    /**
     * The <i>groupBy</i> method groups the collection's items by <i> selectFn </i>.
     * By default the equality check occurs on the item.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection(["a", "a", "a", "b", "b", "c"]);
     * const group = await collection
     *   .groupBy()
     *   .map(([key, collection]) => [key, collection.toArray()])
     *   .toArray();
     * // [
     * //  [
     * //    "a",
     * //    ["a", "a", "a"]
     * //  ],
     * //  [
     * //    "b",
     * //    ["b", "b"]
     * //  ],
     * //  [
     * //    "c",
     * //    ["c"]
     * //  ]
     * // ]
     * ```
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection(["alice@gmail.com", "bob@yahoo.com", "carlos@gmail.com"]);
     * const group = await collection
     *   .groupBy(item => item.split("@")[1])
     *   .map(([key, collection]) => [key, collection.toArray()])
     *   .toArray();
     * // [
     * //   [
     * //     "gmail.com",
     * //     ["alice@gmail.com", "carlos@gmail.com"]
     * //   ],
     * //   [
     * //     "yahoo.com",
     * //     ["bob@yahoo.com"]
     * //   ]
     * // ]
     * ```
     */
    groupBy<TOutput = TInput>(
        selectFn?: AsyncMap<TInput, IAsyncCollection<TInput>, TOutput>,
    ): IAsyncCollection<RecordItem<TOutput, IAsyncCollection<TInput>>>;

    /**
     * The <i>countBy</i> method counts the occurrences of values in the collection by <i> selectFn </i>.
     * By default the equality check occurs on the item.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection(["a", "a", "a", "b", "b", "c"]);
     * const count = await collection
     *   .countBy()
     *   .map(([key, collection]) => [key, collection.toArray()])
     *   .toArray();
     * // [
     * //  ["a", 3],
     * //  ["b", 2],
     * //  ["c", 1]
     * // ]
     * ```
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection(["alice@gmail.com", "bob@yahoo.com", "carlos@gmail.com"]);
     * const count = await collection
     *   .countBy(item => item.split("@")[1])
     *   .toArray();
     * // [
     * //   ["gmail.com", 2],
     * //   ["yahoo.com", 1]
     * // ]
     * ```
     */
    countBy<TOutput = TInput>(
        selectFn?: AsyncMap<TInput, IAsyncCollection<TInput>, TOutput>,
    ): IAsyncCollection<RecordItem<TOutput, number>>;

    /**
     * The <i>unique</i> method removes all duplicate values from the collection by <i> selectFn </i>.
     * By default the equality check occurs on the item.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 1, 2, 2, 3, 4, 2]);
     * await collection.unique().toArray();
     * // [1, 2, 3, 4]
     * ```
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([
     *   { name: "iPhone 6", brand: "Apple", type: "phone" },
     *   { name: "iPhone 5", brand: "Apple", type: "phone" },
     *   { name: "Apple Watch", brand: "Apple", type: "watch" },
     *   { name: "Galaxy S6", brand: "Samsung", type: "phone" },
     *   { name: "Galaxy Gear", brand: "Samsung", type: "watch" },
     * ]);
     * const unique = await collection.unique({
     *   selectFn: item => item.brand
     * }).toArray();
     * // [
     * //   { name: "iPhone 6", brand: "Apple", type: "phone" },
     * //   { name: "Galaxy S6", brand: "Samsung", type: "phone" },
     * // ]
     * ```
     */
    unique<TOutput = TInput>(
        selectFn?: AsyncMap<TInput, IAsyncCollection<TInput>, TOutput>,
    ): IAsyncCollection<TInput>;

    /**
     * The <i>difference</i> method will return the values in the original collection that are not present in <i>iterable</i>.
     * By default the equality check occurs on the item.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 2, 3, 4, 5]);
     * const difference = collection.difference([2, 4, 6, 8]);
     * await difference.toArray();
     * // [1, 3, 5]
     * ```
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([
     *   { name: "iPhone 6", brand: "Apple", type: "phone" },
     *   { name: "iPhone 5", brand: "Apple", type: "phone" },
     *   { name: "Apple Watch", brand: "Apple", type: "watch" },
     *   { name: "Galaxy S6", brand: "Samsung", type: "phone" },
     *   { name: "Galaxy Gear", brand: "Samsung", type: "watch" },
     * ]);
     * const difference = collection.difference(
     *   [
     *     { name: "Apple Watch", brand: "Apple", type: "watch" },
     *   ],
     *   (product) => product.type
     * );
     * await difference.toArray();
     * // [
     * //   { name: "iPhone 6", brand: "Apple", type: "phone" },
     * //   { name: "iPhone 5", brand: "Apple", type: "phone" },
     * //   { name: "Galaxy S6", brand: "Samsung", type: "phone" },
     * // ]
     * ```
     */
    difference<TOutput = TInput>(
        iterable: AsyncIterableValue<TInput>,
        selectFn?: AsyncMap<TInput, IAsyncCollection<TInput>, TOutput>,
    ): IAsyncCollection<TInput>;

    /**
     * The <i>repeat</i> method will repeat the original collection <i>amount</i> times.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3]);
     * const newCollection = collection.repeat(3);
     * await newCollection.toArray();
     * // [1, 2, 3,  1, 2, 3,  1, 2, 3]
     * ```
     */
    repeat(amount: number): IAsyncCollection<TInput>;

    /**
     * The <i>padStart</i> method pads this collection with <i>fillItems</i> until the resulting collection size reaches <i>maxLength</i>.
     * The padding is applied from the start of this collection.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * await new AsyncIterableCollection("abc").padStart(10, "foo").join("");
     * // "foofoofabc"
     *
     * await new AsyncIterableCollection("abc").padStart(6, "123465").join("");
     * // "123abc"
     *
     * await new AsyncIterableCollection("abc").padStart(8, "0").join("");
     * // "00000abc"
     *
     * await new AsyncIterableCollection("abc").padStart(1, "_").join("");
     * // "abc"
     * ```
     */
    padStart<TExtended = TInput>(
        maxLength: number,
        fillItems: AsyncIterableValue<TExtended>,
    ): IAsyncCollection<TInput | TExtended>;

    /**
     * The <i>padEnd</i> method pads this collection with <i>fillItems</i> until the resulting collection size reaches <i>maxLength</i>.
     * The padding is applied from the end of this collection.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * await new AsyncIterableCollection("abc").padEnd(10, "foo").join("");
     * // "abcfoofoof"
     *
     * await new AsyncIterableCollection("abc").padEnd(6, "123465").join("");
     * // "abc123"
     *
     * await new AsyncIterableCollection("abc").padEnd(8, "0").join("");
     * // "abc00000"
     *
     * await new AsyncIterableCollection("abc").padEnd(1, "_").join("");
     * // "abc"
     * ```
     */
    padEnd<TExtended = TInput>(
        maxLength: number,
        fillItems: AsyncIterableValue<TExtended>,
    ): IAsyncCollection<TInput | TExtended>;

    /**
     * The <i>slice</i> method creates porition of the original collection selected from <i>start</i> and <i>end</i>
     * where <i>start</i> and <i>end</i> (end not included) represent the index of items in the collection.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection(["a", "b", "c", "d", "e", "f"]);
     * await collection.slice(3).toArray();
     * // ["d", "e", "f"]
     * ```
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection(["a", "b", "c", "d", "e", "f"]);
     * await collection.slice(undefined, 2).toArray();
     * // ["a", "b"]
     * ```
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection(["a", "b", "c", "d", "e", "f"]);
     * await collection.slice(2, 5).toArray();
     * // ["c", "d", "e"]
     * ```
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection(["a", "b", "c", "d", "e", "f"]);
     * await collection.slice(-2).toArray();
     * // ["e", "f"]
     * ```
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection(["a", "b", "c", "d", "e", "f"]);
     * await collection.slice(undefined, -2).toArray();
     * // ["a", "b", "c", "d"]
     * ```
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection(["a", "b", "c", "d", "e", "f"]);
     * await collection.slice(-4, -2).toArray();
     * // ["c", "d"]
     * ```
     */
    slice(start?: number, end?: number): IAsyncCollection<TInput>;

    /**
     * The <i>prepend</i> method adds <i>iterable</i> to the beginning of the collection.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4, 5]).prepend([-1, 20]);
     * await collection.toArray();
     * // [-1, 20, 1, 2, 3, 4, 5]
     * ```
     */
    prepend<TExtended = TInput>(
        iterable: AsyncIterableValue<TInput | TExtended>,
    ): IAsyncCollection<TInput | TExtended>;

    /**
     * The <i>append</i> method adds <i>iterable</i> to the end of the collection.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4, 5]).append([-1, -2]);
     * await collection.toArray();
     * // [1, 2, 3, 4, 5, -1, -2,]
     * ```
     */
    append<TExtended = TInput>(
        iterable: AsyncIterableValue<TInput | TExtended>,
    ): IAsyncCollection<TInput | TExtended>;

    /**
     * The <i>insertBefore</i> method adds <i>iterable</i> before the first item that matches <i>predicateFn</i>.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 2, 3, 4, 5]).insertBefore(item => item === 2, [-1, 20]);
     * await collection.toArray();
     * // [1, -1, 20, 2, 2, 3, 4, 5]
     * ```
     */
    insertBefore<TExtended = TInput>(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
        iterable: AsyncIterableValue<TInput | TExtended>,
    ): IAsyncCollection<TInput | TExtended>;

    /**
     * The <i>insertAfter</i> method adds <i>iterable</i> after the first item that matches <i>predicateFn</i>.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 2, 3, 4, 5]).insertAfter(item => item === 2, [-1, 20]);
     * await collection.toArray();
     * // [1, 2, -1, 20, 2, 3, 4, 5]
     * ```
     */
    insertAfter<TExtended = TInput>(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
        iterable: AsyncIterableValue<TInput | TExtended>,
    ): IAsyncCollection<TInput | TExtended>;

    /**
     * The <i>crossJoin</i> method cross joins the collection's values among <i>iterables</i>, returning a Cartesian product with all possible permutations.
     * @example
     * ```ts
     * import { ListCollection } from "@daiso-tech/core";;
     *
     * const collection = new ListCollection([1, 2]);
     * const matrix = collection.cross(["a", "b"]);
     * await matrix.toArray();
     * // [
     * //  [1, "a"],
     * //  [1, "b"],
     * //  [2, "a"],
     * //  [2, "b"],
     * // ]
     * ```
     * @example
     * ```ts
     * import { ListCollection } from "@daiso-tech/core";;
     *
     * const collection = new ListCollection([1, 2]);
     * const matrix = collection.cross(["a", "b"]).cross(["I", "II"]);
     * await matrix.toArray();
     * // [
     * //  [1, "a", "I"],
     * //  [1, "a", "II"],
     * //  [1, "b", "I"],
     * //  [1, "b", "II"],
     * //  [2, "a", "I"],
     * //  [2, "a", "II"],
     * //  [2, "b", "I"],
     * //  [2, "b", "II"],
     * // ]
     * ```
     */
    crossJoin<TExtended>(
        iterable: AsyncIterableValue<TExtended>,
    ): IAsyncCollection<CrossJoinResult<TInput, TExtended>>;

    /**
     * The <i>zip</i> method merges together the values of <i>iterable</i> with the values of the collection at their corresponding index.
     * The returned collection has size of the shortest collection.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection(["Chair", "Desk"]);
     * const zipped = collection.zip([100, 200]);
     * await zipped.toArray();
     * // [["Chair", 100], ["Desk", 200]]
     * ```
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection(["Chair", "Desk", "Couch"]);
     * const zipped = collection.zip([100, 200]);
     * await zipped.toArray();
     * // [["Chair", 100], ["Desk", 200]]
     * ```
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection(["Chair", "Desk"]);
     * const zipped = collection.zip([100, 200, 300]);
     * await zipped.toArray();
     * // [["Chair", 100], ["Desk", 200]]
     * ```
     */
    zip<TExtended>(
        iterable: AsyncIterableValue<TExtended>,
    ): IAsyncCollection<RecordItem<TInput, TExtended>>;

    /**
     * The <i>sort</i> method sorts the collection. You can provide a <i>comparator</i> function.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([-1, 2, 4, 3]);
     * await collection.sort().toArray();
     * // [-1, 2, 3, 4]
     * ```
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([
     *   { name: "Anders", age: 30 },
     *   { name: "Joe", age: 20 },
     *   { name: "Hasan", age: 25 },
     *   { name: "Linda", age: 19 }
     * ]);
     * await collection.sort(({ age: ageA }, { age: ageB }) => ageA - ageB).toArray();
     * // [
     * //   { name: "Linda", age: 19 }
     * //   { name: "Joe", age: 20 },
     * //   { name: "Hasan", age: 25 },
     * //   { name: "Anders", age: 30 },
     * // ]
     * ```
     */
    sort(comparator?: Comparator<TInput>): IAsyncCollection<TInput>;

    /**
     * The <i>reverse</i> method will reverse the order of the collection.
     * The reversing of the collection will be applied in chunks that are the size of <i> chunkSize </i>.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([-1, 2, 4, 3]);
     * await collection.reverse().toArray();
     * // [3, 4, 2, -1]
     * ```
     */
    reverse(chunkSize?: number): IAsyncCollection<TInput>;

    /**
     * The <i>shuffle</i> method randomly shuffles the items in the collection. You can provide a custom Math.random function by passing in <i>mathRandom</i>.
     */
    shuffle(mathRandom?: () => number): IAsyncCollection<TInput>;

    /**
     * The <i>first</i> method returns the first item in the collection that passes <i> predicateFn </i>.
     * By default it will get the first item. If the collection is empty or no items passes <i> predicateFn </i> than null i returned.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.first();
     * // 1
     * ```
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.first(item => item > 2);
     * // 3
     * ```
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.first(item => item > 10);
     * // null
     * ```
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * // 3
     */
    first<TOutput extends TInput>(
        predicateFn?: AsyncPredicate<TInput, IAsyncCollection<TInput>, TOutput>,
    ): PromiseLike<TOutput | null>;

    /**
     * The <i>firstOr</i> method returns the first item in the collection that passes <i> predicateFn </i>
     * By default it will get the first item. If the collection is empty or no items passes <i> predicateFn </i> than <i> defaultValue </i>.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.firstOr(-1);
     * // 1
     * ```
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.firstOr(-1, item => item > 2);
     * // 3
     * ```
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.firstOr(-1, item => item > 10);
     * // -1
     * ```
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.firstOr(() => -1, item => item > 10);
     * // -1
     * ```
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     */
    firstOr<TOutput extends TInput, TExtended = TInput>(
        defaultValue: AsyncLazyable<TExtended>,
        predicateFn?: AsyncPredicate<TInput, IAsyncCollection<TInput>, TOutput>,
    ): PromiseLike<TOutput | TExtended>;

    /**
     * The <i>firstOrFail</i> method returns the first item in the collection that passes <i> predicateFn </i>.
     * By default it will get the first item. If the collection is empty or no items passes <i> predicateFn </i> than error is thrown.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.firstOrFail();
     * // 1
     * @example
     * ```
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.firstOrFail(item => item > 2);
     * // 3
     * @example
     * ```
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.firstOrFail(item => item > 10);
     * // throws an error
     * ```
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {ItemNotFoundCollectionError} {@link ItemNotFoundCollectionError}
     */
    firstOrFail<TOutput extends TInput>(
        predicateFn?: AsyncPredicate<TInput, IAsyncCollection<TInput>, TOutput>,
    ): PromiseLike<TOutput>;

    /**
     * The <i>last</i> method returns the last item in the collection that passes <i> predicateFn </i>.
     * By default it will get the last item. If the collection is empty or no items passes <i> predicateFn </i> than null i returned.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.last();
     * // 4
     * ```
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.last(item => item < 4);
     * // 3
     * ```
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.last(item => item > 10);
     * // null
     * ```
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * // 3
     */
    last<TOutput extends TInput>(
        predicateFn?: AsyncPredicate<TInput, IAsyncCollection<TInput>, TOutput>,
    ): PromiseLike<TOutput | null>;

    /**
     * The <i>lastOr</i> method returns the last item in the collection that passes <i> predicateFn </i>.
     * By default it will get the last item. If the collection is empty or no items passes <i> predicateFn </i> than <i> defaultValue </i>.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.lastOr(-1);
     * // 4
     * ```
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.lastOr(-1, item => item < 4);
     * // 3
     * ```
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.lastOr(-1, item => item > 10);
     * // -1
     * ```
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.lastOr(() => -1, item => item > 10);
     * // -1
     * ```
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     */
    lastOr<TOutput extends TInput, TExtended = TInput>(
        defaultValue: AsyncLazyable<TExtended>,
        predicateFn?: AsyncPredicate<TInput, IAsyncCollection<TInput>, TOutput>,
    ): PromiseLike<TOutput | TExtended>;

    /**
     * The <i>lastOrFail</i> method returns the last item in the collection that passes <i> predicateFn </i>.
     * By default it will get the last item. If the collection is empty or no items passes <i> predicateFn </i> than error is thrown.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.lastOrFail();
     * // 4
     * ```
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.lastOrFail(item => item < 4);
     * // 3
     * ```
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.lastOrFail(item => item > 10);
     * // throws an error
     * ```
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {ItemNotFoundCollectionError} {@link ItemNotFoundCollectionError}
     */
    lastOrFail<TOutput extends TInput>(
        predicateFn?: AsyncPredicate<TInput, IAsyncCollection<TInput>, TOutput>,
    ): PromiseLike<TOutput>;

    /**
     * The <i>before</i> method returns the item that comes before the first item that matches <i>predicateFn</i>.
     * If the <i>predicateFn</i> does not match or matches the first item then null is returned.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.before(item => item === 2);
     * // 1
     * ```
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.before(item => item === 1);
     * // null
     * ```
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     */
    before(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
    ): PromiseLike<TInput | null>;

    /**
     * The <i>beforeOr</i> method returns the item that comes before the first item that matches <i>predicateFn</i>.
     * If the collection is empty or the <i>predicateFn</i> does not match or matches the first item then <i>defaultValue</i> is returned.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.beforeOr(-1, item => item === 2);
     * // 1
     * ```
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.beforeOr(-1, item => item === 1);
     * // -1
     * ```
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.beforeOr(() => -1, item => item === 1);
     * // -1
     * ```
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     */
    beforeOr<TExtended = TInput>(
        defaultValue: AsyncLazyable<TExtended>,
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
    ): PromiseLike<TInput | TExtended>;

    /**
     * The <i>beforeOrFail</i> method returns the item that comes before the first item that matches <i>predicateFn</i>.
     * If the collection is empty or the <i>predicateFn</i> does not match or matches the first item then an error is thrown.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.beforeOrFail(item => item === 2);
     * // 1
     * ```
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.beforeOrFail(item => item === 1);
     * // error is thrown
     * ```
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {ItemNotFoundCollectionError} {@link ItemNotFoundCollectionError}
     */
    beforeOrFail(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
    ): PromiseLike<TInput>;

    /**
     * The <i>after</i> method returns the item that comes after the first item that matches <i>predicateFn</i>.
     * If the collection is empty or the <i>predicateFn</i> does not match or matches the last item then null is returned.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.after(item => item === 2);
     * // 3
     * ```
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.after(item => item === 4);
     * // null
     * ```
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     */
    after(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
    ): PromiseLike<TInput | null>;

    /**
     * The <i>afterOr</i> method returns the item that comes after the first item that matches <i>predicateFn</i>.
     * If the collection is empty or the <i>predicateFn</i> does not match or matches the last item then <i>defaultValue</i> is returned.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.afterOr(-1, item => item === 2);
     * // 3
     * ```
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.afterOr(-1, item => item === 4);
     * // -1
     * @example
     * ```
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.afterOr(() => -1, item => item === 4);
     * // -1
     * ```
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     */
    afterOr<TExtended = TInput>(
        defaultValue: AsyncLazyable<TExtended>,
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
    ): PromiseLike<TInput | TExtended>;

    /**
     * The <i>afterOrFail</i> method returns the item that comes after the first item that matches <i>predicateFn</i>.
     * If the collection is empty or the <i>predicateFn</i> does not match or matches the last item then an error is thrown.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.afterOrFail(item => item === 2);
     * // 3
     * ```
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.afterOrFail(item => item === 4);
     * // error is thrown
     * ```
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {ItemNotFoundCollectionError} {@link ItemNotFoundCollectionError}
     */
    afterOrFail(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
    ): PromiseLike<TInput>;

    /**
     * The <i>sole</i> method returns the first item in the collection that passes <i>predicateFn</i>, but only if <i>predicateFn</i> matches exactly one item.
     * If no items matches or multiple items are found an error will be thrown.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4, 5]);
     * await collection.sole(item => item === 4);
     * // 4
     * ```
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4, 4, 5]);
     * await collection.sole(item => item === 4);
     * // error is thrown
     * ```
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 5]);
     * await collection.sole(item => item === 4);
     * // error is thrown
     * ```
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {ItemNotFoundCollectionError} {@link ItemNotFoundCollectionError}
     * @throws {MultipleItemsFoundCollectionError} {@link MultipleItemsFoundCollectionError}
     */
    sole<TOutput extends TInput>(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>, TOutput>,
    ): PromiseLike<TOutput>;

    /**
     * The <i>nth</i> method creates a new collection consisting of every n-th item.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection(["a", "b", "c", "d", "e", "f"]).nth(4);
     * await collection.toArray();
     * // ["a", "e"]
     * ```
     */
    nth(step: number): IAsyncCollection<TInput>;

    /**
     * The <i>count</i> method returns the total number of items in the collection that passes <i>predicateFn</i>.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection([1, 2, 3, 4, 5, 6]);
     * await collection.count(value => value % 2 === 0);
     * // 3
     * ```
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     */
    count(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
    ): PromiseLike<number>;

    /**
     * The <i>size</i> returns the size of the collection.
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     */
    size(): PromiseLike<number>;

    /**
     * The <i>isEmpty</i> returns true if the collection is empty.
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     */
    isEmpty(): PromiseLike<boolean>;

    /**
     * The <i>isNotEmpty</i> returns true if the collection is not empty.
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     */
    isNotEmpty(): PromiseLike<boolean>;

    /**
     * The <i>searchFirst</i> return the index of the first item that matches <i>predicateFn</i>.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection(["a", "b", "b", "c"]);
     * await collection.searchFirst(item => item === "b");
     * // 1
     * ```
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     */
    searchFirst(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
    ): PromiseLike<number>;

    /**
     * The <i>searchLast</i> return the index of the last item that matches <i>predicateFn</i>.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * const collection = new AsyncIterableCollection(["a", "b", "b", "c"]);
     * await collection.searchLast(item => item === "b");
     * // 2
     * ```
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     */
    searchLast(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
    ): PromiseLike<number>;

    /**
     * The <i>forEach</i> method iterates through all items in the collection.
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     */
    forEach(
        callback: AsyncForEach<TInput, IAsyncCollection<TInput>>,
    ): PromiseLike<void>;

    /**
     * The <i>toArray</i> method converts the collection to a new array.
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     */
    toArray(): PromiseLike<TInput[]>;

    /**
     * The <i>delay</i> method will add delay between each iteration.
     * This method is especially useful for situations where you may be interacting with external APIs that rate limit incoming requests:
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * // An iterator that will fetch all users from a specific api
     * class ApiIterator implements AsyncIterable<IUser> { ... }
     * const apiIterator = new ApiIterator();
     * const collection = new AsyncIterableCollection(apiIterator);
     * await collection.delay(1000).forEach(user => console.log(user))
     * ```
     */
    delay(time: TimeSpan): IAsyncCollection<TInput>;

    /**
     * The <i>abort</i> method will abort iteration of the collection by passing <i>{@link AbortSignal}</i>.
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * // An iterator that will fetch all users from a specific api
     * class ApiIterator implements AsyncIterable<IUser> { ... }
     * const apiIterator = new ApiIterator();
     * const collection = new AsyncIterableCollection(apiIterator);
     * await collection.delay(1000).forEach(user => console.log(user))
     * ```
     */
    takeUntilAbort(
        abortSignal: AbortSignal,
        shouldThrow?: boolean,
    ): IAsyncCollection<TInput>;

    /**
     * The <I>timeout</i> method returns a new collection that will iterate values until the specified time.
     * After that time, the collection will then stop iterating:
     * @example
     * ```ts
     * import { AsyncIterableCollection } from "@daiso-tech/core";;
     *
     * class AsyncInfiniteIterable implements AsyncIterable<number> {
     *  async *[Symbol.asyncIterator]() {
     *      while(true) {
     *          yield 1;
     *      }
     *  }
     * }
     * const asyncInfiniteIterable = new AsyncInfiniteIterable();
     * const collection = new AsyncIterableCollection(asyncInfiniteIterable);
     * await collection
     *  .timeout(1000)
     *  .forEach(nbr => console.log(nbr))
     * ```
     */
    takeUntilTimeout(
        timeInMs: TimeSpan,
        shouldThrow?: boolean,
    ): IAsyncCollection<TInput>;
};
