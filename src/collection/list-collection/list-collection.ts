import { isIterable } from "@/collection/_shared";
import {
    type Collapse,
    CollectionError,
    type Comparator,
    type Filter,
    type FindOrSettings,
    type FindSettings,
    type ForEach,
    type GroupBySettings,
    type ICollection,
    ItemNotFoundError,
    type JoinSettings,
    type Lazyable,
    type Map,
    type Modifier,
    MultipleItemsFoundError,
    type PageSettings,
    type RecordItem,
    type ReduceSettings,
    type ReverseSettings,
    type SliceSettings,
    type SlidingSettings,
    type Tap,
    type Transform,
    UnexpectedCollectionError,
    type UpdatedItem,
} from "@/contracts/collection/_module";
import { EnsureType } from "@/types";

/**
 * All methods in ListCollection are eager and therefore will run immediately.
 * @group Collections
 */
export class ListCollection<TInput> implements ICollection<TInput> {
    private array: TInput[];

    constructor(iterable: Iterable<TInput> = []) {
        this.array = [...iterable];
    }

    *[Symbol.iterator](): Iterator<TInput> {
        yield* this.array;
    }

    iterator(): Iterator<TInput, void> {
        return this[Symbol.iterator]() as Iterator<TInput, void>;
    }

    entries(
        _throwOnNumberLimit?: boolean,
    ): ICollection<RecordItem<number, TInput>> {
        try {
            return new ListCollection(this.array.entries());
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    keys(_throwOnNumberLimit?: boolean): ICollection<number> {
        try {
            return new ListCollection(this.array.keys());
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    values(): ICollection<TInput> {
        return new ListCollection(this);
    }

    filter<TOutput extends TInput>(
        filter: Filter<TInput, ICollection<TInput>, TOutput>,
        _throwOnNumberLimit?: boolean,
    ): ICollection<TOutput> {
        try {
            return new ListCollection(
                this.array.filter((item, index) =>
                    filter(item, index, this),
                ) as TOutput[],
            );
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    map<TOutput>(
        map: Map<TInput, ICollection<TInput>, TOutput>,
        _throwOnNumberLimit?: boolean,
    ): ICollection<TOutput> {
        try {
            return new ListCollection(
                this.array.map((item, index) => map(item, index, this)),
            );
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    reduce<TOutput = TInput>(
        settings: ReduceSettings<TInput, ICollection<TInput>, TOutput>,
    ): TOutput {
        try {
            if (settings.initialValue === undefined && this.empty()) {
                throw new TypeError(
                    "Reduce of empty array must be inputed a initial value",
                );
            }
            if (settings.initialValue !== undefined) {
                return this.array.reduce<TOutput>(
                    (initialValue, item, index) =>
                        settings.reduceFn(initialValue, item, index, this),
                    settings.initialValue,
                );
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return this.array.reduce((initialValue, item, index) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
                const reduce = settings.reduceFn as any;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
                return reduce(initialValue, item, index, this);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            }) as any;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    join(settings?: JoinSettings): string {
        try {
            return this.reduce({
                reduceFn(str, item) {
                    if (typeof item !== "string") {
                        throw new TypeError(
                            "Item type is invalid must be string",
                        );
                    }
                    const separator = settings?.seperator ?? ",";
                    return str + separator + item;
                },
            });
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    collapse(): ICollection<Collapse<TInput>> {
        const items: TInput[] = [];
        try {
            for (const item of this.array) {
                if (isIterable<TInput>(item)) {
                    items.push(...items);
                } else {
                    items.push(item);
                }
            }
            return new ListCollection(items as Collapse<TInput>[]);
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    flatMap<TOutput>(
        map: Map<TInput, ICollection<TInput>, Iterable<TOutput>>,
        _throwOnNumberLimit?: boolean,
    ): ICollection<TOutput> {
        try {
            return new ListCollection(
                this.array.flatMap((item, index) => [
                    ...map(item, index, this),
                ]),
            );
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    update<TFilterOutput extends TInput, TMapOutput>(
        filter: Filter<TInput, ICollection<TInput>, TFilterOutput>,
        map: Map<TFilterOutput, ICollection<TInput>, TMapOutput>,
        _throwOnNumberLimit?: boolean,
    ): ICollection<UpdatedItem<TInput, TFilterOutput, TMapOutput>> {
        try {
            return new ListCollection(
                this.array.map((item, index) => {
                    if (filter(item, index, this)) {
                        return map(item as TFilterOutput, index, this);
                    }
                    return item;
                }),
            );
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    page(settings: PageSettings): ICollection<TInput> {
        const { page, pageSize } = settings;
        if (page < 0) {
            return this.skip(page * pageSize).take(pageSize);
        }
        return this.skip((page - 1) * pageSize).take(page * pageSize);
    }

    sum(): EnsureType<TInput, number> {
        return this.reduce({
            reduceFn: (sum, item) => {
                if (typeof item !== "number") {
                    throw new TypeError("Item type is invalid must be number");
                }
                return sum + item;
            },
            initialValue: 0,
        }) as EnsureType<TInput, number>;
    }

    average(): EnsureType<TInput, number> {
        return ((this.sum() as number) / this.size()) as EnsureType<
            TInput,
            number
        >;
    }

    median(_throwOnNumberLimit?: boolean): EnsureType<TInput, number> {
        try {
            const nbrs = this.array.map((item) => {
                    if (typeof item !== "number") {
                        throw new TypeError(
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
                return ((a + b) / 2) as EnsureType<TInput, number>;
            }
            return a as EnsureType<TInput, number>;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    min(): EnsureType<TInput, number> {
        try {
            let min = 0;
            for (const item of this.array) {
                if (typeof item !== "number") {
                    throw new TypeError("Item type is invalid must be number");
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
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    max(): EnsureType<TInput, number> {
        try {
            let max = 0;
            for (const item of this.array) {
                if (typeof item !== "number") {
                    throw new TypeError("Item type is invalid must be number");
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
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    percentage(
        filter: Filter<TInput, ICollection<TInput>>,
        _throwOnNumberLimit?: boolean,
    ): number {
        try {
            return (this.count(filter) / this.size()) * 100;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    some<TOutput extends TInput>(
        filter: Filter<TInput, ICollection<TInput>, TOutput>,
        _throwOnNumberLimit?: boolean,
    ): boolean {
        try {
            return this.array.some((item, index) => filter(item, index, this));
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    every<TOutput extends TInput>(
        filter: Filter<TInput, ICollection<TInput>, TOutput>,
        _throwOnNumberLimit?: boolean,
    ): boolean {
        try {
            return this.array.every((item, index) => filter(item, index, this));
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    take(limit: number, _throwOnNumberLimit?: boolean): ICollection<TInput> {
        try {
            return new ListCollection(this.array.slice(0, limit));
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    takeUntil(
        filter: Filter<TInput, ICollection<TInput>>,
        _throwOnNumberLimit?: boolean,
    ): ICollection<TInput> {
        try {
            const items: TInput[] = [];
            for (const [index, item] of this.array.entries()) {
                if (filter(item, index, this)) {
                    break;
                }
                items.push(item);
            }
            return new ListCollection(items);
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    takeWhile(
        filter: Filter<TInput, ICollection<TInput>>,
        _throwOnNumberLimit?: boolean,
    ): ICollection<TInput> {
        try {
            return this.takeUntil((...arguments_) => !filter(...arguments_));
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    skip(offset: number, _throwOnNumberLimit?: boolean): ICollection<TInput> {
        try {
            return new ListCollection(this.array.slice(offset));
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    skipUntil(
        filter: Filter<TInput, ICollection<TInput>>,
        _throwOnNumberLimit?: boolean,
    ): ICollection<TInput> {
        try {
            let hasMatched = false;
            const items: TInput[] = [];
            for (const [index, item] of this.array.entries()) {
                if (!hasMatched) {
                    hasMatched = filter(item, index, this);
                }
                if (hasMatched) {
                    items.push(item);
                }
            }
            return new ListCollection(items);
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    skipWhile(
        filter: Filter<TInput, ICollection<TInput>>,
        _throwOnNumberLimit?: boolean,
    ): ICollection<TInput> {
        try {
            return this.skipUntil((...arguments_) => !filter(...arguments_));
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    when<TExtended = TInput>(
        condition: boolean,
        callback: Modifier<ICollection<TInput>, ICollection<TExtended>>,
    ): ICollection<TInput | TExtended> {
        try {
            if (condition) {
                return callback(this);
            }
            return this as ICollection<TInput | TExtended>;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    whenEmpty<TExtended = TInput>(
        callback: Modifier<ICollection<TInput>, ICollection<TExtended>>,
    ): ICollection<TInput | TExtended> {
        try {
            return this.when(this.empty(), callback);
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    whenNot<TExtended = TInput>(
        condition: boolean,
        callback: Modifier<ICollection<TInput>, ICollection<TExtended>>,
    ): ICollection<TInput | TExtended> {
        try {
            return this.when(!condition, callback);
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    whenNotEmpty<TExtended = TInput>(
        callback: Modifier<ICollection<TInput>, ICollection<TExtended>>,
    ): ICollection<TInput | TExtended> {
        try {
            return this.when(this.notEmpty(), callback);
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    pipe<TOutput = TInput>(
        callback: Transform<ICollection<TInput>, TOutput>,
    ): TOutput {
        try {
            return callback(this);
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    tap(callback: Tap<ICollection<TInput>>): ICollection<TInput> {
        try {
            callback(this);
            return new ListCollection(this);
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    chunk(chunkSize: number): ICollection<ICollection<TInput>> {
        try {
            const chunks: ICollection<TInput>[] = [];
            for (let index = 0; index < this.size(); index += chunkSize) {
                chunks.push(
                    new ListCollection(
                        this.array.slice(index, index + chunkSize),
                    ),
                );
            }
            return new ListCollection(chunks);
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    chunkWhile(
        filter: Filter<TInput, ICollection<TInput>>,
        _throwOnNumberLimit?: boolean,
    ): ICollection<ICollection<TInput>> {
        try {
            let currentChunk: ICollection<TInput> = new ListCollection<TInput>(
                [],
            );
            const chunks: ICollection<TInput>[] = [];
            for (const [index, item] of this.array.entries()) {
                if (index === 0) {
                    currentChunk = currentChunk.append([item]);
                } else if (filter(item, index, currentChunk)) {
                    currentChunk = currentChunk.append([item]);
                } else {
                    chunks.push(currentChunk);
                    currentChunk = new ListCollection<TInput>([item]);
                }
            }
            chunks.push(currentChunk);
            return new ListCollection(chunks);
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    split(
        chunkAmount: number,
        _throwOnNumberLimit?: boolean,
    ): ICollection<ICollection<TInput>> {
        try {
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
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    partition(
        filter: Filter<TInput, ICollection<TInput>>,
        _throwOnNumberLimit?: boolean,
    ): ICollection<ICollection<TInput>> {
        try {
            const chunkA: TInput[] = [],
                chunkB: TInput[] = [];
            for (const [index, item] of this.array.entries()) {
                if (filter(item, index, this)) {
                    chunkA.push(item);
                } else {
                    chunkB.push(item);
                }
            }
            return new ListCollection<ICollection<TInput>>([
                new ListCollection(chunkA),
                new ListCollection(chunkB),
            ]);
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    sliding(settings: SlidingSettings): ICollection<ICollection<TInput>> {
        try {
            const { chunkSize, step = chunkSize - 1 } = settings;
            let chunks: ICollection<ICollection<TInput>> = new ListCollection<
                ICollection<TInput>
            >([]);
            if (step <= 0) {
                return new ListCollection<ICollection<TInput>>([]);
            }
            for (let index = 0; index < this.size(); index += step) {
                const start = index;
                const end = index + chunkSize;
                chunks = chunks.append([
                    this.slice({
                        start,
                        end,
                    }),
                ]);
                if (end >= this.size()) {
                    break;
                }
            }
            return chunks;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    groupBy<TOutput = TInput>(
        settings?: GroupBySettings<TInput, ICollection<TInput>, TOutput>,
    ): ICollection<RecordItem<TOutput, ICollection<TInput>>> {
        try {
            const map = new Map<TOutput, ICollection<TInput>>(),
                callback = (settings?.mapFn ?? ((item) => item)) as Map<
                    TInput,
                    ICollection<TInput>,
                    TOutput
                >;
            for (const [index, item] of this.array.entries()) {
                const key = callback(item, index, this);
                let collection: ICollection<TInput> | undefined = map.get(key);
                if (collection === undefined) {
                    collection = new ListCollection<TInput>([]);
                    map.set(key, collection);
                }

                map.set(key, collection.append([item]));
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
            return new ListCollection(map as any);
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    countBy<TOutput = TInput>(
        settings?: GroupBySettings<TInput, ICollection<TInput>, TOutput>,
    ): ICollection<RecordItem<TOutput, number>> {
        try {
            const map = new Map<TOutput, number>(),
                callback = (settings?.mapFn ?? ((item) => item)) as Map<
                    TInput,
                    ICollection<TInput>,
                    TOutput
                >;
            for (const [index, item] of this.array.entries()) {
                const key = callback(item, index, this);
                if (!map.has(key)) {
                    map.set(key, 0);
                }
                const counter = map.get(key);
                if (counter !== undefined) {
                    map.set(key, counter + 1);
                }
            }
            return new ListCollection(map);
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    unique<TOutput = TInput>(
        settings?: GroupBySettings<TInput, ICollection<TInput>, TOutput>,
    ): ICollection<TInput> {
        try {
            const set = new Set<TOutput>([]),
                callback = (settings?.mapFn ?? ((item) => item)) as Map<
                    TInput,
                    ICollection<TInput>,
                    TOutput
                >,
                items: TInput[] = [];
            for (const [index, item] of this.array.entries()) {
                const item_ = callback(item, index, this);
                if (!set.has(item_)) {
                    items.push(item);
                }
                set.add(item_);
            }
            return new ListCollection(items);
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    difference<TOutput = TInput>(
        iterable: Iterable<TInput>,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
        map: Map<TInput, ICollection<TInput>, TOutput> = (item) => item as any,
    ): ICollection<TInput> {
        try {
            const differenceCollection = new ListCollection(iterable);
            return this.filter((item, index, collection) => {
                return !differenceCollection.some(
                    (matchItem, matchIndex, matchCollection) => {
                        return (
                            map(item, index, collection) ===
                            map(matchItem, matchIndex, matchCollection)
                        );
                    },
                );
            });
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    repeat(amount: number): ICollection<TInput> {
        try {
            let collection: ICollection<TInput> = new ListCollection<TInput>(
                [],
            );
            for (let index = 0; index < amount - 1; index++) {
                collection = collection.append(this);
            }
            return collection;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    padStart<TExtended = TInput>(
        maxLength: number,
        fillItems: Iterable<TExtended>,
    ): ICollection<TInput | TExtended> {
        try {
            const fillItemsArray = [...fillItems];
            const size = this.size();
            const repeat = Math.floor(
                (maxLength - size) / fillItemsArray.length,
            );
            const resultItemsArray: Array<TInput | TExtended> = [];
            for (let index = 0; index < repeat; index++) {
                resultItemsArray.push(...fillItemsArray);
            }
            const restAmount =
                maxLength - (repeat * fillItemsArray.length + size);
            for (let index = 0; index < restAmount; index++) {
                const fillItem = fillItemsArray[index];
                if (fillItem) {
                    resultItemsArray.push(fillItem);
                }
            }
            resultItemsArray.push(...this);
            return new ListCollection<TInput | TExtended>(resultItemsArray);
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    padEnd<TExtended = TInput>(
        maxLength: number,
        fillItems: Iterable<TExtended>,
    ): ICollection<TInput | TExtended> {
        try {
            const fillItemsArray = [...fillItems];
            const size = this.size();
            const repeat = Math.floor(
                (maxLength - size) / fillItemsArray.length,
            );
            const resultItemsArray: Array<TInput | TExtended> = [];
            for (let index = 0; index < repeat; index++) {
                resultItemsArray.push(...fillItemsArray);
            }
            const restAmount =
                maxLength - (repeat * fillItemsArray.length + size);
            for (let index = 0; index < restAmount; index++) {
                const fillItem = fillItemsArray[index];
                if (fillItem) {
                    resultItemsArray.push(fillItem);
                }
            }
            resultItemsArray.unshift(...this);
            return new ListCollection<TInput | TExtended>(resultItemsArray);
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    slice(settings?: SliceSettings): ICollection<TInput> {
        try {
            return new ListCollection(
                this.array.slice(settings?.start, settings?.end),
            );
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    prepend<TExtended = TInput>(
        iterable: Iterable<TInput | TExtended>,
    ): ICollection<TInput | TExtended> {
        try {
            return new ListCollection([...iterable, ...this.array]);
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    append<TExtended = TInput>(
        iterable: Iterable<TInput | TExtended>,
    ): ICollection<TInput | TExtended> {
        try {
            return new ListCollection([...this.array, ...iterable]);
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    insertBefore<TExtended = TInput>(
        filter: Filter<TInput, ICollection<TInput>>,
        iterable: Iterable<TInput | TExtended>,
        _throwOnNumberLimit?: boolean,
    ): ICollection<TInput | TExtended> {
        try {
            const index = this.array.findIndex((item, index) =>
                filter(item, index, this),
            );
            if (index === -1) {
                return new ListCollection<TInput | TExtended>(this.array);
            }
            const newArray = [...this.array] as Array<TInput | TExtended>;
            newArray.splice(index, 0, ...iterable);
            return new ListCollection(newArray);
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    insertAfter<TExtended = TInput>(
        filter: Filter<TInput, ICollection<TInput>>,
        iterable: Iterable<TInput | TExtended>,
        _throwOnNumberLimit?: boolean,
    ): ICollection<TInput | TExtended> {
        try {
            const index = this.array.findIndex((item, index) =>
                filter(item, index, this),
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
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    crossJoin<TExtended = TInput>(
        ...iterables: Array<Iterable<TExtended>>
    ): ICollection<ICollection<TInput | TExtended>> {
        try {
            return new ListCollection<ICollection<TInput | TExtended>>([
                this as ICollection<TInput>,
                ...iterables.map<ICollection<TExtended>>(
                    (iterable) => new ListCollection(iterable),
                ),
            ]).reduce<ICollection<ICollection<TInput | TExtended>>>({
                reduceFn: (a, b) => {
                    return a
                        .map((x) =>
                            b.map((y) => {
                                return x.append([y]);
                            }),
                        )
                        .reduce<ICollection<ICollection<TInput | TExtended>>>({
                            reduceFn: (c, b) => c.append(b),
                            initialValue: new ListCollection<
                                ICollection<TInput | TExtended>
                            >([]),
                        });
                },
                initialValue: new ListCollection<
                    ICollection<TInput | TExtended>
                >([new ListCollection<TInput | TExtended>([])]),
            });
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    zip<TExtended>(
        iterable: Iterable<TExtended>,
    ): ICollection<RecordItem<TInput, TExtended>> {
        try {
            const iterableArray = [...iterable];
            let size = iterableArray.length;
            if (size > this.size()) {
                size = this.size();
            }
            const items: RecordItem<TInput, TExtended>[] = [];
            for (let index = 0; index < size; index++) {
                const itemA = this.array[index],
                    itemB = iterableArray[index];
                if (itemA === undefined || itemB === undefined) {
                    continue;
                }
                items.push([itemA, itemB]);
            }
            return new ListCollection(items);
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    sort(compare?: Comparator<TInput>): ICollection<TInput> {
        try {
            return new ListCollection(this.array.sort(compare));
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    reverse(_settings?: ReverseSettings): ICollection<TInput> {
        try {
            return new ListCollection([...this.array].reverse());
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    shuffle(): ICollection<TInput> {
        try {
            const newArray = [...this.array];
            for (let i = newArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                const temp = newArray[i];
                if (newArray[j] !== undefined) {
                    newArray[i] = newArray[j];
                }
                if (temp !== undefined) {
                    newArray[j] = temp;
                }
            }
            return new ListCollection(newArray);
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    first<TOutput extends TInput>(
        settings?: FindSettings<TInput, ICollection<TInput>, TOutput>,
    ): TOutput | null {
        try {
            return this.firstOr({
                defaultValue: null,
                ...settings,
            });
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    firstOr<TOutput extends TInput, TExtended = TInput>(
        settings: FindOrSettings<
            TInput,
            ICollection<TInput>,
            TOutput,
            TExtended
        >,
    ): TOutput | TExtended {
        try {
            const { filterFn: filter } = settings;
            if (filter) {
                for (const [index, item] of this.array.entries()) {
                    if (filter(item, index, this)) {
                        return item as TOutput;
                    }
                }
            } else {
                const firstItem = this.array[0];
                if (firstItem) {
                    return firstItem as TOutput;
                }
            }
            const { defaultValue } = settings;
            if (typeof defaultValue === "function") {
                const defaultFn = defaultValue as () => TOutput;
                return defaultFn();
            }
            return defaultValue;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    firstOrFail<TOutput extends TInput>(
        settings?: FindSettings<TInput, ICollection<TInput>, TOutput>,
    ): TOutput {
        try {
            const item = this.first(settings);
            if (item === null) {
                throw new ItemNotFoundError("Item was not found");
            }
            return item;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    last<TOutput extends TInput>(
        settings?: FindSettings<TInput, ICollection<TInput>, TOutput>,
    ): TOutput | null {
        try {
            return this.lastOr({
                ...settings,
                defaultValue: null,
            });
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    lastOr<TOutput extends TInput, TExtended = TInput>(
        settings: FindOrSettings<
            TInput,
            ICollection<TInput>,
            TOutput,
            TExtended
        >,
    ): TOutput | TExtended {
        try {
            const { filterFn: filter } = settings;
            if (filter) {
                let matchedItem: TOutput | null = null;
                for (const [index, item] of this.array.entries()) {
                    if (filter(item, index, this)) {
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
            const { defaultValue } = settings;
            if (typeof defaultValue === "function") {
                const defaultFn = defaultValue as () => TOutput;
                return defaultFn();
            }
            return defaultValue;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    lastOrFail<TOutput extends TInput>(
        settings?: FindSettings<TInput, ICollection<TInput>, TOutput>,
    ): TOutput {
        try {
            const item = this.last(settings);
            if (item === null) {
                throw new ItemNotFoundError("Item was not found");
            }
            return item;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    before(
        filter: Filter<TInput, ICollection<TInput>>,
        _throwOnNumberLimit?: boolean,
    ): TInput | null {
        try {
            return this.beforeOr(null, filter);
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    beforeOr<TExtended = TInput>(
        defaultValue: Lazyable<TExtended>,
        filter: Filter<TInput, ICollection<TInput>>,
        _throwOnNumberLimit?: boolean,
    ): TInput | TExtended {
        try {
            for (const [index, item] of this.array.entries()) {
                const beforeItem = this.array[index - 1];
                if (filter(item, index, this) && beforeItem !== undefined) {
                    return beforeItem;
                }
            }
            if (typeof defaultValue === "function") {
                const defaultFn = defaultValue as () => TExtended;
                return defaultFn();
            }
            return defaultValue;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    beforeOrFail(
        filter: Filter<TInput, ICollection<TInput>>,
        _throwOnNumberLimit?: boolean,
    ): TInput {
        try {
            const item = this.before(filter);
            if (item === null) {
                throw new ItemNotFoundError("Item was not found");
            }
            return item;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    after(
        filter: Filter<TInput, ICollection<TInput>>,
        _throwOnNumberLimit?: boolean,
    ): TInput | null {
        try {
            return this.afterOr(null, filter);
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    afterOr<TExtended = TInput>(
        defaultValue: Lazyable<TExtended>,
        filter: Filter<TInput, ICollection<TInput>>,
        _throwOnNumberLimit?: boolean,
    ): TInput | TExtended {
        try {
            for (const [index, item] of this.array.entries()) {
                const beforeItem = this.array[index + 1];
                if (filter(item, index, this) && beforeItem !== undefined) {
                    return beforeItem;
                }
            }
            if (typeof defaultValue === "function") {
                const defaultFn = defaultValue as () => TExtended;
                return defaultFn();
            }
            return defaultValue;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    afterOrFail(
        filter: Filter<TInput, ICollection<TInput>>,
        _throwOnNumberLimit?: boolean,
    ): TInput {
        try {
            const item = this.after(filter);
            if (item === null) {
                throw new ItemNotFoundError("Item was not found");
            }
            return item;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    sole<TOutput extends TInput>(
        filter: Filter<TInput, ICollection<TInput>, TOutput>,
        _throwOnNumberLimit?: boolean,
    ): TOutput {
        try {
            const matchedItems: TInput[] = [];
            for (const [index, item] of this.array.entries()) {
                if (filter(item, index, this)) {
                    matchedItems.push(item);
                }
                if (matchedItems.length > 1) {
                    throw new MultipleItemsFoundError(
                        "Multiple items were found",
                    );
                }
            }
            const [matchedItem] = matchedItems;
            if (matchedItem === undefined) {
                throw new ItemNotFoundError("Item was not found");
            }
            return matchedItem as TOutput;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    nth(step: number): ICollection<TInput> {
        try {
            return this.filter((_item, index) => index % step === 0);
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    count(
        filter: Filter<TInput, ICollection<TInput>>,
        _throwOnNumberLimit?: boolean,
    ): number {
        try {
            return this.filter(filter).size();
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    size(_throwOnNumberLimit?: boolean): number {
        try {
            return this.array.length;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    empty(): boolean {
        try {
            return this.array.length === 0;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    notEmpty(): boolean {
        try {
            return this.array.length !== 0;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    search(
        filter: Filter<TInput, ICollection<TInput>>,
        _throwOnNumberLimit?: boolean,
    ): number {
        try {
            return this.array.findIndex((item, index) =>
                filter(item, index, this),
            );
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    forEach(
        callback: ForEach<TInput, ICollection<TInput>>,
        _throwOnNumberLimit?: boolean,
    ): void {
        try {
            for (const [index, item] of this.array.entries()) {
                callback(item, index, this);
            }
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    toArray(): TInput[] {
        try {
            return [...this.array];
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeError
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
