import {
    type SliceSettings,
    type SlidingSettings,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type CollectionError,
    type Comparator,
    type Filter,
    type FindOrSettings,
    type FindSettings,
    type ForEach,
    type GroupBySettings,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type ItemNotFoundError,
    type JoinSettings,
    type Lazyable,
    type Map,
    type Modifier,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type MultipleItemsFoundError,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type IndexOverflowError,
    type PageSettings,
    type RecordItem,
    type ReduceSettings,
    type ReverseSettings,
    type Tap,
    type Transform,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type UnexpectedCollectionError,
    type UpdatedItem,
} from "@/contracts/collection/_shared";
import { type EnsureType } from "@/types";

/**
 * @group Collections
 */
export type Collapse<TValue> = TValue extends
    | Array<infer TItem>
    | Iterable<infer TItem>
    | ICollection<infer TItem>
    ? TItem
    : TValue;

/**
 * ICollection is immutable and all the methods return new copies
 * @throws {CollectionError}
 * @throws {UnexpectedCollectionError}
 * @throws {IndexOverflowError}
 * @throws {ItemNotFoundError}
 * @throws {MultipleItemsFoundError}
 * @throws {TypeError}
 * @group Collections
 */
export type ICollection<TInput> = Iterable<TInput> & {
    iterator(): Iterator<TInput, void>;

    entries(
        throwOnNumberLimit?: boolean,
    ): ICollection<RecordItem<number, TInput>>;

    keys(throwOnNumberLimit?: boolean): ICollection<number>;

    values(): ICollection<TInput>;

    /**
     * The filter method filters the collection using the given callback, keeping only those items that pass a given truth test:
     * @example
     * const collection = new ListCollection([1, 2, 3, 4, 5, 6]);
     * const filtered = collection.filter(item => 2 < item && item < 5);
     * filtered.toArray();
     * // [3, 4]
     */
    filter<TOutput extends TInput>(
        filter: Filter<TInput, ICollection<TInput>, TOutput>,
        throwOnNumberLimit?: boolean,
    ): ICollection<TOutput>;

    /**
     * The map method iterates through the collection and passes each value to the given callback.
     * The mapFunction is free to modify the item and return it, thus forming a new collection of modified items:
     * @example
     * const collection = new ListCollection([1, 2, 3, 4, 5]);
     * const mapped = collection.map(item => item * 2);
     * mapped.toArray();
     * // [2, 4, 6, 8, 10]
     */
    map<TOutput>(
        map: Map<TInput, ICollection<TInput>, TOutput>,
        throwOnNumberLimit?: boolean,
    ): ICollection<TOutput>;

    reduce<TOutput = TInput>(
        settings: ReduceSettings<TInput, ICollection<TInput>, TOutput>,
    ): TOutput;

    /**
     * @throws {TypeError}
     */
    join(settings?: JoinSettings): string;

    /**
     * The collapse method collapses a collection of arrays into a single, flat collection:
     * @example
     * const collection = new ListCollection([[1, 2], [3, 4]]);
     * const collapsed = collection.collapse();
     * collapsed.toArray();
     * // [1, 2, 3, 4]
     */
    collapse(): ICollection<Collapse<TInput>>;

    /**
     * The flatMap method returns a new array formed by applying a given callback function to each element of the array, and then collapses the result by one level.
     * It is identical to a map() followed by a collapse()
     * @example
     * const collection = new ListCollection([["a", "b"], ["c", "d"]]).flatMap(item => [item.length, ...item]);
     * collection.toArray();
     * // [2, "a", "b", 2, "c", "d"]
     */
    flatMap<TOutput>(
        map: Map<TInput, ICollection<TInput>, Iterable<TOutput>>,
        throwOnNumberLimit?: boolean,
    ): ICollection<TOutput>;

    /**
     * The update method filters the collection using the given callback, keeping only those items that pass a given truth test and thereafter updates the filtered items:
     * @example
     * const collection = new ListCollection([1, 2, 3, 4, 5]);
     * const updateCollection = collection.update(item => item % 2 === 0, item => item * 2);
     * updateCollection.toArray();
     * // [1, 4, 3, 8, 5]
     */
    update<TFilterOutput extends TInput, TMapOutput>(
        filter: Filter<TInput, ICollection<TInput>, TFilterOutput>,
        map: Map<TFilterOutput, ICollection<TInput>, TMapOutput>,
        throwOnNumberLimit?: boolean,
    ): ICollection<UpdatedItem<TInput, TFilterOutput, TMapOutput>>;

    /**
     * The page method returns a new collection containing the items that would be present on a given page number.
     * The method accepts the page number as its first argument and the number of items to show per page as its second argument:
     * @example
     * const collection = new ListCollection([1, 2, 3, 4, 5, 6, 7, 8, 9]);
     * const page = collection.page({
     *  page: 2,
     *  pageSize: 3
     * });
     * page.toArray();
     * // [4, 5, 6]
     */
    page(settings: PageSettings): ICollection<TInput>;

    /**
     * The sum method returns the sum of all items in the collection. If the collection contains nested arrays or objects,
     * you should pass a map function that returns a number to be used in sum calculation.
     * You can only pass filter to filter out the items you want:
     * @example
     * const collection = new ListCollection([1, 2, 3]);
     * collection.sum();
     * // 6
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {TypeError} {@link TypeError}
     */
    sum(): EnsureType<TInput, number>;

    /**
     * The average method returns the average of all items in the collection. If the collection contains nested arrays or objects,
     * you should pass a map function that returns a number to be used in average calculation.
     * You can only pass filter to filter out the items you want:
     * @example
     * const collection = new ListCollection([1, 2, 3]);
     * collection.average();
     * // 2
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {TypeError} {@link TypeError}
     */
    average(): EnsureType<TInput, number>;

    /**
     * The median method returns the median of all items in the collection. If the collection contains nested arrays or objects,
     * you should pass a map function that returns a number to be used in median calculation.
     * You can only pass filter to filter out the items you want:
     * @example
     * const collection = new ListCollection([1, 2, 3]);
     * collection.median();
     * // 2
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowError} {@link IndexOverflowError}
     * @throws {TypeError} {@link TypeError}
     */
    median(throwOnNumberLimit?: boolean): EnsureType<TInput, number>;

    /**
     * The min method returns the min of all items in the collection. If the collection contains nested arrays or objects,
     * you should pass a map function that returns a number to be used in min calculation.
     * You can only pass filter to filter out the items you want:
     * @example
     * const collection = new ListCollection([1, 2, 3]);
     * collection.min();
     * // 1
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {TypeError} {@link TypeError}
     */
    min(): EnsureType<TInput, number>;

    /**
     * The max method returns the max of all items in the collection. If the collection contains nested arrays or objects,
     * you should pass a map function that returns a number to be used in max calculation.
     * You can only pass filter to filter out the items you want:
     * @example
     * const collection = new ListCollection([1, 2, 3]);
     * collection.max();
     * // 3
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {TypeError} {@link TypeError}
     */
    max(): EnsureType<TInput, number>;

    /**
     * The percentage method may be used to quickly determine the percentage of items in the collection that pass a given truth test
     * @example
     * const collection = new ListCollection([1, 1, 2, 2, 2, 3]);
     * collection.percentage(value => value === 1);
     * // 33.333
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowError} {@link IndexOverflowError}
     */
    percentage(
        filter: Filter<TInput, ICollection<TInput>>,
        throwOnNumberLimit?: boolean,
    ): number;

    /**
     * The some method determines whether the collection has a given item.
     * You must pass a closure to the some method to determine if an element exists in the collection matching a given truth test:
     * @example
     * const collection = new ListCollection([0, 1, 2, 3, 4, 5]);
     * collection.some(item => item === 1);
     * // true
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowError} {@link IndexOverflowError}
     */
    some<TOutput extends TInput>(
        filter: Filter<TInput, ICollection<TInput>, TOutput>,
        throwOnNumberLimit?: boolean,
    ): boolean;

    /**
     * The every method may be used to verify that all elements of a collection pass a given truth test:
     * @example
     * const collection = new ListCollection([0, 1, 2, 3, 4, 5]);
     * collection.every(item => item < 6);
     * // true
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowError} {@link IndexOverflowError}
     */
    every<TOutput extends TInput>(
        filter: Filter<TInput, ICollection<TInput>, TOutput>,
        throwOnNumberLimit?: boolean,
    ): boolean;

    /**
     * The take method returns items in the collection until the given callback returns true:
     * @example
     * const collection = new ListCollection([0, 1, 2, 3, 4, 5]);
     * const chunk = collection.take(3);
     * chunk.toArray();
     * // [0, 1, 2]
     * @example
     * const collection = new ListCollection([0, 1, 2, 3, 4, 5]);
     * const chunk = collection.take(-2);
     * chunk.toArray();
     * // [4, 5]
     */
    take(limit: number, throwOnNumberLimit?: boolean): ICollection<TInput>;

    /**
     * The takeUntil method returns items in the collection until the given callback returns true:
     * @example
     * const collection = new ListCollection([1, 2, 3, 4]);
     * const chunk = collection.takeUntil(item => item >= 3);
     * chunk.toArray();
     * // [1, 2]
     */
    takeUntil(
        filter: Filter<TInput, ICollection<TInput>>,
        throwOnNumberLimit?: boolean,
    ): ICollection<TInput>;

    /**
     * The takeWhile method returns items in the collection until the given callback returns false:
     * @example
     * const collection = new ListCollection([1, 2, 3, 4]);
     * const chunk = collection.takeWhile(item => item < 3);
     * chunk.toArray();
     * // [1, 2]
     */
    takeWhile(
        filter: Filter<TInput, ICollection<TInput>>,
        throwOnNumberLimit?: boolean,
    ): ICollection<TInput>;

    /**
     * The skip method returns a new collection, with the given number of elements removed from the beginning of the collection:
     * @example
     * const collection = new ListCollection([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).skip(4);
     * collection.toArray();
     * // [5, 6, 7, 8, 9, 10]
     */
    skip(offset: number, throwOnNumberLimit?: boolean): ICollection<TInput>;

    /**
     * The skipUntil method skips over items from the collection until the given callback returns true
     * and then returns the remaining items in the collection as a new collection instance:
     * @example
     * const collection = new ListCollection([1, 2, 3, 4]).skipUntil(item => item >= 3);
     * collection.toArray();
     * // [3, 4]
     */
    skipUntil(
        filter: Filter<TInput, ICollection<TInput>>,
        throwOnNumberLimit?: boolean,
    ): ICollection<TInput>;

    /**
     * The skipWhile method skips over items from the collection while the given callback returns false and then returns the remaining items in the collection as a new collection:
     * @example
     * const collection = new ListCollection([1, 2, 3, 4]).skipWhile(item => item <= 3);
     * collection.toArray();
     * // [4]
     */
    skipWhile(
        filter: Filter<TInput, ICollection<TInput>>,
        throwOnNumberLimit?: boolean,
    ): ICollection<TInput>;

    /**
     * The when method will execute the given callback when the first argument given to the method evaluates to true:
     * @example
     * const collection = new ListCollection([1, 2, 3, 4])
     *  .when(true, collection => collection.append([-3]))
     *  .when(false, collection => collection.append([20]));
     * collection.toArray();
     * // [1, 2, 3, 4, -3]
     */
    when<TExtended = TInput>(
        condition: boolean,
        callback: Modifier<ICollection<TInput>, ICollection<TExtended>>,
    ): ICollection<TInput | TExtended>;

    /**
     * The whenEmpty method will execute the given callback when the collection is empty:
     * @example
     * const collection = new ListCollection([])
     *  .whenEmpty(collection => collection.append([-3]))
     * collection.toArray();
     * // [-3]
     * @example
     * const collection = new ListCollection([1])
     *  .whenEmpty(collection => collection.append([-3]))
     * collection.toArray();
     * // [1]
     */
    whenEmpty<TExtended = TInput>(
        callback: Modifier<ICollection<TInput>, ICollection<TExtended>>,
    ): ICollection<TInput | TExtended>;

    /**
     * The whenNot method will execute the given callback when the first argument given to the method evaluates to false:
     * @example
     * const collection = new ListCollection([1, 2, 3, 4])
     *  .whenNot(true, collection => collection.append([-3]))
     *  .whenNot(false, collection => collection.append([20]));
     * collection.toArray();
     * // [1, 2, 3, 4, 20]
     */
    whenNot<TExtended = TInput>(
        condition: boolean,
        callback: Modifier<ICollection<TInput>, ICollection<TExtended>>,
    ): ICollection<TInput | TExtended>;

    /**
     * The whenNotEmpty method will execute the given callback when the collection is empty:
     * @example
     * const collection = new ListCollection([])
     *  .whenNotEmpty(collection => collection.append([-3]))
     * collection.toArray();
     * // []
     * @example
     * const collection = new ListCollection([1])
     *  .whenNotEmpty(collection => collection.append([-3]))
     * collection.toArray();
     * // [1, -3]
     */
    whenNotEmpty<TExtended = TInput>(
        callback: Modifier<ICollection<TInput>, ICollection<TExtended>>,
    ): ICollection<TInput | TExtended>;

    /**
     * The pipe method passes the collection to the given closure and returns the result of the executed closure:
     * @example
     * const collection = new ListCollection([1, 2, 3]);
     * const piped = collection.pipe(collection => collection.sum());
     * // 6
     */
    pipe<TOutput = TInput>(
        callback: Transform<ICollection<TInput>, TOutput>,
    ): TOutput;

    /**
     * The tap method passes the collection to the given callback, allowing you to "tap" into the collection at a specific point
     * and do something with the items while not affecting the collection itself.The collection is then returned by the tap method:
     * @example
     * const collection = new ListCollection([1, 2, 3, 4, 5, 6])
     *   .tap(collection => {
     *     collection
     *       .filter(value => value % 2 === 0)
     *       .forEach(value => console.log(value))
     *   })
     *   .toArray();
     * // [1, 2, 3, 4, 5, 6]
     */
    tap(callback: Tap<ICollection<TInput>>): ICollection<TInput>;

    /**
     * The chunk method breaks the collection into multiple, smaller collections of a given size:
     * @example
     * const collection = new ListCollection([1, 2, 3, 4, 5, 6, 7]);
     * const chunks = collection.chunk(4);
     * chunks.toArray();
     * // [[1, 2, 3, 4], [5, 6, 7]]
     */
    chunk(chunkSize: number): ICollection<ICollection<TInput>>;

    /**
     * The chunkWhile method breaks the collection into multiple, smaller collections based on the evaluation of the given callback.
     * The chunk variable passed to the closure may be used to inspect the previous element:
     * @example
     * const collection = new ListCollection("AABBCCCD");
     * const chunks = collection.chunkWhile((value, index, chunk) => {
     *  return value === chunk.last();
     * });
     * chunks.toArray();
     * //  [["A", "A"], ["B", "B"], ["C", "C", "C"], ["D"]]
     */
    chunkWhile(
        filter: Filter<TInput, ICollection<TInput>>,
        throwOnNumberLimit?: boolean,
    ): ICollection<ICollection<TInput>>;

    /**
     * The split method breaks a collection into the given number of groups:
     * @example
     * const collection = new ListCollection([1, 2, 3, 4, 5]);
     * const chunks = collection.split(3);
     * chunks.toArray();
     * // [[1, 2], [3, 4], [5]]
     */
    split(
        chunkAmount: number,
        throwOnNumberLimit?: boolean,
    ): ICollection<ICollection<TInput>>;

    /**
     * The partition method is used to separate elements that pass a given truth test from those that do not:
     * @example
     * const collection = new ListCollection([1, 2, 3, 4, 5, 6]);
     * collection.partition(item => item < 3);
     * // [[1, 2], [3, 4, 5, 6]]
     */
    partition(
        filter: Filter<TInput, ICollection<TInput>>,
        throwOnNumberLimit?: boolean,
    ): ICollection<ICollection<TInput>>;

    /**
     * The sliding method returns a new collection of chunks representing a "sliding window" view of the items in the collection:
     * @experimental
     * @example
     * const collection = new ListCollection([1, 2, 3, 4, 5]).sliding(2);
     * collection.toArray();
     * // [[1, 2], [2, 3], [3, 4], [4, 5]]
     */
    sliding(settings: SlidingSettings): ICollection<ICollection<TInput>>;

    /**
     * The groupBy method groups the collection's items by a given map function:
     * @example
     * const collection = new ListCollection(["a", "a", "a", "b", "b", "c"]);
     * const group = collection
     *   .groupBy()
     *   .map(([key, value]) => [key, value.toArray()]);
     * // [["a", ["a", "a", "a"]], ["b", ["b", "b", "b"]], ["c", ["c"]]]
     * @example
     * const collection = new ListCollection(["alice@gmail.com", "bob@yahoo.com", "carlos@gmail.com"]);
     * const group = collection
     *   .groupBy(item => item.split("@")[1])
     *   .map(([key, value]) => [key, value.toArray()]);
     * // [["gmail.com", ["alice@gmail.com", "carlos@gmail.com"]], ["yahoo.com", ["bob@yahoo.com"]]]
     */
    groupBy<TOutput = TInput>(
        settings?: GroupBySettings<TInput, ICollection<TInput>, TOutput>,
    ): ICollection<RecordItem<TOutput, ICollection<TInput>>>;

    /**
     * The countBy method counts the occurrences of values in the collection.
     * By default, the method counts the occurrences of every element, allowing you to count certain "types" of elements in the collection:
     * @example
     * const collection = new ListCollection(["a", "a", "a", "b", "b", "c"]);
     * const count = collection.countBy();
     * // [["a", 3], ["b", 2], ["c", 1]]
     * @example
     * const collection = new ListCollection(["alice@gmail.com", "bob@yahoo.com", "carlos@gmail.com"]);
     * const count = collection.countBy(item => item.split("@")[1])
     * // [["gmail.com", 2], ["yahoo.com", 1]]
     */
    countBy<TOutput = TInput>(
        settings?: GroupBySettings<TInput, ICollection<TInput>, TOutput>,
    ): ICollection<RecordItem<TOutput, number>>;

    /**
     * The unique method removes all duplicate values from the collection:
     * @example
     * const collection = new ListCollection([1, 1, 2, 2, 3, 4, 2]);
     * collection.unique().toArray();
     * // [1, 2, 3, 4]
     * @example
     * const collection = new ListCollection([
     *   { name: "iPhone 6", brand: "Apple", type: "phone" },
     *   { name: "iPhone 5", brand: "Apple", type: "phone" },
     *   { name: "Apple Watch", brand: "Apple", type: "watch" },
     *   { name: "Galaxy S6", brand: "Samsung", type: "phone" },
     *   { name: "Galaxy Gear", brand: "Samsung", type: "watch" },
     * ]);
     * const unique = collection.unique(item => item.brand);
     * unique.toArray();
     * // [
     *   { name: "iPhone 6", brand: "Apple", type: "phone" },
     *   { name: "Galaxy S6", brand: "Samsung", type: "phone" },
     * ]
     */
    unique<TOutput = TInput>(
        settings?: GroupBySettings<TInput, ICollection<TInput>, TOutput>,
    ): ICollection<TInput>;

    /**
     * The diff method will return the values in the original collection that are not present in the given iterable:
     * @example
     * const collection = new ListCollection([1, 2, 3, 4, 5]);
     * const difference = collection.difference([2, 4, 6, 8]);
     * difference.toArray();
     * // [1, 3, 5]
     */
    difference<TOutput = TInput>(
        iterable: Iterable<TInput>,
        map?: Map<TInput, ICollection<TInput>, TOutput>,
    ): ICollection<TInput>;

    /**
     * The repeat method will repat the current collection given amount
     * @example
     * const collection = new ListCollection([1, 2, 3]);
     * const newCollection = collection.repeat(3);
     * newCollection.toArray();
     * // [1, 2, 3,  1, 2, 3,  1, 2, 3]
     */
    repeat(amount: number): ICollection<TInput>;

    /**
     * The padStart method pads this collection with another item (multiple times, if needed) until the resulting collection reaches the given length.
     * The padding is applied from the start of this collection:
     * @example
     * new ListCollection("abc").padStart(10, "foo").join({ seperator: ""});
     * // "foofoofabc"
     *
     * new ListCollection("abc").padStart(6, "123465").join({ seperator: ""});
     * // "123abc"
     *
     * new ListCollection("abc").padStart(8, "0").join({ seperator: ""});
     * // "00000abc"
     *
     * new ListCollection("abc").padStart(1, "_").join({ seperator: ""});
     * // "abc"
     */
    padStart<TExtended = TInput>(
        maxLength: number,
        fillItems: Iterable<TExtended>,
    ): ICollection<TInput | TExtended>;

    /**
     * The padEnd method pads this collection with another item (multiple times, if needed) until the resulting collection reaches the given length.
     * The padding is applied from the end of this collection:
     * @example
     * new ListCollection("abc").padEnd(10, "foo").join({ seperator: ""});
     * // "abcfoofoof"
     *
     * new ListCollection("abc").padEnd(6, "123465").join({ seperator: ""});
     * // "abc123"
     *
     * new ListCollection("abc").padEnd(8, "0").join({ seperator: ""});
     * // "abc00000"
     *
     * new ListCollection("abc").padEnd(1, "_").join({ seperator: ""});
     * // "abc"
     */
    padEnd<TExtended = TInput>(
        maxLength: number,
        fillItems: Iterable<TExtended>,
    ): ICollection<TInput | TExtended>;

    /**
     * The slice is the same as Array.slice method. Se documentation on mdn:
     * @link {https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice}
     */
    slice(settings?: SliceSettings): ICollection<TInput>;

    /**
     * The prepend method adds items to the beginning of the collection:
     * @example
     * const collection = new ListCollection([1, 2, 3, 4, 5]).prepend([-1, 20]);
     * collection.toArray();
     * // [-1, 20, 1, 2, 3, 4, 5]
     */
    prepend<TExtended = TInput>(
        iterable: Iterable<TInput | TExtended>,
    ): ICollection<TInput | TExtended>;

    /**
     * The append method adds items to the end of the collection:
     * @example
     * const collection = new ListCollection([1, 2, 3, 4, 5]).append([-1, -2]);
     * collection.toArray();
     * // [1, 2, 3, 4, 5, -1, -2,]
     */
    append<TExtended = TInput>(
        iterable: Iterable<TInput | TExtended>,
    ): ICollection<TInput | TExtended>;

    /**
     * The insertBefore method adds items before a specific filtered item:
     * @example
     * const collection = new ListCollection([1, 2, 2, 3, 4, 5]).insertBefore(item => item === 2, [-1, 20]);
     * collection.toArray();
     * // [1, -1, 20, 2, 2, 3, 4, 5]
     */
    insertBefore<TExtended = TInput>(
        filter: Filter<TInput, ICollection<TInput>>,
        iterable: Iterable<TInput | TExtended>,
        throwOnNumberLimit?: boolean,
    ): ICollection<TInput | TExtended>;

    /**
     * The insertAfter method adds items after a specific filtered item:
     * @example
     * const collection = new ListCollection([1, 2, 2, 3, 4, 5]).insertAfter(item => item === 2, [-1, 20]);
     * collection.toArray();
     * // [1, 2, -1, 20, 2, 3, 4, 5]
     */
    insertAfter<TExtended = TInput>(
        filter: Filter<TInput, ICollection<TInput>>,
        iterable: Iterable<TInput | TExtended>,
        throwOnNumberLimit?: boolean,
    ): ICollection<TInput | TExtended>;

    /**
     * The crossJoin method cross joins the collection's values among the given arrays or collections, returning a Cartesian product with all possible permutations:
     * @example
     * const collection = new ListCollection([1, 2]);
     * const matrix = collection.crossJoin(["a", "b"]);
     * matrix.map(collection => collection.toArray()).toArray();
     * // [
     * //  [1, "a"],
     * //  [1, "b"],
     * //  [2, "a"],
     * //  [2, "b"],
     * // ]
     * @example
     * const collection = new ListCollection([1, 2]);
     * const matrix = collection.crossJoin(["a", "b"], ["I", "II"]);
     * matrix.map(collection => collection.toArray()).toArray();
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
    ): ICollection<ICollection<TInput | TExtended>>;

    /**
     * The zip method merges together the values of the given array with the values of the original collection at their corresponding index:
     * @example
     * const collection = new ListCollection(["Chair", "Desk"]);
     * const zipped = collection.zip([100, 200]);
     * zipped.toArray();
     * // [["Chari", 100], ["Desk", 200]]
     */
    zip<TExtended>(
        iterable: Iterable<TExtended>,
    ): ICollection<RecordItem<TInput, TExtended>>;

    sort(compare?: Comparator<TInput>): ICollection<TInput>;

    reverse(settings?: ReverseSettings): ICollection<TInput>;

    shuffle(): ICollection<TInput>;

    /**
     * The first method returns the first element in the collection that passes a given truth test. By default it will get the first element:
     * @example
     * const collection = new ListCollection([1, 2, 3, 4]);
     * collection.first({ filter: item => item > 2 });
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowError} {@link IndexOverflowError}
     * // 3
     */
    first<TOutput extends TInput>(
        settings?: FindSettings<TInput, ICollection<TInput>, TOutput>,
    ): TOutput | null;

    /**
     * The firstOr method is the same as first method but will return a provided default value if not found
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowError} {@link IndexOverflowError}
     */
    firstOr<TOutput extends TInput, TExtended = TInput>(
        settings: FindOrSettings<
            TInput,
            ICollection<TInput>,
            TOutput,
            TExtended
        >,
    ): TOutput | TExtended;

    /**
     * The firstOrFail method is the same as first method but will throw an Error if not found
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {ItemNotFoundError} {@link ItemNotFoundError}
     * @throws {IndexOverflowError} {@link IndexOverflowError}
     */
    firstOrFail<TOutput extends TInput>(
        settings?: FindSettings<TInput, ICollection<TInput>, TOutput>,
    ): TOutput;

    /**
     * The last method returns the last element in the collection that passes a given truth test. By default it will get the last element:
     * @example
     * const collection = new ListCollection([1, 2, 3, 4]);
     * collection.last({ filter: item => item > 2 });
     * // 4
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowError} {@link IndexOverflowError}
     */
    last<TOutput extends TInput>(
        settings?: FindSettings<TInput, ICollection<TInput>, TOutput>,
    ): TOutput | null;

    /**
     * The lastOr method is the same as last method but will return a provided default value if not found
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowError} {@link IndexOverflowError}
     */
    lastOr<TOutput extends TInput, TExtended = TInput>(
        settings: FindOrSettings<
            TInput,
            ICollection<TInput>,
            TOutput,
            TExtended
        >,
    ): TOutput | TExtended;

    /**
     * The lastOrFail method is the same as last method but will throw an Error if not found
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {ItemNotFoundError} {@link ItemNotFoundError}
     * @throws {IndexOverflowError} {@link IndexOverflowError}
     */
    lastOrFail<TOutput extends TInput>(
        settings?: FindSettings<TInput, ICollection<TInput>, TOutput>,
    ): TOutput;

    /**
     * The before method is the opposite of the after method. It returns the item before the given item. null is returned if the given item is not found or is the first item:
     * @example
     * const collection = new ListCollection([1, 2, 3, 4]);
     * collection.before(item => item === 2);
     * // 1
     * @example
     * const collection = new ListCollection([1, 2, 3, 4]);
     * collection.before(item => item === 1);
     * // null
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowError} {@link IndexOverflowError}
     */
    before(
        filter: Filter<TInput, ICollection<TInput>>,
        throwOnNumberLimit?: boolean,
    ): TInput | null;

    /**
     * The beforeOr method is the same as before method but will return a provided default value if not found
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowError} {@link IndexOverflowError}
     */
    beforeOr<TExtended = TInput>(
        defaultValue: Lazyable<TExtended>,
        filter: Filter<TInput, ICollection<TInput>>,
        throwOnNumberLimit?: boolean,
    ): TInput | TExtended;

    /**
     * The beforeOrFail method is the same as before method but will throw an Error if not found
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {ItemNotFoundError} {@link ItemNotFoundError}
     * @throws {IndexOverflowError} {@link IndexOverflowError}
     */
    beforeOrFail(
        filter: Filter<TInput, ICollection<TInput>>,
        throwOnNumberLimit?: boolean,
    ): TInput;

    /**
     * The after method returns the item after the given item. null is returned if the given item is not found or is the last item:
     * @example
     * const collection = new ListCollection([1, 2, 3, 4]);
     * collection.after(item => item === 2);
     * // 3
     * @example
     * const collection = new ListCollection([1, 2, 3, 4]);
     * collection.after(item => item === 4);
     * // null
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowError} {@link IndexOverflowError}
     */
    after(
        filter: Filter<TInput, ICollection<TInput>>,
        throwOnNumberLimit?: boolean,
    ): TInput | null;

    /**
     * The afterOr method is the same as after method but will return a provided default value if not found
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowError} {@link IndexOverflowError}
     */
    afterOr<TExtended = TInput>(
        defaultValue: Lazyable<TExtended>,
        filter: Filter<TInput, ICollection<TInput>>,
        throwOnNumberLimit?: boolean,
    ): TInput | TExtended;

    /**
     * The afterOrFail method is the same as after method but will throw an Error if not found
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {ItemNotFoundError} {@link ItemNotFoundError}
     * @throws {IndexOverflowError} {@link IndexOverflowError}
     */
    afterOrFail(
        filter: Filter<TInput, ICollection<TInput>>,
        throwOnNumberLimit?: boolean,
    ): TInput;

    /**
     * The sole method returns the first element in the collection that passes a given truth test, but only if the truth test matches exactly one element:
     * @example
     * const collection = new ListCollection([1, 2, 3, 4, 5]);
     * collection.sole(item => item === 4);
     * // 4
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {ItemNotFoundError} {@link ItemNotFoundError}
     * @throws {MultipleItemsFoundError} {@link MultipleItemsFoundError}
     * @throws {IndexOverflowError} {@link IndexOverflowError}
     */
    sole<TOutput extends TInput>(
        filter: Filter<TInput, ICollection<TInput>, TOutput>,
        throwOnNumberLimit?: boolean,
    ): TOutput;

    /**
     * The nth method creates a new collection consisting of every n-th element:
     * @example
     * const collection = new ListCollection(["a", "b", "c", "d", "e", "f"]).nth(4);
     * collection.toArray();
     * // ["a", "e"]
     */
    nth(step: number): ICollection<TInput>;

    /**
     * The count method returns the total number of items in the collection:
     * @example
     * const collection = new ListCollection([1, 2, 3, 4, 5, 6]);
     * collection.count(value => value % 2 === 0);
     * // 3
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowError} {@link IndexOverflowError}
     */
    count(
        filter: Filter<TInput, ICollection<TInput>>,
        throwOnNumberLimit?: boolean,
    ): number;

    /**
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowError} {@link IndexOverflowError}
     */
    size(throwOnNumberLimit?: boolean): number;

    /**
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowError} {@link IndexOverflowError}
     */
    empty(): boolean;

    /**
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowError} {@link IndexOverflowError}
     */
    notEmpty(): boolean;

    /**
     * The search method searches the collection for the given value and returns its index if found. If the item is not found, -1 is returned:
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowError} {@link IndexOverflowError}
     */
    search(
        filter: Filter<TInput, ICollection<TInput>>,
        throwOnNumberLimit?: boolean,
    ): number;

    /**
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowError} {@link IndexOverflowError}
     */
    forEach(
        callback: ForEach<TInput, ICollection<TInput>>,
        throwOnNumberLimit?: boolean,
    ): void;

    /**
     * @throws {CollectionError} {@link CollectionError}
     * @throws {UnexpectedCollectionError} {@link UnexpectedCollectionError}
     * @throws {IndexOverflowError} {@link IndexOverflowError}
     */
    toArray(): TInput[];
};
