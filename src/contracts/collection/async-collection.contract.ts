import {
    type SliceSettings,
    type SlidingSettings,
    type AsyncFilter,
    type AsyncFindOrSettings,
    type AsyncFindSettings,
    type AsyncForEach,
    type AsyncGroupBySettings,
    type AsyncLazyable,
    type AsyncMap,
    type AsyncModifier,
    type AsyncReduceSettings,
    type AsyncTap,
    type AsyncTransform,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type CollectionError,
    type Comparator,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type ItemNotFoundError,
    type JoinSettings,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type MultipleItemsFoundError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type IndexOverflowError,
    type PageSettings,
    type RecordItem,
    type ReverseSettings,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type UnexpectedCollectionError,
    type UpdatedItem,
} from "@/contracts/collection/_shared";
import { type EnsureType } from "@/types";

/**
 * @group Collections
 */
export type AsyncIterableValue<TInput> =
    | Iterable<TInput>
    | AsyncIterable<TInput>;
/**
 * @group Collections
 */
export type AsyncCollapse<TValue> = TValue extends
    | Array<infer TItem>
    | Iterable<infer TItem>
    | IAsyncCollection<infer TItem>
    ? TItem
    : TValue;

/**
 * IAsyncCollection is immutable and all the methods return new copies
 * @throws {CollectionError}
 * @throws {UnexpectedCollectionError}
 * @throws {IndexOverflowError}
 * @throws {ItemNotFoundError}
 * @throws {MultipleItemsFoundError}
 * @throws {TypeError}
 * @group Collections
 */
export type IAsyncCollection<TInput> = AsyncIterable<TInput> & {
    iterator(): AsyncIterator<TInput, void>;

    entries(
        throwOnNumberLimit?: boolean,
    ): IAsyncCollection<RecordItem<number, TInput>>;

    keys(throwOnNumberLimit?: boolean): IAsyncCollection<number>;

    values(): IAsyncCollection<TInput>;

    /**
     * The filter method filters the collection using the given callback, keeping only those items that pass a given truth test:
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4, 5, 6]);
     * const filtered = collection.filter(item => 2 < item && item < 5);
     * await filtered.toArray();
     * // [3, 4]
     */
    filter<TOutput extends TInput>(
        filter: AsyncFilter<TInput, IAsyncCollection<TInput>, TOutput>,
        throwOnNumberLimit?: boolean,
    ): IAsyncCollection<TOutput>;

    /**
     * The map method iterates through the collection and passes each value to the given callback.
     * The mapFunction is free to modify the item and return it, thus forming a new collection of modified items:
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4, 5]);
     * const mapped = collection.map(item => item * 2);
     * await mapped.toArray();
     * // [2, 4, 6, 8, 10]
     */
    map<TOutput>(
        map: AsyncMap<TInput, IAsyncCollection<TInput>, TOutput>,
        throwOnNumberLimit?: boolean,
    ): IAsyncCollection<TOutput>;

    reduce<TOutput = TInput>(
        settings: AsyncReduceSettings<
            TInput,
            IAsyncCollection<TInput>,
            TOutput
        >,
    ): Promise<TOutput>;

    /**
     * @throws {TypeError}
     */
    join(settings?: JoinSettings): Promise<string>;

    /**
     * The collapse method collapses a collection of arrays into a single, flat collection:
     * @example
     * const collection = new AsyncIterableCollection([[1, 2], [3, 4]]);
     * const collapsed = collection.collapse();
     * await collapsed.toArray();
     * // [1, 2, 3, 4]
     */
    collapse(): IAsyncCollection<AsyncCollapse<TInput>>;

    /**
     * The flatMap method returns a new array formed by applying a given callback function to each element of the array, and then collapses the result by one level.
     * It is identical to a map() followed by a collapse()
     * @example
     * const collection = new AsyncIterableCollection([["a", "b"], ["c", "d"]]).flatMap(item => [item.length, ...item]);
     * await collection.toArray();
     * // [2, "a", "b", 2, "c", "d"]
     */
    flatMap<TOutput>(
        map: AsyncMap<
            TInput,
            IAsyncCollection<TInput>,
            AsyncIterableValue<TOutput>
        >,
        throwOnNumberLimit?: boolean,
    ): IAsyncCollection<TOutput>;

    /**
     * The update method filters the collection using the given callback, keeping only those items that pass a given truth test and thereafter updates the filtered items:
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4, 5]);
     * const updateCollection = collection.update(item => item % 2 === 0, item => item * 2);
     * await updateCollection.toArray();
     * // [1, 4, 3, 8, 5]
     */
    update<TFilterOutput extends TInput, TMapOutput>(
        filter: AsyncFilter<TInput, IAsyncCollection<TInput>, TFilterOutput>,
        map: AsyncMap<TFilterOutput, IAsyncCollection<TInput>, TMapOutput>,
        throwOnNumberLimit?: boolean,
    ): IAsyncCollection<UpdatedItem<TInput, TFilterOutput, TMapOutput>>;

    /**
     * The page method returns a new collection containing the items that would be present on a given page number.
     * The method accepts the page number as its first argument and the number of items to show per page as its second argument:
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4, 5, 6, 7, 8, 9]);
     * const page = collection.page({
     *  page: 2,
     *  pageSize: 3
     * });
     * await page.toArray();
     * // [4, 5, 6]
     */
    page(settings: PageSettings): IAsyncCollection<TInput>;

    /**
     * The sum method returns the sum of all items in the collection. If the collection contains nested arrays or objects,
     * you should pass a map function that returns a number to be used in sum calculation.
     * You can only pass filter to filter out the items you want:
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3]);
     * await collection.sum();
     * // 6
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowError} {@link IndexOverflowError}
     * @throws {TypeError} {@link TypeError}
     */
    sum(throwOnNumberLimit?: boolean): Promise<EnsureType<TInput, number>>;

    /**
     * The average method returns the average of all items in the collection. If the collection contains nested arrays or objects,
     * you should pass a map function that returns a number to be used in average calculation.
     * You can only pass filter to filter out the items you want:
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3]);
     * await collection.average();
     * // 2
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowError} {@link IndexOverflowError}
     * @throws {TypeError} {@link TypeError}
     */
    average(throwOnNumberLimit?: boolean): Promise<EnsureType<TInput, number>>;

    /**
     * The median method returns the median of all items in the collection. If the collection contains nested arrays or objects,
     * you should pass a map function that returns a number to be used in median calculation.
     * You can only pass filter to filter out the items you want:
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3]);
     * await collection.median();
     * // 2
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowError} {@link IndexOverflowError}
     * @throws {TypeError} {@link TypeError}
     */
    median(throwOnNumberLimit?: boolean): Promise<EnsureType<TInput, number>>;

    /**
     * The min method returns the min of all items in the collection. If the collection contains nested arrays or objects,
     * you should pass a map function that returns a number to be used in min calculation.
     * You can only pass filter to filter out the items you want:
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3]);
     * await collection.min();
     * // 1
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {TypeError} {@link TypeError}
     */
    min(): Promise<EnsureType<TInput, number>>;

    /**
     * The max method returns the max of all items in the collection. If the collection contains nested arrays or objects,
     * you should pass a map function that returns a number to be used in max calculation.
     * You can only pass filter to filter out the items you want:
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3]);
     * await collection.max();
     * // 3
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {TypeError} {@link TypeError}
     */
    max(): Promise<EnsureType<TInput, number>>;

    /**
     * The percentage method may be used to quickly determine the percentage of items in the collection that pass a given truth test
     * @example
     * const collection = new AsyncIterableCollection([1, 1, 2, 2, 2, 3]);
     * await collection.percentage(value => value === 1);
     * // 33.333
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowError} {@link IndexOverflowError}
     */
    percentage(
        filter: AsyncFilter<TInput, IAsyncCollection<TInput>>,
        throwOnNumberLimit?: boolean,
    ): Promise<number>;

    /**
     * The some method determines whether the collection has a given item.
     * You must pass a closure to the some method to determine if an element exists in the collection matching a given truth test:
     * @example
     * const collection = new AsyncIterableCollection([0, 1, 2, 3, 4, 5]);
     * await collection.some(item => item === 1);
     * // true
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowError} {@link IndexOverflowError}
     */
    some<TOutput extends TInput>(
        filter: AsyncFilter<TInput, IAsyncCollection<TInput>, TOutput>,
        throwOnNumberLimit?: boolean,
    ): Promise<boolean>;

    /**
     * The every method may be used to verify that all elements of a collection pass a given truth test:
     * @example
     * const collection = new AsyncIterableCollection([0, 1, 2, 3, 4, 5]);
     * await collection.every(item => item < 6);
     * // true
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowError} {@link IndexOverflowError}
     */
    every<TOutput extends TInput>(
        filter: AsyncFilter<TInput, IAsyncCollection<TInput>, TOutput>,
        throwOnNumberLimit?: boolean,
    ): Promise<boolean>;

    /**
     * The take method returns items in the collection until the given callback returns true:
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
    take(limit: number, throwOnNumberLimit?: boolean): IAsyncCollection<TInput>;

    /**
     * The takeUntil method returns items in the collection until the given callback returns true:
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * const chunk = collection.takeUntil(item => item >= 3);
     * await chunk.toArray();
     * // [1, 2]
     */
    takeUntil(
        filter: AsyncFilter<TInput, IAsyncCollection<TInput>>,
        throwOnNumberLimit?: boolean,
    ): IAsyncCollection<TInput>;

    /**
     * The takeWhile method returns items in the collection until the given callback returns false:
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * const chunk = collection.takeWhile(item => item < 3);
     * await chunk.toArray();
     * // [1, 2]
     */
    takeWhile(
        filter: AsyncFilter<TInput, IAsyncCollection<TInput>>,
        throwOnNumberLimit?: boolean,
    ): IAsyncCollection<TInput>;

    /**
     * The skip method returns a new collection, with the given number of elements removed from the beginning of the collection:
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).skip(4);
     * await collection.toArray();
     * // [5, 6, 7, 8, 9, 10]
     */
    skip(
        offset: number,
        throwOnNumberLimit?: boolean,
    ): IAsyncCollection<TInput>;

    /**
     * The skipUntil method skips over items from the collection until the given callback returns true
     * and then returns the remaining items in the collection as a new collection instance:
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]).skipUntil(item => item >= 3);
     * await collection.toArray();
     * // [3, 4]
     */
    skipUntil(
        filter: AsyncFilter<TInput, IAsyncCollection<TInput>>,
        throwOnNumberLimit?: boolean,
    ): IAsyncCollection<TInput>;

    /**
     * The skipWhile method skips over items from the collection while the given callback returns false and then returns the remaining items in the collection as a new collection:
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]).skipWhile(item => item <= 3);
     * await collection.toArray();
     * // [4]
     */
    skipWhile(
        filter: AsyncFilter<TInput, IAsyncCollection<TInput>>,
        throwOnNumberLimit?: boolean,
    ): IAsyncCollection<TInput>;

    /**
     * The when method will execute the given callback when the first argument given to the method evaluates to true:
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
     * The whenEmpty method will execute the given callback when the collection is empty:
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
     * The whenNot method will execute the given callback when the first argument given to the method evaluates to false:
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
     * The whenNotEmpty method will execute the given callback when the collection is empty:
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
     * The pipe method passes the collection to the given closure and returns the result of the executed closure:
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3]);
     * const piped = await collection.pipe(collection => collection.sum());
     * // 6
     */
    pipe<TOutput = TInput>(
        callback: AsyncTransform<IAsyncCollection<TInput>, TOutput>,
    ): Promise<TOutput>;

    /**
     * The tap method passes the collection to the given callback, allowing you to "tap" into the collection at a specific point
     * and do something with the items while not affecting the collection itself.The collection is then returned by the tap method:
     * @example
     * const collection = await new AsyncIterableCollection([1, 2, 3, 4, 5, 6])
     *   .tap(collection => {
     *     collection
     *       .filter(value => value % 2 === 0)
     *       .forEach(value => console.log(value))
     *   })
     *   .toArray();
     * // [1, 2, 3, 4, 5, 6]
     */
    tap(callback: AsyncTap<IAsyncCollection<TInput>>): IAsyncCollection<TInput>;

    /**
     * The chunk method breaks the collection into multiple, smaller collections of a given size:
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4, 5, 6, 7]);
     * const chunks = collection.chunk(4);
     * await chunks.toArray();
     * // [[1, 2, 3, 4], [5, 6, 7]]
     */
    chunk(chunkSize: number): IAsyncCollection<IAsyncCollection<TInput>>;

    /**
     * The chunkWhile method breaks the collection into multiple, smaller collections based on the evaluation of the given callback.
     * The chunk variable passed to the closure may be used to inspect the previous element:
     * @example
     * const collection = new AsyncIterableCollection("AABBCCCD".split(""));
     * const chunks = collection.chunkWhile((value, index, chunk) => {
     *  return value === chunk.last();
     * });
     * await chunks.toArray();
     * //  [["A", "A"], ["B", "B"], ["C", "C", "C"], ["D"]]
     */
    chunkWhile(
        filter: AsyncFilter<TInput, IAsyncCollection<TInput>>,
        throwOnNumberLimit?: boolean,
    ): IAsyncCollection<IAsyncCollection<TInput>>;

    /**
     * The split method breaks a collection into the given number of groups:
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4, 5]);
     * const chunks = collection.split(3);
     * await chunks.toArray();
     * // [[1, 2], [3, 4], [5]]
     */
    split(
        chunkAmount: number,
        throwOnNumberLimit?: boolean,
    ): IAsyncCollection<IAsyncCollection<TInput>>;

    /**
     * The partition method is used to separate elements that pass a given truth test from those that do not:
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4, 5, 6]);
     * collection.partition(item => item < 3);
     * await collection.toArray();
     * // [[1, 2], [3, 4, 5, 6]]
     */
    partition(
        filter: AsyncFilter<TInput, IAsyncCollection<TInput>>,
        throwOnNumberLimit?: boolean,
    ): IAsyncCollection<IAsyncCollection<TInput>>;

    /**
     * The sliding method returns a new collection of chunks representing a "sliding window" view of the items in the collection:
     * @experimental
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4, 5]).sliding(2);
     * await collection.toArray();
     * // [[1, 2], [2, 3], [3, 4], [4, 5]]
     */
    sliding(
        settings: SlidingSettings,
    ): IAsyncCollection<IAsyncCollection<TInput>>;

    /**
     * The groupBy method groups the collection's items by a given map function:
     * @example
     * const collection = new AsyncIterableCollection(["a", "a", "a", "b", "b", "c"]);
     * const group = await collection
     *   .groupBy()
     *   .map(async ([key, value]) => [key, await  value.toArray()]).toArray();
     * // [["a", ["a", "a", "a"]], ["b", ["b", "b", "b"]], ["c", ["c"]]]
     * @example
     * const collection = new AsyncIterableCollection(["alice@gmail.com", "bob@yahoo.com", "carlos@gmail.com"]);
     * const group = await collection
     *   .groupBy(item => item.split("@")[1])
     *   .map(([key, value]) => [key, await value.toArray()]).toArray();
     * // [["gmail.com", ["alice@gmail.com", "carlos@gmail.com"]], ["yahoo.com", ["bob@yahoo.com"]]]
     */
    groupBy<TOutput = TInput>(
        settings?: AsyncGroupBySettings<
            TInput,
            IAsyncCollection<TInput>,
            TOutput
        >,
    ): IAsyncCollection<RecordItem<TOutput, IAsyncCollection<TInput>>>;

    /**
     * The countBy method counts the occurrences of values in the collection.
     * By default, the method counts the occurrences of every element, allowing you to count certain "types" of elements in the collection:
     * @example
     * const collection = new AsyncIterableCollection(["a", "a", "a", "b", "b", "c"]);
     * const count = await collection.countBy();
     * // [["a", 3], ["b", 2], ["c", 1]]
     * @example
     * const collection = new AsyncIterableCollection(["alice@gmail.com", "bob@yahoo.com", "carlos@gmail.com"]);
     * const count = await collection.countBy(item => item.split("@")[1])
     * // [["gmail.com", 2], ["yahoo.com", 1]]
     */
    countBy<TOutput = TInput>(
        settings?: AsyncGroupBySettings<
            TInput,
            IAsyncCollection<TInput>,
            TOutput
        >,
    ): IAsyncCollection<RecordItem<TOutput, number>>;

    /**
     * The unique method removes all duplicate values from the collection:
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
     * const unique = collection.unique(item => item.brand);
     * await unique.toArray();
     * // [
     *   { name: "iPhone 6", brand: "Apple", type: "phone" },
     *   { name: "Galaxy S6", brand: "Samsung", type: "phone" },
     * ]
     */
    unique<TOutput = TInput>(
        settings?: AsyncGroupBySettings<
            TInput,
            IAsyncCollection<TInput>,
            TOutput
        >,
    ): IAsyncCollection<TInput>;

    /**
     * The diff method will return the values in the original collection that are not present in the given iterable:
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4, 5]);
     * const difference = collection.difference([2, 4, 6, 8]);
     * await difference.toArray();
     * // [1, 3, 5]
     */
    difference<TOutput = TInput>(
        iterable: AsyncIterableValue<TInput>,
        map?: AsyncMap<TInput, IAsyncCollection<TInput>, TOutput>,
    ): IAsyncCollection<TInput>;

    /**
     * The repeat method will repat the current collection given amount
     * @example
     * const collection = new ListCollection([1, 2, 3]);
     * const newCollection = collection.repeat(3);
     * newCollection.toArray();
     * // [1, 2, 3,  1, 2, 3,  1, 2, 3]
     */
    repeat(amount: number): IAsyncCollection<TInput>;

    /**
     * The padStart method pads this collection with another item (multiple times, if needed) until the resulting collection reaches the given length.
     * The padding is applied from the start of this collection:
     * @example
     * new ListCollection("abc").padStart(10, "foo").join({ seperator: "" });
     * // "foofoofabc"
     *
     * new ListCollection("abc").padStart(6, "123465").join({ seperator: "" });
     * // "123abc"
     *
     * new ListCollection("abc").padStart(8, "0").join({ seperator: "" });
     * // "00000abc"
     *
     * new ListCollection("abc").padStart(1, "_").join({ seperator: "" });
     * // "abc"
     */
    padStart<TExtended = TInput>(
        maxLength: number,
        fillItems: AsyncIterableValue<TExtended>,
    ): IAsyncCollection<TInput | TExtended>;

    /**
     * The padEnd method pads this collection with another item (multiple times, if needed) until the resulting collection reaches the given length.
     * The padding is applied from the end of this collection:
     * @example
     * new ListCollection("abc").padEnd(10, "foo").join({ seperator: "" });
     * // "abcfoofoof"
     *
     * new ListCollection("abc").padEnd(6, "123465").join({ seperator: "" });
     * // "abc123"
     *
     * new ListCollection("abc").padEnd(8, "0").join({ seperator: "" });
     * // "abc00000"
     *
     * new ListCollection("abc").padEnd(1, "_").join({ seperator: "" });
     * // "abc"
     */
    padEnd<TExtended = TInput>(
        maxLength: number,
        fillItems: AsyncIterableValue<TExtended>,
    ): IAsyncCollection<TInput | TExtended>;

    /**
     * The slice is the same as Array.slice method. Se documentation on mdn:
     * @link {https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice}
     */
    slice(settings?: SliceSettings): IAsyncCollection<TInput>;

    /**
     * The prepend method adds items to the beginning of the collection:
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4, 5]).prepend([-1, 20]);
     * await collection.toArray();
     * // [-1, 20, 1, 2, 3, 4, 5]
     */
    prepend<TExtended = TInput>(
        iterable: AsyncIterableValue<TInput | TExtended>,
    ): IAsyncCollection<TInput | TExtended>;

    /**
     * The append method adds items to the end of the collection:
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4, 5]).append([-1, -2]);
     * await collection.toArray();
     * // [1, 2, 3, 4, 5, -1, -2,]
     */
    append<TExtended = TInput>(
        iterable: AsyncIterableValue<TInput | TExtended>,
    ): IAsyncCollection<TInput | TExtended>;

    /**
     * The insertBefore method adds items before a specific filtered item:
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 2, 3, 4, 5]).insertBefore(item => item === 2, [-1, 20]);
     * await collection.toArray();
     * // [1, -1, 20, 2, 2, 3, 4, 5]
     */
    insertBefore<TExtended = TInput>(
        filter: AsyncFilter<TInput, IAsyncCollection<TInput>>,
        iterable: AsyncIterableValue<TInput | TExtended>,
        throwOnNumberLimit?: boolean,
    ): IAsyncCollection<TInput | TExtended>;

    /**
     * The insertAfter method adds items after a specific filtered item:
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 2, 3, 4, 5]).insertAfter(item => item === 2, [-1, 20]);
     * await collection.toArray();
     * // [1, 2, -1, 20, 2, 3, 4, 5]
     */
    insertAfter<TExtended = TInput>(
        filter: AsyncFilter<TInput, IAsyncCollection<TInput>>,
        iterable: AsyncIterableValue<TInput | TExtended>,
        throwOnNumberLimit?: boolean,
    ): IAsyncCollection<TInput | TExtended>;

    /**
     * The crossJoin method cross joins the collection's values among the given arrays or collections, returning a Cartesian product with all possible permutations:
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
        ...iterables: Array<AsyncIterableValue<TExtended>>
    ): IAsyncCollection<IAsyncCollection<TInput | TExtended>>;

    /**
     * The zip method merges together the values of the given array with the values of the original collection at their corresponding index:
     * @example
     * const collection = new AsyncIterableCollection(["Chair", "Desk"]);
     * const zipped = collection.zip([100, 200]);
     * await zipped.toArray();
     * // [["Chari", 100], ["Desk", 200]]
     */
    zip<TExtended>(
        iterable: AsyncIterableValue<TExtended>,
    ): IAsyncCollection<RecordItem<TInput, TExtended>>;

    sort(compare?: Comparator<TInput>): IAsyncCollection<TInput>;

    reverse(settings?: ReverseSettings): IAsyncCollection<TInput>;

    shuffle(): IAsyncCollection<TInput>;

    /**
     * The first method returns the first element in the collection that passes a given truth test. By default it will get the first element:
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.first({ filter: item => item > 2 });
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowError} {@link IndexOverflowError}
     * // 3
     */
    first<TOutput extends TInput>(
        settings?: AsyncFindSettings<TInput, IAsyncCollection<TInput>, TOutput>,
    ): Promise<TOutput | null>;

    /**
     * The firstOr method is the same as first method but will return a provided default value if not found
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowError} {@link IndexOverflowError}
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
     * The firstOrFail method is the same as first method but will throw an Error if not found
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {ItemNotFoundError} {@link ItemNotFoundError}
     * @throws {IndexOverflowError} {@link IndexOverflowError}
     */
    firstOrFail<TOutput extends TInput>(
        settings?: AsyncFindSettings<TInput, IAsyncCollection<TInput>, TOutput>,
    ): Promise<TOutput>;

    /**
     * The last method returns the last element in the collection that passes a given truth test. By default it will get the last element:
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.last({ filter: item => item > 2 });
     * // 4
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowError} {@link IndexOverflowError}
     */
    last<TOutput extends TInput>(
        settings?: AsyncFindSettings<TInput, IAsyncCollection<TInput>, TOutput>,
    ): Promise<TOutput | null>;

    /**
     * The lastOr method is the same as last method but will return a provided default value if not found
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowError} {@link IndexOverflowError}
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
     * The lastOrFail method is the same as last method but will throw an Error if not found
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {ItemNotFoundError} {@link ItemNotFoundError}
     * @throws {IndexOverflowError} {@link IndexOverflowError}
     */
    lastOrFail<TOutput extends TInput>(
        settings?: AsyncFindSettings<TInput, IAsyncCollection<TInput>, TOutput>,
    ): Promise<TOutput>;

    /**
     * The before method is the opposite of the after method. It returns the item before the given item. null is returned if the given item is not found or is the first item:
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
     * @throws {IndexOverflowError} {@link IndexOverflowError}
     */
    before(
        filter: AsyncFilter<TInput, IAsyncCollection<TInput>>,
        throwOnNumberLimit?: boolean,
    ): Promise<TInput | null>;

    /**
     * The beforeOr method is the same as before method but will return a provided default value if not found
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowError} {@link IndexOverflowError}
     */
    beforeOr<TExtended = TInput>(
        defaultValue: AsyncLazyable<TExtended>,
        filter: AsyncFilter<TInput, IAsyncCollection<TInput>>,
        throwOnNumberLimit?: boolean,
    ): Promise<TInput | TExtended>;

    /**
     * The beforeOrFail method is the same as before method but will throw an Error if not found
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {ItemNotFoundError} {@link ItemNotFoundError}
     * @throws {IndexOverflowError} {@link IndexOverflowError}
     */
    beforeOrFail(
        filter: AsyncFilter<TInput, IAsyncCollection<TInput>>,
        throwOnNumberLimit?: boolean,
    ): Promise<TInput>;

    /**
     * The after method returns the item after the given item. null is returned if the given item is not found or is the last item:
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.after(item => item === 2);
     * // 3
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4]);
     * await collection.after(item => item === 4);
     * // null
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowError} {@link IndexOverflowError}
     */
    after(
        filter: AsyncFilter<TInput, IAsyncCollection<TInput>>,
        throwOnNumberLimit?: boolean,
    ): Promise<TInput | null>;

    /**
     * The afterOr method is the same as after method but will return a provided default value if not found
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowError} {@link IndexOverflowError}
     */
    afterOr<TExtended = TInput>(
        defaultValue: AsyncLazyable<TExtended>,
        filter: AsyncFilter<TInput, IAsyncCollection<TInput>>,
        throwOnNumberLimit?: boolean,
    ): Promise<TInput | TExtended>;

    /**
     * The afterOrFail method is the same as after method but will throw an Error if not found
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {ItemNotFoundError} {@link ItemNotFoundError}
     * @throws {IndexOverflowError} {@link IndexOverflowError}
     */
    afterOrFail(
        filter: AsyncFilter<TInput, IAsyncCollection<TInput>>,
        throwOnNumberLimit?: boolean,
    ): Promise<TInput>;

    /**
     * The sole method returns the first element in the collection that passes a given truth test, but only if the truth test matches exactly one element:
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4, 5]);
     * await collection.sole(item => item === 4);
     * // 4
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {ItemNotFoundError} {@link ItemNotFoundError}
     * @throws {MultipleItemsFoundError} {@link MultipleItemsFoundError}
     * @throws {IndexOverflowError} {@link IndexOverflowError}
     */
    sole<TOutput extends TInput>(
        filter: AsyncFilter<TInput, IAsyncCollection<TInput>, TOutput>,
        throwOnNumberLimit?: boolean,
    ): Promise<TOutput>;

    /**
     * The nth method creates a new collection consisting of every n-th element:
     * @example
     * const collection = new AsyncIterableCollection(["a", "b", "c", "d", "e", "f"]).nth(4);
     * await collection.toArray();
     * // ["a", "e"]
     */
    nth(step: number): IAsyncCollection<TInput>;

    delay(timeInMs: number): IAsyncCollection<TInput>;

    abort(signal: AbortSignal): IAsyncCollection<TInput>;

    timeout(timeInMs: number): IAsyncCollection<TInput>;

    /**
     * The count method returns the total number of items in the collection:
     * @example
     * const collection = new AsyncIterableCollection([1, 2, 3, 4, 5, 6]);
     * await collection.count(value => value % 2 === 0);
     * // 3
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowError} {@link IndexOverflowError}
     */
    count(
        filter: AsyncFilter<TInput, IAsyncCollection<TInput>>,
        throwOnNumberLimit?: boolean,
    ): Promise<number>;

    /**
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowError} {@link IndexOverflowError}
     */
    size(throwOnNumberLimit?: boolean): Promise<number>;

    /**
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowError} {@link IndexOverflowError}
     */
    empty(): Promise<boolean>;

    /**
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowError} {@link IndexOverflowError}
     */
    notEmpty(): Promise<boolean>;

    /**
     * The search method searches the collection for the given value and returns its index if found. If the item is not found, -1 is returned:
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowError} {@link IndexOverflowError}
     */
    search(
        filter: AsyncFilter<TInput, IAsyncCollection<TInput>>,
        throwOnNumberLimit?: boolean,
    ): Promise<number>;

    /**
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowError} {@link IndexOverflowError}
     */
    forEach(
        callback: AsyncForEach<TInput, IAsyncCollection<TInput>>,
        throwOnNumberLimit?: boolean,
    ): Promise<void>;

    /**
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowError} {@link IndexOverflowError}
     */
    toArray(): Promise<TInput[]>;
};
