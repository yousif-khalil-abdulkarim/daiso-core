/**
 * @module Collections
 */

import { isIterable } from "@/collection/_shared";
import {
    type Collapse,
    CollectionError,
    type Comparator,
    type Predicate,
    type ICollection,
    ItemNotFoundCollectionError,
    type Map,
    type Modifier,
    MultipleItemsFoundCollectionError,
    type Tap,
    type Transform,
    UnexpectedCollectionError,
    TypeCollectionError,
    type UpdatedItem,
    type Reduce,
    type ForEach,
} from "@/contracts/collection/_module";
import { type EnsureType, type Lazyable } from "@/_shared/types";
import { type RecordItem } from "@/_shared/types";
import { simplifyLazyable } from "@/_shared/utilities";

/**
 * All methods in <i>ListCollection</i> are executed eagerly. The <i>throwOnIndexOverflow</i> parameter in the <i>ListCollection</i> methods doesnt have any affect.
 * @group Adapters
 */
export class ListCollection<TInput> implements ICollection<TInput> {
    private array: TInput[];

    /**
     * The <i>constructor</i> takes an <i>{@link Iterable}</i>.
     */
    constructor(iterable: Iterable<TInput> = []) {
        this.array = [...iterable];
    }

    *[Symbol.iterator](): Iterator<TInput> {
        yield* this.array;
    }

    toIterator(): Iterator<TInput, void> {
        return this[Symbol.iterator]() as Iterator<TInput, void>;
    }

    entries(): ICollection<RecordItem<number, TInput>> {
        try {
            return new ListCollection(this.array.entries());
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    keys(): ICollection<number> {
        try {
            return new ListCollection(this.array.keys());
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
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
        predicateFn: Predicate<TInput, ICollection<TInput>, TOutput>,
    ): ICollection<TOutput> {
        try {
            return new ListCollection(
                this.array.filter((item, index) =>
                    predicateFn(item, index, this),
                ) as TOutput[],
            );
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    reject<TOutput extends TInput>(
        predicateFn: Predicate<TInput, ICollection<TInput>, TOutput>,
    ): ICollection<Exclude<TInput, TOutput>> {
        try {
            return new ListCollection(
                this.array.filter(
                    (item, index) => !predicateFn(item, index, this),
                ) as Exclude<TInput, TOutput>[],
            );
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
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
        mapFn: Map<TInput, ICollection<TInput>, TOutput>,
    ): ICollection<TOutput> {
        try {
            return new ListCollection(
                this.array.map((item, index) => mapFn(item, index, this)),
            );
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
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
        reduceFn: Reduce<TInput, ICollection<TInput>, TOutput>,
        initialValue?: TOutput,
    ): TOutput {
        try {
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
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    join(separator = ","): EnsureType<TInput, string> {
        try {
            return this.reduce<string>((str, item) => {
                if (typeof item !== "string") {
                    throw new TypeCollectionError(
                        "Item type is invalid must be string",
                    );
                }
                return str + separator + item;
            }) as EnsureType<TInput, string>;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
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
                error instanceof TypeCollectionError
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
        mapFn: Map<TInput, ICollection<TInput>, Iterable<TOutput>>,
    ): ICollection<TOutput> {
        try {
            return new ListCollection(
                this.array.flatMap((item, index) => [
                    ...mapFn(item, index, this),
                ]),
            );
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
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
        predicateFn: Predicate<TInput, ICollection<TInput>, TFilterOutput>,
        mapFn: Map<TFilterOutput, ICollection<TInput>, TMapOutput>,
    ): ICollection<UpdatedItem<TInput, TFilterOutput, TMapOutput>> {
        try {
            return new ListCollection(
                this.array.map((item, index) => {
                    if (predicateFn(item, index, this)) {
                        return mapFn(item as TFilterOutput, index, this);
                    }
                    return item;
                }),
            );
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    page(page: number, pageSize: number): ICollection<TInput> {
        if (page < 0) {
            return this.skip(page * pageSize).take(pageSize);
        }
        return this.skip((page - 1) * pageSize).take(page * pageSize);
    }

    sum(): EnsureType<TInput, number> {
        return this.reduce((sum, item) => {
            if (typeof item !== "number") {
                throw new TypeCollectionError(
                    "Item type is invalid must be number",
                );
            }
            return sum + item;
        }, 0) as EnsureType<TInput, number>;
    }

    average(): EnsureType<TInput, number> {
        return ((this.sum() as number) / this.size()) as EnsureType<
            TInput,
            number
        >;
    }

    median(): EnsureType<TInput, number> {
        try {
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
                return ((a + b) / 2) as EnsureType<TInput, number>;
            }
            return a as EnsureType<TInput, number>;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
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
            return min as EnsureType<TInput, number>;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
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
            return max as EnsureType<TInput, number>;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    percentage(predicateFn: Predicate<TInput, ICollection<TInput>>): number {
        try {
            return (this.count(predicateFn) / this.size()) * 100;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
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
        predicateFn: Predicate<TInput, ICollection<TInput>, TOutput>,
    ): boolean {
        try {
            return this.array.some((item, index) =>
                predicateFn(item, index, this),
            );
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
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
        predicateFn: Predicate<TInput, ICollection<TInput>, TOutput>,
    ): boolean {
        try {
            return this.array.every((item, index) =>
                predicateFn(item, index, this),
            );
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    take(limit: number): ICollection<TInput> {
        try {
            return new ListCollection(this.array.slice(0, limit));
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
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
        predicateFn: Predicate<TInput, ICollection<TInput>>,
    ): ICollection<TInput> {
        try {
            const items: TInput[] = [];
            for (const [index, item] of this.array.entries()) {
                if (predicateFn(item, index, this)) {
                    break;
                }
                items.push(item);
            }
            return new ListCollection(items);
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
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
        predicateFn: Predicate<TInput, ICollection<TInput>>,
    ): ICollection<TInput> {
        try {
            return this.takeUntil(
                (...arguments_) => !predicateFn(...arguments_),
            );
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    skip(offset: number): ICollection<TInput> {
        try {
            return new ListCollection(this.array.slice(offset));
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
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
        predicateFn: Predicate<TInput, ICollection<TInput>>,
    ): ICollection<TInput> {
        try {
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
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
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
        predicateFn: Predicate<TInput, ICollection<TInput>>,
    ): ICollection<TInput> {
        try {
            return this.skipUntil(
                (...arguments_) => !predicateFn(...arguments_),
            );
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
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
                error instanceof TypeCollectionError
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
            return this.when(this.isEmpty(), callback);
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
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
                error instanceof TypeCollectionError
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
            return this.when(this.isNotEmpty(), callback);
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
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
                error instanceof TypeCollectionError
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
                error instanceof TypeCollectionError
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
                error instanceof TypeCollectionError
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
        predicateFn: Predicate<TInput, ICollection<TInput>>,
    ): ICollection<ICollection<TInput>> {
        try {
            let currentChunk: ICollection<TInput> = new ListCollection<TInput>(
                [],
            );
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
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    split(chunkAmount: number): ICollection<ICollection<TInput>> {
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
                error instanceof TypeCollectionError
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
        predicateFn: Predicate<TInput, ICollection<TInput>>,
    ): ICollection<ICollection<TInput>> {
        try {
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
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    sliding(
        chunkSize: number,
        step = chunkSize - 1,
    ): ICollection<ICollection<TInput>> {
        try {
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
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
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
        selectFn: Map<TInput, ICollection<TInput>, TOutput> = (item) =>
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
            item as any,
    ): ICollection<RecordItem<TOutput, ICollection<TInput>>> {
        try {
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
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
            return new ListCollection(map as any);
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
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
        selectFn: Map<TInput, ICollection<TInput>, TOutput> = (item) =>
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
            item as any,
    ): ICollection<RecordItem<TOutput, number>> {
        try {
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
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
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
        selectFn: Map<TInput, ICollection<TInput>, TOutput> = (item) =>
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
            item as any,
    ): ICollection<TInput> {
        try {
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
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
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
        selectFn: Map<TInput, ICollection<TInput>, TOutput> = (item) =>
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
            item as any,
    ): ICollection<TInput> {
        try {
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
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
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
                error instanceof TypeCollectionError
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
                error instanceof TypeCollectionError
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
                error instanceof TypeCollectionError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    slice(start?: number, end?: number): ICollection<TInput> {
        try {
            return new ListCollection(this.array.slice(start, end));
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
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
                error instanceof TypeCollectionError
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
                error instanceof TypeCollectionError
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
        predicateFn: Predicate<TInput, ICollection<TInput>>,
        iterable: Iterable<TInput | TExtended>,
    ): ICollection<TInput | TExtended> {
        try {
            const index = this.array.findIndex((item, index) =>
                predicateFn(item, index, this),
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
                error instanceof TypeCollectionError
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
        predicateFn: Predicate<TInput, ICollection<TInput>>,
        iterable: Iterable<TInput | TExtended>,
    ): ICollection<TInput | TExtended> {
        try {
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
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
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
            ]).reduce<ICollection<ICollection<TInput | TExtended>>>(
                (a, b) => {
                    return a
                        .map((x) =>
                            b.map((y) => {
                                return x.append([y]);
                            }),
                        )
                        .reduce<ICollection<ICollection<TInput | TExtended>>>(
                            (c, b) => c.append(b),
                            new ListCollection<ICollection<TInput | TExtended>>(
                                [],
                            ),
                        );
                },
                new ListCollection<ICollection<TInput | TExtended>>([
                    new ListCollection<TInput | TExtended>([]),
                ]),
            );
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
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
                error instanceof TypeCollectionError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    sort(comparator?: Comparator<TInput>): ICollection<TInput> {
        try {
            return new ListCollection(this.array.sort(comparator));
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    reverse(_chunkSize?: number): ICollection<TInput> {
        try {
            return new ListCollection([...this.array].reverse());
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
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
                error instanceof TypeCollectionError
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
        predicateFn?: Predicate<TInput, ICollection<TInput>, TOutput>,
    ): TOutput | null {
        try {
            return this.firstOr(null, predicateFn);
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
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
        defaultValue: Lazyable<TExtended>,
        predicateFn?: Predicate<TInput, ICollection<TInput>, TOutput>,
    ): TOutput | TExtended {
        try {
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
            return simplifyLazyable(defaultValue);
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
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
        predicateFn?: Predicate<TInput, ICollection<TInput>, TOutput>,
    ): TOutput {
        try {
            const item = this.first(predicateFn);
            if (item === null) {
                throw new ItemNotFoundCollectionError("Item was not found");
            }
            return item;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
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
        predicateFn?: Predicate<TInput, ICollection<TInput>, TOutput>,
    ): TOutput | null {
        try {
            return this.lastOr(null, predicateFn);
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
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
        defaultValue: Lazyable<TExtended>,
        predicateFn?: Predicate<TInput, ICollection<TInput>, TOutput>,
    ): TOutput | TExtended {
        try {
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
            return simplifyLazyable(defaultValue);
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
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
        predicateFn?: Predicate<TInput, ICollection<TInput>, TOutput>,
    ): TOutput {
        try {
            const item = this.last(predicateFn);
            if (item === null) {
                throw new ItemNotFoundCollectionError("Item was not found");
            }
            return item;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    before(predicateFn: Predicate<TInput, ICollection<TInput>>): TInput | null {
        try {
            return this.beforeOr(null, predicateFn);
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
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
        predicateFn: Predicate<TInput, ICollection<TInput>>,
    ): TInput | TExtended {
        try {
            for (const [index, item] of this.array.entries()) {
                const beforeItem = this.array[index - 1];
                if (
                    predicateFn(item, index, this) &&
                    beforeItem !== undefined
                ) {
                    return beforeItem;
                }
            }
            return simplifyLazyable(defaultValue);
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    beforeOrFail(predicateFn: Predicate<TInput, ICollection<TInput>>): TInput {
        try {
            const item = this.before(predicateFn);
            if (item === null) {
                throw new ItemNotFoundCollectionError("Item was not found");
            }
            return item;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    after(predicateFn: Predicate<TInput, ICollection<TInput>>): TInput | null {
        try {
            return this.afterOr(null, predicateFn);
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
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
        predicateFn: Predicate<TInput, ICollection<TInput>>,
    ): TInput | TExtended {
        try {
            for (const [index, item] of this.array.entries()) {
                const beforeItem = this.array[index + 1];
                if (
                    predicateFn(item, index, this) &&
                    beforeItem !== undefined
                ) {
                    return beforeItem;
                }
            }
            return simplifyLazyable(defaultValue);
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    afterOrFail(predicateFn: Predicate<TInput, ICollection<TInput>>): TInput {
        try {
            const item = this.after(predicateFn);
            if (item === null) {
                throw new ItemNotFoundCollectionError("Item was not found");
            }
            return item;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
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
        predicateFn: Predicate<TInput, ICollection<TInput>, TOutput>,
    ): TOutput {
        try {
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
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
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
                error instanceof TypeCollectionError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    count(predicateFn: Predicate<TInput, ICollection<TInput>>): number {
        try {
            return this.filter(predicateFn).size();
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    size(): number {
        try {
            return this.array.length;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    isEmpty(): boolean {
        try {
            return this.array.length === 0;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    isNotEmpty(): boolean {
        try {
            return this.array.length !== 0;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    searchFirst(predicateFn: Predicate<TInput, ICollection<TInput>>): number {
        try {
            return this.array.findIndex((item, index) =>
                predicateFn(item, index, this),
            );
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    searchLast(predicateFn: Predicate<TInput, ICollection<TInput>>): number {
        try {
            let matchedIndex = -1;
            for (const [index, item] of this.array.entries()) {
                if (predicateFn(item, index, this)) {
                    matchedIndex = index;
                }
            }
            return matchedIndex;
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
            ) {
                throw error;
            }
            throw new UnexpectedCollectionError(
                `Unexpected error "${String(error)}" occured`,
                error,
            );
        }
    }

    forEach(callback: ForEach<TInput, ICollection<TInput>>): void {
        try {
            for (const [index, item] of this.array.entries()) {
                callback(item, index, this);
            }
        } catch (error: unknown) {
            if (
                error instanceof CollectionError ||
                error instanceof TypeCollectionError
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
                error instanceof TypeCollectionError
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
