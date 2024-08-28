/**
 * @module Collections
 */

import {
    type SliceSettings,
    type SlidingSettings,
    type AsyncPredicate,
    type AsyncFindOrSettings,
    type AsyncFindSettings,
    type AsyncForEach,
    type AsyncGroupBySettings,
    type AsyncCountBySettings,
    type AsyncUniqueSettings,
    type AsyncMap,
    type AsyncModifier,
    type AsyncReduceSettings,
    type AsyncTap,
    type AsyncTransform,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type CollectionError,
    type Comparator,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type ItemNotFoundCollectionError,
    type JoinSettings,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type MultipleItemsFoundCollectionError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type IndexOverflowCollectionError,
    type PageSettings,
    type ReverseSettings,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type UnexpectedCollectionError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type TypeCollectionError,
    type UpdatedItem,
} from "@/contracts/collection/_shared";
import {
    type RecordItem,
    type AsyncLazyable,
    type EnsureType,
    type AsyncIterableValue,
} from "@/_shared/types";

export type AsyncCollapse<TValue> = TValue extends
    | Array<infer TItem>
    | Iterable<infer TItem>
    | IAsyncCollection<infer TItem>
    ? TItem
    : TValue;

/**
 * <i>IAsyncCollection</i> is immutable. The <i>throwOnIndexOverflow</i> parameter in the <i>ICollection</i> methods is used for preventing the index to overflow by throwing an error.
 * @throws {CollectionError}
 * @throws {UnexpectedCollectionError}
 * @throws {IndexOverflowCollectionError}
 * @throws {ItemNotFoundCollectionError}
 * @throws {MultipleItemsFoundCollectionError}
 * @throws {TypeCollectionError}
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
    entries(
        throwOnIndexOverflow?: boolean,
    ): IAsyncCollection<RecordItem<number, TInput>>;

    /**
     * The <i>keys</i> method returns an IAsyncCollection of keys in the collection.
     */
    keys(throwOnIndexOverflow?: boolean): IAsyncCollection<number>;

    /**
     * The <i>values</i> method returns a copy of the collection.
     */
    values(): IAsyncCollection<TInput>;

    /**
     * The <i>filter</i> method filters the collection using <i>predicateFn</i>, keeping only those items that pass <i>predicateFn</i>.
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4, 5, 6]);
     * const filtered = collection.filter(item => 2 < item && item < 5);
     * await filtered.toArray();
     * // [3, 4]
     */
    filter<TOutput extends TInput>(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>, TOutput>,
        throwOnIndexOverflow?: boolean,
    ): IAsyncCollection<TOutput>;

    /**
     * The <i>reject</i> method filters the collection using <i>predicateFn</i>, keeping only those items that not pass <i>predicateFn</i>.
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4, 5, 6]);
     * const filtered = collection.reject(item => 2 < item && item < 5);
     * await filtered.toArray();
     * // [1, 2, 5, 6]
     */
    reject<TOutput extends TInput>(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>, TOutput>,
        throwOnIndexOverflow?: boolean,
    ): IAsyncCollection<Exclude<TInput, TOutput>>;

    /**
     * The <i>map</i> method iterates through the collection and passes each item to <i>mapFn</i>.
     * The <i>mapFn</i> is free to modify the item and return it, thus forming a new collection of modified items.
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4, 5]);
     * const mapped = collection.map(item => item * 2);
     * await mapped.toArray();
     * // [2, 4, 6, 8, 10]
     */
    map<TOutput>(
        mapFn: AsyncMap<TInput, IAsyncCollection<TInput>, TOutput>,
        throwOnIndexOverflow?: boolean,
    ): IAsyncCollection<TOutput>;

    /**
     * The <i>reduce</i> method executes <i> {@link ReduceSettings | ReduceSettings.reduceFn} </i> function on each item of the array, passing in the return value from the calculation on the preceding item.
     * The final result of running the reducer across all items of the array is a single value.
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3]);
     * await collection.reduce({
     *   reduceFn: (sum, item) => sum + item
     * });
     * // 6
     * @example
     * const collection = new AsyncIterableCollection(["a", "b", "c"]);
     * await collection.entries().reduce({
     *   reduceFn: (record, [key, value]) => ({
     *     ...record,
     *     [key]: value
     *   }),
     *   initialValue: {} as Record<number, string>
     * });
     * // { 0: "a", 1: "b", 2: "c" }
     */
    reduce<TOutput = TInput>(
        settings: AsyncReduceSettings<
            TInput,
            IAsyncCollection<TInput>,
            TOutput
        >,
    ): Promise<TOutput>;

    /**
     * The <i>join</i> method joins the collection's items with {@link JoinSettings | JoinSettings.seperator}. An error will be thrown when if a none string item is encounterd.
     * @throws {TypeCollectionError}
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.map(item => item.toString()).join();
     * // "1,2,3,4"
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.map(item => item.toString()).join({
     *   seperator: "_"
     * });
     * // "1_2_3_4"
     */
    join(settings?: JoinSettings): Promise<EnsureType<TInput, string>>;

    /**
     * The <i>collapse</i> method collapses a collection of iterables into a single, flat collection.
     * @example
     * const collection = new AsyncIterableCollection([[1, 2], [3, 4]]);
     * const collapsed = collection.collapse();
     * await collapsed.toArray();
     * // [1, 2, 3, 4]
     */
    collapse(): IAsyncCollection<AsyncCollapse<TInput>>;

    /**
     * The <i>flatMap</i> method returns a new array formed by applying <i>mapFn</i> to each item of the array, and then collapses the result by one level.
     * It is identical to a <i>map</i> method followed by a <i>collapse</i> method.
     * @example
     * const collection = new AsyncIterableCollection([["a", "b"], ["c", "d"]]).flatMap(item => [item.length, ...item]);
     * await collection.toArray();
     * // [2, "a", "b", 2, "c", "d"]
     */
    flatMap<TOutput>(
        mapFn: AsyncMap<TInput, IAsyncCollection<TInput>, Iterable<TOutput>>,
        throwOnIndexOverflow?: boolean,
    ): IAsyncCollection<TOutput>;

    /**
     * The <i>update</i> method updates only the items that passes <i>predicateFn</i> using <i>mapFn</i>.
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4, 5]);
     * const updateCollection = collection.update(item => item % 2 === 0, item => item * 2);
     * await updateCollection.toArray();
     * // [1, 4, 3, 8, 5]
     */
    update<TFilterOutput extends TInput, TMapOutput>(
        predicateFn: AsyncPredicate<
            TInput,
            IAsyncCollection<TInput>,
            TFilterOutput
        >,
        mapFn: AsyncMap<TFilterOutput, IAsyncCollection<TInput>, TMapOutput>,
        throwOnIndexOverflow?: boolean,
    ): IAsyncCollection<UpdatedItem<TInput, TFilterOutput, TMapOutput>>;

    /**
     * The <i>page</i> method returns a new collection containing the items that would be present on <i>{@link PageSettings | PageSettings.page}</i> with custom <i>{@link PageSettings | PageSettings.pageSize}</i>.
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4, 5, 6, 7, 8, 9]);
     * const page = collection.page({
     *   page: 2,
     *   pageSize: 3
     * });
     * await page.toArray();
     * // [4, 5, 6]
     */
    page(settings: PageSettings): IAsyncCollection<TInput>;

    /**
     * The <i>sum</i> method returns the sum of all items in the collection. If the collection includes other than number items an error will be thrown.
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3]);
     * await collection.sum();
     * // 6
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {TypeCollectionError} {@link TypeCollectionError}
     */
    sum(): Promise<EnsureType<TInput, number>>;

    /**
     * The <i>average</i> method returns the average of all items in the collection. If the collection includes other than number items an error will be thrown.
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3]);
     * await collection.average();
     * // 2
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {TypeCollectionError} {@link TypeCollectionError}
     */
    average(): Promise<EnsureType<TInput, number>>;

    /**
     * The <i>median</i> method returns the median of all items in the collection. If the collection includes other than number items an error will be thrown.
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3]);
     * await collection.median();
     * // 2
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowCollectionError} {@link IndexOverflowCollectionError}
     * @throws {TypeCollectionError} {@link TypeCollectionError}
     */
    median(throwOnIndexOverflow?: boolean): Promise<EnsureType<TInput, number>>;

    /**
     * The <i>min</i> method returns the min of all items in the collection. If the collection includes other than number items an error will be thrown.
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3]);
     * await collection.min();
     * // 1
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {TypeCollectionError} {@link TypeCollectionError}
     */
    min(): Promise<EnsureType<TInput, number>>;

    /**
     * The <i>max</i> method returns the max of all items in the collection. If the collection includes other than number items an error will be thrown.
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3]);
     * await collection.max();
     * // 3
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {TypeCollectionError} {@link TypeCollectionError}
     */
    max(): Promise<EnsureType<TInput, number>>;

    /**
     * The <i>percentage</i> method may be used to quickly determine the percentage of items in the collection that pass <i>predicateFn</i>.
     * @example
     * const collection = new AsyncIterableCollection([1, 1, 2, 2, 2, 3]);
     * await collection.percentage(value => value === 1);
     * // 33.333
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowCollectionError} {@link IndexOverflowCollectionError}
     */
    percentage(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
        throwOnIndexOverflow?: boolean,
    ): Promise<number>;

    /**
     * The <i>some</i> method determines whether at least one item in the collection matches <i>predicateFn</i>.
     * @example
     * const collection = new AsyncIterableCollection([0, 1, 2, 3, 4, 5]);
     * await collection.some(item => item === 1);
     * // true
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowCollectionError} {@link IndexOverflowCollectionError}
     */
    some<TOutput extends TInput>(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>, TOutput>,
        throwOnIndexOverflow?: boolean,
    ): Promise<boolean>;

    /**
     * The <i>every</i> method determines whether all items in the collection matches <i>predicateFn</i>.
     * @example
     * const collection = new AsyncIterableCollection([0, 1, 2, 3, 4, 5]);
     * await collection.every(item => item < 6);
     * // true
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowCollectionError} {@link IndexOverflowCollectionError}
     */
    every<TOutput extends TInput>(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>, TOutput>,
        throwOnIndexOverflow?: boolean,
    ): Promise<boolean>;

    /**
     * The <i>take</i> method takes the first <i>limit</i> items.
     * @example
     * const collection = new AsyncIterableCollection([0, 1, 2, 3, 4, 5]);
     * const chunk = collection.take(3);
     * await chunk.toArray();
     * // [0, 1, 2]
     * @example
     * const collection = new AsyncIterableCollection([0, 1, 2, 3, 4, 5]);
     * const chunk = collection.take(-2);
     * await chunk.toArray();
     * // [4, 5]
     */
    take(
        limit: number,
        throwOnIndexOverflow?: boolean,
    ): IAsyncCollection<TInput>;

    /**
     * The <i>takeUntil</i> method takes items until <i>predicateFn</i> returns true.
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * const chunk = collection.takeUntil(item => item >= 3);
     * await chunk.toArray();
     * // [1, 2]
     */
    takeUntil(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
        throwOnIndexOverflow?: boolean,
    ): IAsyncCollection<TInput>;

    /**
     * The <i>takeWhile</i> method takes items until <i>predicateFn</i> returns false.
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * const chunk = collection.takeWhile(item => item < 4);
     * await chunk.toArray();
     * // [1, 2, 3]
     */
    takeWhile(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
        throwOnIndexOverflow?: boolean,
    ): IAsyncCollection<TInput>;

    /**
     * The <i>skip</i> method skips the first <i>offset</i> items.
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).skip(4);
     * await collection.toArray();
     * // [5, 6, 7, 8, 9, 10]
     */
    skip(
        offset: number,
        throwOnIndexOverflow?: boolean,
    ): IAsyncCollection<TInput>;

    /**
     * The <i>skipUntil</i> method skips items until <i>predicateFn</i> returns true.
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]).skipUntil(item => item >= 3);
     * await collection.toArray();
     * // [3, 4]
     */
    skipUntil(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
        throwOnIndexOverflow?: boolean,
    ): IAsyncCollection<TInput>;

    /**
     * The <i>skipWhile</i> method skips items until <i>predicateFn</i> returns false.
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]).skipWhile(item => item <= 3);
     * await collection.toArray();
     * // [4]
     */
    skipWhile(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
        throwOnIndexOverflow?: boolean,
    ): IAsyncCollection<TInput>;

    /**
     * The <i>when</i> method will execute <i>callback</i> when <i>condition</i> evaluates to true.
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4])
     *  .when(true, collection => collection.append([-3]))
     *  .when(false, collection => collection.append([20]));
     * await collection.toArray();
     * // [1, 2, 3, 4, -3]
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
     * const collection = new AsyncIterableCollection([])
     *  .whenEmpty(collection => collection.append([-3]))
     * await collection.toArray();
     * // [-3]
     * @example
     * const collection = new AsyncIterableCollection([1])
     *  .whenEmpty(collection => collection.append([-3]))
     * await collection.toArray();
     * // [1]
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
     * const collection = new AsyncIterableCollection([1, 2, 3, 4])
     *  .whenNot(true, collection => collection.append([-3]))
     *  .whenNot(false, collection => collection.append([20]));
     * await collection.toArray();
     * // [1, 2, 3, 4, 20]
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
     * const collection = new AsyncIterableCollection([])
     *  .whenNotEmpty(collection => collection.append([-3]))
     * await collection.toArray();
     * // []
     * @example
     * const collection = new AsyncIterableCollection([1])
     *  .whenNotEmpty(collection => collection.append([-3]))
     * await collection.toArray();
     * // [1, -3]
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
     * const collection = new AsyncIterableCollection([1, "2", "a", 1, 3, {}]);
     *
     * function toNbrs<TInput>(collection: IAsyncCollection<TInput>): IAsyncCollection<number> {
     *   return collection.map(item => Number(item)).reject(nbr => Number.isNaN(nbr)))
     * }
     * function nbrToStr(collection: IAsyncCollection<number>): IAsyncCollection<string> {
     *   return collection.map(nbr => String.fromCharCode(nbr)).repeat(2).join("_")
     * }
     *
     * const piped = await collection
     *   .pipe(toNbrs)
     *   .then(nbrToStr);
     * // "\x01_\x02_\x01_\x03_\x01_\x02_\x01_\x03"
     */
    pipe<TOutput = TInput>(
        callback: AsyncTransform<IAsyncCollection<TInput>, TOutput>,
    ): Promise<TOutput>;

    /**
     * The <i>tap</i> method passes a copy of the original collection to <i>callback</i>, allowing you to do something with the items while not affecting the original collection.
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4, 5, 6])
     *   .tap(collection => {
     *     collection
     *       .filter(value => value % 2 === 0)
     *       .forEach(value => console.log(value))
     *   });
     * await collection.toArray();
     * // [1, 2, 3, 4, 5, 6]
     */
    tap(callback: AsyncTap<IAsyncCollection<TInput>>): IAsyncCollection<TInput>;

    /**
     * The <i>chunk</i> method breaks the collection into multiple, smaller collections of size <i>chunkSize</i>.
     * If <i>chunkSize</i> is not divisible with total number of items then the last chunk will contain the remaining items.
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4, 5, 6, 7]);
     * const chunks = collection.chunk(4);
     * await chunks.toArray();
     * // [[1, 2, 3, 4], [5, 6, 7]]
     */
    chunk(chunkSize: number): IAsyncCollection<IAsyncCollection<TInput>>;

    /**
     * The <i>chunkWhile</i> method breaks the collection into multiple, smaller collections based on the evaluation of <i>predicateFn</i>.
     * The chunk variable passed to the <i>predicateFn</i> may be used to inspect the previous item.
     * @example
     * const collection = new AsyncIterableCollection("AABBCCCD");
     * const chunks = collection.chunkWhile((value, index, chunk) => {
     *  return value === chunk.last();
     * });
     * await chunks.toArray();
     * //  [["A", "A"], ["B", "B"], ["C", "C", "C"], ["D"]]
     */
    chunkWhile(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
        throwOnIndexOverflow?: boolean,
    ): IAsyncCollection<IAsyncCollection<TInput>>;

    /**
     * The <i>split</i> method breaks a collection evenly into <i>chunkAmount</i> of chunks.
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4, 5]);
     * const chunks = collection.split(3);
     * await chunks.toArray();
     * // [[1, 2], [3, 4], [5]]
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4, 5, 6]);
     * const chunks = collection.split(3);
     * await chunks.toArray();
     * // [[1, 2], [3, 4], [5, 6]]
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4, 5, 6, 7]);
     * const chunks = collection.split(3);
     * await chunks.toArray();
     * // [[1, 2, 7], [3, 4], [5, 6]]
     */
    split(
        chunkAmount: number,
        throwOnIndexOverflow?: boolean,
    ): IAsyncCollection<IAsyncCollection<TInput>>;

    /**
     * The <i>partition</i> method is used to separate items that pass <i>predicateFn</i> from those that do not.
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4, 5, 6]);
     * collection.partition(item => item < 3);
     * await collection.toArray();
     * // [[1, 2], [3, 4, 5, 6]]
     */
    partition(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
        throwOnIndexOverflow?: boolean,
    ): IAsyncCollection<IAsyncCollection<TInput>>;

    /**
     * The <i>sliding</i> method returns a new collection of chunks representing a "sliding window" view of the items in the collection.
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4, 5]).sliding(2);
     * await collection.toArray();
     * // [[1, 2], [2, 3], [3, 4], [4, 5]]
     */
    sliding(
        settings: SlidingSettings,
    ): IAsyncCollection<IAsyncCollection<TInput>>;

    /**
     * The <i>groupBy</i> method groups the collection's items by {@link GroupBySettings | GroupBySettings.selectFn}.
     * By default the equality check occurs on the item.
     * @example
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
     * @example
     * const collection = new AsyncIterableCollection(["alice@gmail.com", "bob@yahoo.com", "carlos@gmail.com"]);
     * const group = await collection
     *   .groupBy({
     *     selectFn: item => item.split("@")[1]
     *   })
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
     */
    groupBy<TOutput = TInput>(
        settings?: AsyncGroupBySettings<
            TInput,
            IAsyncCollection<TInput>,
            TOutput
        >,
    ): IAsyncCollection<RecordItem<TOutput, IAsyncCollection<TInput>>>;

    /**
     * The <i>countBy</i> method counts the occurrences of values in the collection by {@link CountBySettings | CountBySettings.selectFn}.
     * By default the equality check occurs on the item.
     * @example
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
     * @example
     * const collection = new AsyncIterableCollection(["alice@gmail.com", "bob@yahoo.com", "carlos@gmail.com"]);
     * const count = await collection
     *   .countBy({
     *     selectFn: item => item.split("@")[1]
     *   })
     *   .map(([key, collection]) => [key, collection.toArray()])
     *   .toArray();
     * // [
     * //   ["gmail.com", 2],
     * //   ["yahoo.com", 1]
     * // ]
     */
    countBy<TOutput = TInput>(
        settings?: AsyncCountBySettings<
            TInput,
            IAsyncCollection<TInput>,
            TOutput
        >,
    ): IAsyncCollection<RecordItem<TOutput, number>>;

    /**
     * The <i>unique</i> method removes all duplicate values from the collection by {@link UniqueSettings | UniqueSettings.selectFn}.
     * By default the equality check occurs on the item.
     * @example
     * const collection = new AsyncIterableCollection([1, 1, 2, 2, 3, 4, 2]);
     * await collection.unique().toArray();
     * // [1, 2, 3, 4]
     * @example
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
     */
    unique<TOutput = TInput>(
        settings?: AsyncUniqueSettings<
            TInput,
            IAsyncCollection<TInput>,
            TOutput
        >,
    ): IAsyncCollection<TInput>;

    /**
     * The <i>difference</i> method will return the values in the original collection that are not present in <i>iterable</i>.
     * By default the equality check occurs on the item.
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 2, 3, 4, 5]);
     * const difference = collection.difference([2, 4, 6, 8]);
     * await difference.toArray();
     * // [1, 3, 5]
     * @example
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
     */
    difference<TOutput = TInput>(
        iterable: AsyncIterableValue<TInput>,
        selectFn?: AsyncMap<TInput, IAsyncCollection<TInput>, TOutput>,
    ): IAsyncCollection<TInput>;

    /**
     * The <i>repeat</i> method will repeat the original collection <i>amount</i> times.
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3]);
     * const newCollection = collection.repeat(3);
     * await newCollection.toArray();
     * // [1, 2, 3,  1, 2, 3,  1, 2, 3]
     */
    repeat(amount: number): IAsyncCollection<TInput>;

    /**
     * The <i>padStart</i> method pads this collection with <i>fillItems</i> until the resulting collection size reaches <i>maxLength</i>.
     * The padding is applied from the start of this collection.
     * @example
     * const collection = new AsyncIterableCollection("abc").padStart(10, "foo");
     * await collection.join({ seperator: ""});
     * // "foofoofabc"
     * @example
     * const collection = new AsyncIterableCollection("abc").padStart(6, "123465");
     * await collection.join({ seperator: ""});
     * // "123abc"
     * @example
     * const collection = new AsyncIterableCollection("abc").padStart(8, "0");
     * await collection.join({ seperator: ""});
     * // "00000abc"
     * @example
     * const collection = new AsyncIterableCollection("abc").padStart(1, "_");
     * await collection.join({ seperator: ""});
     * // "abc"
     */
    padStart<TExtended = TInput>(
        maxLength: number,
        fillItems: Iterable<TExtended>,
    ): IAsyncCollection<TInput | TExtended>;

    /**
     * The <i>padEnd</i> method pads this collection with <i>fillItems</i> until the resulting collection size reaches <i>maxLength</i>.
     * The padding is applied from the end of this collection.
     * @example
     * const collection = new AsyncIterableCollection("abc").padEnd(10, "foo");
     * await collection.join({ seperator: ""});
     * // "abcfoofoof"
     * @example
     * const collection = new AsyncIterableCollection("abc").padEnd(6, "123465");
     * await collection.join({ seperator: ""});
     * // "abc123"
     * @example
     * const collection = new AsyncIterableCollection("abc").padEnd(8, "0");
     * await collection.join({ seperator: ""});
     * // "abc00000"
     * @example
     * const collection = new AsyncIterableCollection("abc").padEnd(1, "_");
     * await collection.join({ seperator: ""});
     * // "abc"
     */
    padEnd<TExtended = TInput>(
        maxLength: number,
        fillItems: Iterable<TExtended>,
    ): IAsyncCollection<TInput | TExtended>;

    /**
     * The <i>slice</i> method creates porition of the original collection selected from {@link SliceSettings | SliceSettings.start} and {@link SliceSettings | SliceSettings.end}
     * where {@link  SliceSettings | SliceSettings.start} and {@link SliceSettings | SliceSettings.end} (end not included) represent the index of items in the collection.
     * @example
     * const collection = new AsyncIterableCollection(["a", "b", "c", "d", "e", "f"]);
     * await collection.slice({
     *   start: 3
     * }).toArray();
     * // ["d", "e", "f"]
     * @example
     * const collection = new AsyncIterableCollection(["a", "b", "c", "d", "e", "f"]);
     * await collection.slice({
     *   end: 2,
     * }).toArray();
     * // ["a", "b"]
     * @example
     * const collection = new AsyncIterableCollection(["a", "b", "c", "d", "e", "f"]);
     * await collection.slice({
     *   start: 2
     *   end: 5,
     * }).toArray();
     * // ["c", "d", "e"]
     * @example
     * const collection = new AsyncIterableCollection(["a", "b", "c", "d", "e", "f"]);
     * await collection.slice({
     *   start: -2
     * }).toArray();
     * // ["e", "f"]
     * @example
     * const collection = new AsyncIterableCollection(["a", "b", "c", "d", "e", "f"]);
     * await collection.slice({
     *   end: -2
     * }).toArray();
     * // ["a", "b", "c", "d"]
     * @example
     * const collection = new AsyncIterableCollection(["a", "b", "c", "d", "e", "f"]);
     * await collection.slice({
     *   start: -4,
     *   end: -2
     * }).toArray();
     * // ["c", "d"]
     */
    slice(settings?: SliceSettings): IAsyncCollection<TInput>;

    /**
     * The <i>prepend</i> method adds <i>iterable</i> to the beginning of the collection.
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4, 5]).prepend([-1, 20]);
     * await collection.toArray();
     * // [-1, 20, 1, 2, 3, 4, 5]
     */
    prepend<TExtended = TInput>(
        iterable: AsyncIterableValue<TInput | TExtended>,
    ): IAsyncCollection<TInput | TExtended>;

    /**
     * The <i>append</i> method adds <i>iterable</i> to the end of the collection.
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4, 5]).append([-1, -2]);
     * await collection.toArray();
     * // [1, 2, 3, 4, 5, -1, -2,]
     */
    append<TExtended = TInput>(
        iterable: AsyncIterableValue<TInput | TExtended>,
    ): IAsyncCollection<TInput | TExtended>;

    /**
     * The <i>insertBefore</i> method adds <i>iterable</i> before the first item that matches <i>predicateFn</i>.
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 2, 3, 4, 5]).insertBefore(item => item === 2, [-1, 20]);
     * await collection.toArray();
     * // [1, -1, 20, 2, 2, 3, 4, 5]
     */
    insertBefore<TExtended = TInput>(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
        iterable: AsyncIterableValue<TInput | TExtended>,
        throwOnIndexOverflow?: boolean,
    ): IAsyncCollection<TInput | TExtended>;

    /**
     * The <i>insertAfter</i> method adds <i>iterable</i> after the first item that matches <i>predicateFn</i>.
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 2, 3, 4, 5]).insertAfter(item => item === 2, [-1, 20]);
     * await collection.toArray();
     * // [1, 2, -1, 20, 2, 3, 4, 5]
     */
    insertAfter<TExtended = TInput>(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
        iterable: AsyncIterableValue<TInput | TExtended>,
        throwOnIndexOverflow?: boolean,
    ): IAsyncCollection<TInput | TExtended>;

    /**
     * The <i>crossJoin</i> method cross joins the collection's values among <i>iterables</i>, returning a Cartesian product with all possible permutations.
     * @example
     * const collection = new AsyncIterableCollection([1, 2]);
     * const matrix = collection.crossJoin(["a", "b"]);
     * await matrix.map(collection => collection.toArray()).toArray();
     * // [
     * //  [1, "a"],
     * //  [1, "b"],
     * //  [2, "a"],
     * //  [2, "b"],
     * // ]
     * @example
     * const collection = new AsyncIterableCollection([1, 2]);
     * const matrix = collection.crossJoin(["a", "b"], ["I", "II"]);
     * await matrix.map(collection => collection.toArray()).toArray();
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
     */
    crossJoin<TExtended = TInput>(
        ...iterables: Array<Iterable<TExtended>>
    ): IAsyncCollection<IAsyncCollection<TInput | TExtended>>;

    /**
     * The <i>zip</i> method merges together the values of <i>iterable</i> with the values of the collection at their corresponding index.
     * The returned collection has size of the shortest collection.
     * @example
     * const collection = new AsyncIterableCollection(["Chair", "Desk"]);
     * const zipped = collection.zip([100, 200]);
     * await zipped.toArray();
     * // [["Chari", 100], ["Desk", 200]]
     * @example
     * const collection = new AsyncIterableCollection(["Chair", "Desk", "Couch"]);
     * const zipped = collection.zip([100, 200]);
     * await zipped.toArray();
     * // [["Chari", 100], ["Desk", 200]]
     * @example
     * const collection = new AsyncIterableCollection(["Chair", "Desk"]);
     * const zipped = collection.zip([100, 200, 300]);
     * await zipped.toArray();
     * // [["Chari", 100], ["Desk", 200]]
     */
    zip<TExtended>(
        iterable: AsyncIterableValue<TExtended>,
    ): IAsyncCollection<RecordItem<TInput, TExtended>>;

    /**
     * The <i>sort</i> method sorts the collection. You can provide a <i>comparator</i> function.
     * @example
     * const collection = new AsyncIterableCollection([-1, 2, 4, 3]);
     * await collection.sort().toArray();
     * // [-1, 2, 3, 4]
     * @example
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
     */
    sort(comparator?: Comparator<TInput>): IAsyncCollection<TInput>;

    /**
     * The <i>reverse</i> method will reverse the order of the collection.
     * The reversing of the collection will be applied in chunks that are the size of <i>{@link ReverseSettings | ReverseSettings.chunkSize}</i>.
     * @example
     * const collection = new AsyncIterableCollection([-1, 2, 4, 3]);
     * await collection.reverse().toArray();
     * // [3, 4, 2, -1]
     */
    reverse(settings?: ReverseSettings): IAsyncCollection<TInput>;

    /**
     * The <i>shuffle</i> method randomly shuffles the items in the collection.
     */
    shuffle(): IAsyncCollection<TInput>;

    /**
     * The <i>first</i> method returns the first item in the collection that passes <i>{@link FindSettings | FindSettings.predicateFn}</i>.
     * By default it will get the first item. If the collection is empty or no items passes <i>{@link FindSettings | FindSettings.predicateFn}</i> than null i returned.
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.first();
     * // 1
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.first({
     *   predicateFn: item => item > 2
     * });
     * // 3
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.first({
     *   predicateFn: item => item > 10
     * });
     * // null
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowCollectionError} {@link IndexOverflowCollectionError}
     * // 3
     */
    first<TOutput extends TInput>(
        settings?: AsyncFindSettings<TInput, IAsyncCollection<TInput>, TOutput>,
    ): Promise<TOutput | null>;

    /**
     * The <i>firstOr</i> method returns the first item in the collection that passes <i>{@link FindOrSettings | FindOrSettings.predicateFn}</i>
     * By default it will get the first item. If the collection is empty or no items passes <i>{@link FindOrSettings | FindOrSettings.predicateFn}</i> than  {@link FindOrSettings | FindOrSettings.defaultValue}.
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.firstOr({
     *   defaultValue: -1
     * });
     * // 1
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.firstOr({
     *   predicateFn: item => item > 2,
     *   defaultValue: -1
     * });
     * // 3
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.firstOr({
     *   predicateFn: item => item > 10,
     *   defaultValue: -1
     * });
     * // -1
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.firstOr({
     *   predicateFn: item => item > 10,
     *   defaultValue: () => -1
     * });
     * // -1
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowCollectionError} {@link IndexOverflowCollectionError}
     */
    firstOr<TOutput extends TInput, TExtended = TInput>(
        settings: AsyncFindOrSettings<
            TInput,
            IAsyncCollection<TInput>,
            TOutput,
            TExtended
        >,
    ): Promise<TOutput | TExtended>;

    /**
     * The <i>firstOrFail</i> method returns the first item in the collection that passes <i>{@link FindSettings | FindSettings.predicateFn}</i>.
     * By default it will get the first item. If the collection is empty or no items passes <i>{@link FindSettings | FindSettings.predicateFn}</i> than error is thrown.
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.firstOrFail();
     * // 1
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.firstOrFail({
     *   predicateFn: item => item > 2
     * });
     * // 3
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.firstOrFail({
     *   predicateFn: item => item > 10
     * });
     * // throws an error
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {ItemNotFoundCollectionError} {@link ItemNotFoundCollectionError}
     * @throws {IndexOverflowCollectionError} {@link IndexOverflowCollectionError}
     */
    firstOrFail<TOutput extends TInput>(
        settings?: AsyncFindSettings<TInput, IAsyncCollection<TInput>, TOutput>,
    ): Promise<TOutput>;

    /**
     * The <i>last</i> method returns the last item in the collection that passes <i>{@link FindSettings | FindSettings.predicateFn}</i>.
     * By default it will get the last item. If the collection is empty or no items passes <i>{@link FindSettings | FindSettings.predicateFn}</i> than null i returned.
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.last();
     * // 1
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.last({
     *   predicateFn: item => item > 2
     * });
     * // 3
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.last({
     *   predicateFn: item => item > 10
     * });
     * // null
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowCollectionError} {@link IndexOverflowCollectionError}
     * // 3
     */
    last<TOutput extends TInput>(
        settings?: AsyncFindSettings<TInput, IAsyncCollection<TInput>, TOutput>,
    ): Promise<TOutput | null>;

    /**
     * The <i>lastOr</i> method returns the last item in the collection that passes <i>{@link FindOrSettings | FindOrSettings.predicateFn}</i>.
     * By default it will get the last item. If the collection is empty or no items passes <i>{@link FindOrSettings | FindOrSettings.predicateFn}</i> than {@link FindOrSettings | FindOrSettings.defaultValue}.
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.lastOr({
     *   defaultValue: -1
     * });
     * // 1
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.lastOr({
     *   predicateFn: item => item > 2,
     *   defaultValue: -1
     * });
     * // 3
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.lastOr({
     *   predicateFn: item => item > 10,
     *   defaultValue: -1
     * });
     * // -1
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.lastOr({
     *   predicateFn: item => item > 10,
     *   defaultValue: () => -1
     * });
     * // -1
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowCollectionError} {@link IndexOverflowCollectionError}
     */
    lastOr<TOutput extends TInput, TExtended = TInput>(
        settings: AsyncFindOrSettings<
            TInput,
            IAsyncCollection<TInput>,
            TOutput,
            TExtended
        >,
    ): Promise<TOutput | TExtended>;

    /**
     * The <i>lastOrFail</i> method returns the last item in the collection that passes <i>{@link FindSettings | FindSettings.predicateFn}</i>.
     * By default it will get the last item. If the collection is empty or no items passes <i>{@link FindSettings | FindSettings.predicateFn}</i> than error is thrown.
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.lastOrFail();
     * // 1
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.lastOrFail({
     *   predicateFn: item => item > 2
     * });
     * // 3
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.lastOrFail({
     *   predicateFn: item => item > 10
     * });
     * // throws an error
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {ItemNotFoundCollectionError} {@link ItemNotFoundCollectionError}
     * @throws {IndexOverflowCollectionError} {@link IndexOverflowCollectionError}
     */
    lastOrFail<TOutput extends TInput>(
        settings?: AsyncFindSettings<TInput, IAsyncCollection<TInput>, TOutput>,
    ): Promise<TOutput>;

    /**
     * The <i>before</i> method returns the item that comes before the first item that matches <i>predicateFn</i>.
     * If the <i>predicateFn</i> does not match or matches the first item then null is returned.
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.before(item => item === 2);
     * // 1
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.before(item => item === 1);
     * // null
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowCollectionError} {@link IndexOverflowCollectionError}
     */
    before(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
        throwOnIndexOverflow?: boolean,
    ): Promise<TInput | null>;

    /**
     * The <i>beforeOr</i> method returns the item that comes before the first item that matches <i>predicateFn</i>.
     * If the collection is empty or the <i>predicateFn</i> does not match or matches the first item then <i>defaultValue</i> is returned.
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.beforeOr(-1, item => item === 2);
     * // 1
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.beforeOr(-1, item => item === 1);
     * // -1
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.beforeOr(() => -1, item => item === 1);
     * // -1
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowCollectionError} {@link IndexOverflowCollectionError}
     */
    beforeOr<TExtended = TInput>(
        defaultValue: AsyncLazyable<TExtended>,
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
        throwOnIndexOverflow?: boolean,
    ): Promise<TInput | TExtended>;

    /**
     * The <i>beforeOrFail</i> method returns the item that comes before the first item that matches <i>predicateFn</i>.
     * If the collection is empty or the <i>predicateFn</i> does not match or matches the first item then an error is thrown.
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.beforeOrFail(item => item === 2);
     * // 1
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.beforeOrFail(item => item === 1);
     * // error is thrown
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {ItemNotFoundCollectionError} {@link ItemNotFoundCollectionError}
     * @throws {IndexOverflowCollectionError} {@link IndexOverflowCollectionError}
     */
    beforeOrFail(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
        throwOnIndexOverflow?: boolean,
    ): Promise<TInput>;

    /**
     * The <i>after</i> method returns the item that comes after the first item that matches <i>predicateFn</i>.
     * If the collection is empty or the <i>predicateFn</i> does not match or matches the last item then null is returned.
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.after(item => item === 2);
     * // 1
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.after(item => item === 1);
     * // null
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowCollectionError} {@link IndexOverflowCollectionError}
     */
    after(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
        throwOnIndexOverflow?: boolean,
    ): Promise<TInput | null>;

    /**
     * The <i>afterOr</i> method returns the item that comes after the first item that matches <i>predicateFn</i>.
     * If the collection is empty or the <i>predicateFn</i> does not match or matches the last item then <i>defaultValue</i> is returned.
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.afterOr(-1, item => item === 2);
     * // 1
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.afterOr(-1, item => item === 1);
     * // -1
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.afterOr(() => -1, item => item === 1);
     * // -1
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowCollectionError} {@link IndexOverflowCollectionError}
     */
    afterOr<TExtended = TInput>(
        defaultValue: AsyncLazyable<TExtended>,
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
        throwOnIndexOverflow?: boolean,
    ): Promise<TInput | TExtended>;

    /**
     * The <i>afterOrFail</i> method returns the item that comes after the first item that matches <i>predicateFn</i>.
     * If the collection is empty or the <i>predicateFn</i> does not match or matches the last item then an error is thrown.
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.afterOrFail(item => item === 2);
     * // 1
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.afterOrFail(item => item === 1);
     * // error is thrown
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {ItemNotFoundCollectionError} {@link ItemNotFoundCollectionError}
     * @throws {IndexOverflowCollectionError} {@link IndexOverflowCollectionError}
     */
    afterOrFail(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
        throwOnIndexOverflow?: boolean,
    ): Promise<TInput>;

    /**
     * The <i>sole</i> method returns the first item in the collection that passes <i>predicateFn</i>, but only if <i>predicateFn</i> matches exactly one item.
     * If no items matches or multiple items are found an error will be thrown.
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4, 5]);
     * await collection.sole(item => item === 4);
     * // 4
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {ItemNotFoundCollectionError} {@link ItemNotFoundCollectionError}
     * @throws {MultipleItemsFoundCollectionError} {@link MultipleItemsFoundCollectionError}
     * @throws {IndexOverflowCollectionError} {@link IndexOverflowCollectionError}
     */
    sole<TOutput extends TInput>(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>, TOutput>,
        throwOnIndexOverflow?: boolean,
    ): Promise<TOutput>;

    /**
     * The <i>nth</i> method creates a new collection consisting of every n-th item.
     * @example
     * const collection = new AsyncIterableCollection(["a", "b", "c", "d", "e", "f"]).nth(4);
     * await collection.toArray();
     * // ["a", "e"]
     */
    nth(step: number): IAsyncCollection<TInput>;

    /**
     * The <i>count</i> method returns the total number of items in the collection that passes <i>predicateFn</i>.
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4, 5, 6]);
     * await collection.count(value => value % 2 === 0);
     * // 3
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowCollectionError} {@link IndexOverflowCollectionError}
     */
    count(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
        throwOnIndexOverflow?: boolean,
    ): Promise<number>;

    /**
     * The <i>size</i> returns the size of the collection.
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowCollectionError} {@link IndexOverflowCollectionError}
     */
    size(throwOnIndexOverflow?: boolean): Promise<number>;

    /**
     * The <i>isEmpty</i> returns true if the collection is empty.
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowCollectionError} {@link IndexOverflowCollectionError}
     */
    isEmpty(): Promise<boolean>;

    /**
     * The <i>isNotEmpty</i> returns true if the collection is not empty.
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowCollectionError} {@link IndexOverflowCollectionError}
     */
    isNotEmpty(): Promise<boolean>;

    /**
     * The <i>searchFirst</i> return the index of the first item that matches <i>predicateFn</i>.
     * @example
     * const collection = new AsyncIterableCollection(["a", "b", "b", "c"]);
     * await collection.searchFirst(item => item === "b");
     * // 1
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowCollectionError} {@link IndexOverflowCollectionError}
     */
    searchFirst(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
        throwOnIndexOverflow?: boolean,
    ): Promise<number>;

    /**
     * The <i>searchLast</i> return the index of the last item that matches <i>predicateFn</i>.
     * @example
     * const collection = new AsyncIterableCollection(["a", "b", "b", "c"]);
     * await collection.searchLast(item => item === "b");
     * // 2
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowCollectionError} {@link IndexOverflowCollectionError}
     */
    searchLast(
        predicateFn: AsyncPredicate<TInput, IAsyncCollection<TInput>>,
        throwOnIndexOverflow?: boolean,
    ): Promise<number>;

    /**
     * The <i>forEach</i> method iterates through all items in the collection.
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowCollectionError} {@link IndexOverflowCollectionError}
     */
    forEach(
        callback: AsyncForEach<TInput, IAsyncCollection<TInput>>,
        throwOnIndexOverflow?: boolean,
    ): Promise<void>;

    /**
     * The <i>toArray</i> method converts the collection to a new array.
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowCollectionError} {@link IndexOverflowCollectionError}
     */
    toArray(): Promise<TInput[]>;

    /**
     * The delay method will delay collection such that each value is returned after the specified number of seconds.
     * This method is especially useful for situations where you may be interacting with external APIs that rate limit incoming requests:
     * @example
     * // An iterator that will fetch all users from a specific api
     * class ApiIterator implements AsyncIterable<IUser> { ... }
     * const apiIterator = new ApiIterator();
     * const collection = new AsyncIterableCollection(apiIterator);
     * await collection.delay(1000).forEach(user => console.log(user))
     */
    delay(timeInMs: number): IAsyncCollection<TInput>;

    abort(signal: AbortSignal): IAsyncCollection<TInput>;

    /**
     * The timeout method returns a new collection that will iterate values until the specified time.
     * After that time, the collection will then stop iterating:
     * @example
     * class AsyncInfiniteIterable implements AsyncIterable<number> {
     *  async *[Symbol.asyncIterator]() {
     *      while(true) {
     *          yield 1;
     *      }
     *  }
     * }
     * const asyncInfiniteIterable = new AsyncInfiniteIterable();
     * const collection = new AsyncIterableCollection(asyncInfiniteIterable);
     * collection
     *  .timeout(1000)
     *  .forEach(nbr => console.log(nbr))
     */
    timeout(timeInMs: number): IAsyncCollection<TInput>;
};
