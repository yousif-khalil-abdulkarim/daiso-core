import { describe, expect, test } from "vitest";

import {
    CollectionError,
    TypeCollectionError,
    ItemNotFoundCollectionError,
    MultipleItemsFoundCollectionError,
} from "@/contracts/collection/_module";
import { AsyncIterableCollection } from "@/collection/async-iterable-collection/_module";
import { type RecordItem } from "@/_shared/types";

describe("class: AsyncIterableCollection", () => {
    describe("method: filter", () => {
        test(`Should filter in all "a" of ["a", "bc", "c", "a", "d", "a"]`, async () => {
            const arr = ["a", "bc", "c", "a", "d", "a"],
                collection = new AsyncIterableCollection(arr),
                predicateFn = (item: string): boolean => item === "a",
                newCollection = collection.filter(predicateFn);
            expect(await newCollection.toArray()).toEqual(
                arr.filter(predicateFn),
            );
        });
        test("Should input correct indexes to predicate function", async () => {
            const collection = new AsyncIterableCollection([
                    "a",
                    "bc",
                    "c",
                    "a",
                    "d",
                    "a",
                ]),
                indexes: number[] = [],
                predicateFn = (item: string, index: number): boolean => {
                    indexes.push(index);
                    return item === "a";
                };
            await collection.filter(predicateFn).toArray();
            expect(indexes).toEqual([0, 1, 2, 3, 4, 5]);
        });
        test("Should work with async predicate function", async () => {
            const arr = ["a", "bc", "c", "a", "d", "a"],
                collection = new AsyncIterableCollection(arr),
                predicateFn = (item: string): boolean => item === "a",
                // eslint-disable-next-line @typescript-eslint/require-await
                newCollection = collection.filter(async (item) =>
                    predicateFn(item),
                );
            expect(await newCollection.toArray()).toEqual(
                arr.filter(predicateFn),
            );
        });
    });
    describe("method: reject", () => {
        test(`Should filter out all "a" of ["a", "bc", "c", "a", "d", "a"]`, async () => {
            const arr = ["a", "bc", "c", "a", "d", "a"],
                collection = new AsyncIterableCollection(arr),
                predicateFn = (item: string): boolean => item === "a",
                newCollection = collection.reject(predicateFn);
            expect(await newCollection.toArray()).toEqual(
                arr.filter((item) => !predicateFn(item)),
            );
        });
        test("Should input correct indexes to predicate function", async () => {
            const collection = new AsyncIterableCollection([
                    "a",
                    "bc",
                    "c",
                    "a",
                    "d",
                    "a",
                ]),
                indexes: number[] = [],
                predicateFn = (item: string, index: number): boolean => {
                    indexes.push(index);
                    return item === "a";
                };
            await collection.reject(predicateFn).toArray();
            expect(indexes).toEqual([0, 1, 2, 3, 4, 5]);
        });
        test("Should work with async predicate function", async () => {
            const arr = ["a", "bc", "c", "a", "d", "a"],
                collection = new AsyncIterableCollection(arr),
                predicateFn = (item: string): boolean => item === "a",
                // eslint-disable-next-line @typescript-eslint/require-await
                newCollection = collection.reject(async (item) =>
                    predicateFn(item),
                );
            expect(await newCollection.toArray()).toEqual(
                arr.filter((item) => !predicateFn(item)),
            );
        });
    });
    describe("method: map", () => {
        test("Should apply power by 2 for all items", async () => {
            const arr = [2, 3, 4, 5],
                collection = new AsyncIterableCollection(arr),
                mapFunction = (item: number): number => item ** 2,
                newCollection = collection.map(mapFunction);
            expect(await newCollection.toArray()).toEqual(arr.map(mapFunction));
        });
        test("Should input correct indexes to map function", async () => {
            const collection = new AsyncIterableCollection([2, 3, 4, 5]),
                indexes: number[] = [],
                mapFunction = (item: number, index: number): number => {
                    indexes.push(index);
                    return item ** 2;
                };
            await collection.map(mapFunction).toArray();
            expect(indexes).toEqual([0, 1, 2, 3]);
        });
        test("Should work with async map function", async () => {
            const arr = [2, 3, 4, 5],
                collection = new AsyncIterableCollection(arr),
                mapFunction = (item: number): number => item ** 2,
                // eslint-disable-next-line @typescript-eslint/require-await
                newCollection = collection.map(async (item) =>
                    mapFunction(item),
                );
            expect(await newCollection.toArray()).toEqual(arr.map(mapFunction));
        });
    });
    describe("method: reduce", () => {
        test("Should join all string items without initial values", async () => {
            const arr = ["a", "b", "c", "d"],
                collection = new AsyncIterableCollection(arr),
                seperator = "_#_",
                result = await collection.reduce({
                    reduceFn(firstItem, item) {
                        return firstItem + seperator + item;
                    },
                });
            expect(result).toBe(arr.join(seperator));
        });
        test(`Should join all string items initial value "_#_"`, async () => {
            const arr = ["a", "b", "c", "d"],
                collection = new AsyncIterableCollection(arr),
                initialValue = "!",
                result = await collection.reduce({
                    reduceFn(initialValue, item) {
                        return initialValue + item;
                    },
                    initialValue,
                });
            expect(result).toBe(initialValue + arr.join(""));
        });
        test("Should input correct indexes to reduce function", async () => {
            const arr = ["a", "b", "c", "d"],
                collection = new AsyncIterableCollection(arr),
                initialValue = "!",
                indexes: number[] = [];
            await collection.reduce({
                reduceFn(initialValue, item, index) {
                    indexes.push(index);
                    return initialValue + item;
                },
                initialValue,
            });
            expect(indexes).toEqual([0, 1, 2, 3]);
        });
        test("Should throw TypeCollectionError when given an empty array without initial value", async () => {
            const collection = new AsyncIterableCollection<string>([]);
            await expect(async () => {
                await collection.reduce({
                    reduceFn: (a, b) => a + b,
                });
            }).rejects.toThrowError(TypeCollectionError);
        });
        test("Should return the same value when called more than 1 times", async () => {
            const arr = ["a", "b", "c", "d"],
                collection = new AsyncIterableCollection(arr),
                seperator = "_#_";
            expect(
                await collection.reduce({
                    reduceFn(firstItem, item) {
                        return firstItem + seperator + item;
                    },
                }),
            ).toBe(arr.join(seperator));
            expect(
                await collection.reduce({
                    reduceFn(firstItem, item) {
                        return firstItem + seperator + item;
                    },
                }),
            ).toBe(arr.join(seperator));
        });
        test("Should work with async reduce function", async () => {
            const arr = ["a", "b", "c", "d"],
                collection = new AsyncIterableCollection(arr),
                seperator = "_#_",
                result = await collection.reduce({
                    // eslint-disable-next-line @typescript-eslint/require-await
                    reduceFn: async (firstItem, item) =>
                        firstItem + seperator + item,
                });
            expect(result).toBe(arr.join(seperator));
        });
    });
    describe("method: join", () => {
        test(`Should join Iterable of ["a", "b", "c"] to "a,b,c"`, async () => {
            const collection = new AsyncIterableCollection(["a", "b", "c"]);
            expect(await collection.join()).toBe("a,b,c");
        });
        test(`Should join Iterable of ["a", "b", "c"] to "a,b,c" with seperator "_#_"`, async () => {
            const collection = new AsyncIterableCollection(["a", "b", "c"]);
            expect(
                await collection.join({
                    seperator: "_#_",
                }),
            ).toBe("a_#_b_#_c");
        });
        test("Should return the same value when called more than 1 times", async () => {
            const collection = new AsyncIterableCollection(["a", "b", "c"]);
            expect(await collection.join()).toBe("a,b,c");
            expect(await collection.join()).toBe("a,b,c");
        });
    });
    describe("method: flatMap", () => {
        test("Should apply flatmap when given an Iterable", async () => {
            const collection = new AsyncIterableCollection([
                    "a",
                    "ab",
                    "b",
                    "ba",
                ]),
                newCollection = collection.flatMap((item, index) => [
                    index,
                    item,
                    item.length,
                ]);
            expect(await newCollection.toArray()).toEqual([
                0,
                "a",
                1,
                1,
                "ab",
                2,
                2,
                "b",
                1,
                3,
                "ba",
                2,
            ]);
        });
        test("Should apply flatmap when given an AsyncIterable", async () => {
            const asyncIterable: AsyncIterable<string> = {
                // eslint-disable-next-line @typescript-eslint/require-await
                async *[Symbol.asyncIterator](): AsyncIterator<string> {
                    yield "a";
                    yield "ab";
                    yield "b";
                    yield "ba";
                },
            };
            const collection = new AsyncIterableCollection(asyncIterable),
                newCollection = collection.flatMap((item, index) => [
                    index,
                    item,
                    item.length,
                ]);
            expect(await newCollection.toArray()).toEqual([
                0,
                "a",
                1,
                1,
                "ab",
                2,
                2,
                "b",
                1,
                3,
                "ba",
                2,
            ]);
        });
        test("Should input correct indexes to map function", async () => {
            const collection = new AsyncIterableCollection([
                    "a",
                    "ab",
                    "b",
                    "ba",
                ]),
                indexes: number[] = [],
                mapFunction = (
                    item: string,
                    index: number,
                ): [number, string, number] => {
                    indexes.push(index);
                    return [index, item, item.length];
                };
            await collection.flatMap(mapFunction).toArray();
            expect(indexes).toEqual([0, 1, 2, 3]);
        });
        test("Should work with async flatMap function", async () => {
            const collection = new AsyncIterableCollection([
                    "a",
                    "ab",
                    "b",
                    "ba",
                ]),
                // eslint-disable-next-line @typescript-eslint/require-await
                newCollection = collection.flatMap(async (item, index) => [
                    index,
                    item,
                    item.length,
                ]);
            expect(await newCollection.toArray()).toEqual([
                0,
                "a",
                1,
                1,
                "ab",
                2,
                2,
                "b",
                1,
                3,
                "ba",
                2,
            ]);
        });
    });
    describe("method: update", () => {
        test("Should change all the items that match the predicate function", async () => {
            const collection = new AsyncIterableCollection([
                    "a",
                    "aa",
                    "b",
                    "bbb",
                    "c",
                    "cccc",
                ]),
                newCollection = collection.update(
                    (item) => item.length >= 2,
                    (item) => item.slice(0, -1),
                );
            expect(await newCollection.toArray()).toEqual([
                "a",
                "a",
                "b",
                "bb",
                "c",
                "ccc",
            ]);
        });
        test("Should input correct indexes to predicate function", async () => {
            const collection = new AsyncIterableCollection([
                    "a",
                    "aa",
                    "b",
                    "bbb",
                    "c",
                    "cccc",
                ]),
                indexes: number[] = [];
            await collection
                .update(
                    (item, index) => {
                        indexes.push(index);
                        return item.length >= 2;
                    },
                    (item) => item.slice(0, -1),
                )
                .toArray();
            expect(indexes).toEqual([0, 1, 2, 3, 4, 5]);
        });
        test("Should input correct indexes to map function", async () => {
            const collection = new AsyncIterableCollection([
                    "a",
                    "aa",
                    "b",
                    "bbb",
                    "c",
                    "cccc",
                ]),
                indexes: number[] = [];
            await collection
                .update(
                    (item) => item.length >= 2,
                    (item, index) => {
                        indexes.push(index);
                        return item.slice(0, -1);
                    },
                )
                .toArray();
            expect(indexes).toEqual([1, 3, 5]);
        });
        test("Should work with async filter and map function", async () => {
            const collection = new AsyncIterableCollection([
                    "a",
                    "aa",
                    "b",
                    "bbb",
                    "c",
                    "cccc",
                ]),
                newCollection = collection.update(
                    // eslint-disable-next-line @typescript-eslint/require-await
                    async (item) => item.length >= 2,
                    // eslint-disable-next-line @typescript-eslint/require-await
                    async (item) => item.slice(0, -1),
                );
            expect(await newCollection.toArray()).toEqual([
                "a",
                "a",
                "b",
                "bb",
                "c",
                "ccc",
            ]);
        });
    });
    describe("method: page", () => {
        test("Should return the first 4 items when page is 1 and pageSize 4", async () => {
            const arr = ["a", "b", "c", "d", "e", "f", "g", "h"],
                collection = new AsyncIterableCollection(arr),
                newCollection = collection.page({
                    page: 1,
                    pageSize: 4,
                });
            expect(await newCollection.toArray()).toEqual(arr.slice(0, 4));
        });
        test("Should return the last 4 items when page is 2 and pageSize 4", async () => {
            const arr = ["a", "b", "c", "d", "e", "f", "g", "h"],
                collection = new AsyncIterableCollection(arr),
                newCollection = collection.page({
                    page: 2,
                    pageSize: 4,
                });
            expect(await newCollection.toArray()).toEqual(arr.slice(-4));
        });
        test("Should return the last 4 items when page is -1 and pageSize 4", async () => {
            const arr = ["a", "b", "c", "d", "e", "f", "g", "h"],
                collection = new AsyncIterableCollection(arr),
                newCollection = collection.page({
                    page: -1,
                    pageSize: 4,
                });
            expect(await newCollection.toArray()).toEqual(arr.slice(-4));
        });
        test("Should return the first 2 items when page is 1 and pageSize 2", async () => {
            const arr = ["a", "b", "c", "d", "e", "f", "g", "h"],
                collection = new AsyncIterableCollection(arr),
                newCollection = collection.page({
                    page: 1,
                    pageSize: 2,
                });
            expect(await newCollection.toArray()).toEqual(arr.slice(0, 2));
        });
        test("Should return the last 2 items when page is 4 and pageSize 2", async () => {
            const arr = ["a", "b", "c", "d", "e", "f", "g", "h"],
                collection = new AsyncIterableCollection(arr),
                newCollection = collection.page({
                    page: 4,
                    pageSize: 2,
                });
            expect(await newCollection.toArray()).toEqual(arr.slice(-2));
        });
        test("Should return the last 2 items when page is -1 and pageSize 2", async () => {
            const arr = ["a", "b", "c", "d", "e", "f", "g", "h"],
                collection = new AsyncIterableCollection(arr),
                newCollection = collection.page({
                    page: -1,
                    pageSize: 2,
                });
            expect(await newCollection.toArray()).toEqual(arr.slice(-2));
        });
        test("Should return the last 2 items when page is -4 and pageSize -2", async () => {
            const arr = ["a", "b", "c", "d", "e", "f", "g", "h"],
                collection = new AsyncIterableCollection(arr),
                newCollection = collection.page({
                    page: -2,
                    pageSize: 2,
                });
            expect(await newCollection.toArray()).toEqual(arr.slice(-4, -2));
        });
    });
    describe("method: sum", () => {
        test("Should calculate sum Iterable of [1, 2, 3, 4] to 10", async () => {
            const collection = new AsyncIterableCollection([1, 2, 3, 4]);
            expect(await collection.sum()).toBe(10);
        });
        test("Should throw TypeCollectionError when containg a none number item", async () => {
            const collection = new AsyncIterableCollection([1, 2, 3, 4, "a"]);
            await expect(async () => {
                await collection.sum();
            }).rejects.toThrowError(TypeCollectionError);
        });
        test("Should return the same value when called more than 1 times", async () => {
            const collection = new AsyncIterableCollection([1, 2, 3, 4]);
            expect(await collection.sum()).toBe(10);
            expect(await collection.sum()).toBe(10);
        });
    });
    describe("method: average", () => {
        test("Should calculate average Iterable of [1, 2, 3, 4] to 2.5", async () => {
            const collection = new AsyncIterableCollection([1, 2, 3, 4]);
            expect(await collection.average()).toBe(2.5);
        });
        test("Should throw TypeCollectionError when containg a none number item", async () => {
            const collection = new AsyncIterableCollection([1, 2, 3, 4, "a"]);
            await expect(async () => {
                await collection.average();
            }).rejects.toThrowError(TypeCollectionError);
        });
        test("Should return the same value when called more than 1 times", async () => {
            const collection = new AsyncIterableCollection([1, 2, 3, 4]);
            expect(await collection.average()).toBe(2.5);
            expect(await collection.average()).toBe(2.5);
        });
    });
    describe("method: median", () => {
        test("Should calculate median Iterable of [1, 2, 3, 4, 5] to 3", async () => {
            const collection = new AsyncIterableCollection([1, 2, 3, 4, 5]);
            expect(await collection.median()).toBe(3);
        });
        test("Should calculate median Iterable of [1, 2, 4, 5] to 3", async () => {
            const collection = new AsyncIterableCollection([1, 2, 3, 4, 5]);
            expect(await collection.median()).toBe(3);
        });
        test("Should throw TypeCollectionError when containg a none number item", async () => {
            const collection = new AsyncIterableCollection([1, 2, 3, 4, "a"]);
            await expect(async () => {
                await collection.median();
            }).rejects.toThrowError(TypeCollectionError);
        });
        test("Should return the same value when called more than 1 times", async () => {
            const collection = new AsyncIterableCollection([1, 2, 3, 4, 5]);
            expect(await collection.median()).toBe(3);
            expect(await collection.median()).toBe(3);
        });
    });
    describe("method: min", () => {
        test("Should return the smallest number", async () => {
            const collection = new AsyncIterableCollection([2, 1, 3, -2, 4]);
            expect(await collection.min()).toBe(-2);
        });
        test("Should throw TypeCollectionError when containg a none number item", async () => {
            const collection = new AsyncIterableCollection([
                2,
                1,
                3,
                -2,
                4,
                "-4",
            ]);
            await expect(async () => {
                await collection.min();
            }).rejects.toThrowError(TypeCollectionError);
        });
        test("Should return the same value when called more than 1 times", async () => {
            const collection = new AsyncIterableCollection([2, 1, 3, -2, 4]);
            expect(await collection.min()).toBe(-2);
            expect(await collection.min()).toBe(-2);
        });
    });
    describe("method: max", () => {
        test("Should return the largest number", async () => {
            const collection = new AsyncIterableCollection([2, 1, 3, -2, 4]);
            expect(await collection.max()).toBe(4);
        });
        test("Should throw TypeCollectionError when containg a none number item", async () => {
            const collection = new AsyncIterableCollection([
                2,
                1,
                3,
                -2,
                4,
                "-4",
            ]);
            await expect(async () => {
                await collection.max();
            }).rejects.toThrowError(TypeCollectionError);
        });
        test("Should return the same value when called more than 1 times", async () => {
            const collection = new AsyncIterableCollection([2, 1, 3, -2, 4]);
            expect(await collection.max()).toBe(4);
            expect(await collection.max()).toBe(4);
        });
    });
    describe("method: percentage", () => {
        test(`Should return 50 when filtering "a" of ["a", "b", "a", "c"]`, async () => {
            const collection = new AsyncIterableCollection([
                "a",
                "b",
                "a",
                "b",
            ]);
            expect(await collection.percentage((item) => item === "a")).toBe(
                50,
            );
        });
        test("Should input correct indexes to predicate function", async () => {
            const collection = new AsyncIterableCollection([
                    "a",
                    "bc",
                    "c",
                    "a",
                    "d",
                    "a",
                ]),
                indexes: number[] = [],
                predicateFn = (item: string, index: number): boolean => {
                    indexes.push(index);
                    return item === "a";
                };
            await collection.percentage(predicateFn);
            expect(indexes).toEqual([0, 1, 2, 3, 4, 5]);
        });
        test("Should return the same value when called more than 1 times", async () => {
            const collection = new AsyncIterableCollection([
                "a",
                "b",
                "a",
                "b",
            ]);
            expect(await collection.percentage((item) => item === "a")).toBe(
                50,
            );
            expect(await collection.percentage((item) => item === "a")).toBe(
                50,
            );
        });
        test("Should work with async predicate function", async () => {
            const collection = new AsyncIterableCollection([
                "a",
                "b",
                "a",
                "b",
            ]);
            expect(
                // eslint-disable-next-line @typescript-eslint/require-await
                await collection.percentage(async (item) => item === "a"),
            ).toBe(50);
        });
    });
    describe("method: some", () => {
        test("Should return true when at least 1 item match the predicate function", async () => {
            const collection = new AsyncIterableCollection([
                "a",
                "b",
                "c",
                "c",
                "a",
            ]);
            expect(await collection.some((item) => item === "b")).toBe(true);
        });
        test("Should return false when all of the items does not match the predicate function", async () => {
            const collection = new AsyncIterableCollection([
                "a",
                "b",
                "c",
                "c",
                "a",
            ]);
            expect(await collection.some((item) => item === "d")).toBe(false);
        });
        test("Should input correct indexes to predicate function", async () => {
            const collection = new AsyncIterableCollection([
                    "a",
                    "bc",
                    "c",
                    "a",
                    "d",
                    "a",
                ]),
                indexes: number[] = [],
                predicateFn = (item: string, index: number): boolean => {
                    indexes.push(index);
                    return item === "a";
                };
            await collection.some(predicateFn);
            expect(indexes).toEqual([0]);
        });
        test("Should return the same value when called more than 1 times", async () => {
            const collection = new AsyncIterableCollection([
                "a",
                "b",
                "c",
                "c",
                "a",
            ]);
            expect(await collection.some((item) => item === "b")).toBe(true);
            expect(await collection.some((item) => item === "b")).toBe(true);
        });
        test("Should work with async predicate function", async () => {
            const collection = new AsyncIterableCollection([
                "a",
                "b",
                "c",
                "c",
                "a",
            ]);
            // eslint-disable-next-line @typescript-eslint/require-await
            expect(await collection.some(async (item) => item === "b")).toBe(
                true,
            );
        });
    });
    describe("method: every", () => {
        test("Should return true when all items match the predicate function", async () => {
            const collection = new AsyncIterableCollection([
                "a",
                "b",
                "c",
                "c",
                "a",
            ]);
            expect(await collection.every((item) => item.length === 1)).toBe(
                true,
            );
        });
        test("Should return false when one item does not match the predicate function", async () => {
            const collection = new AsyncIterableCollection([
                "a",
                "b",
                "c",
                "c",
                "aa",
            ]);
            expect(await collection.every((item) => item.length === 1)).toBe(
                false,
            );
        });
        test("Should input correct indexes to predicate function", async () => {
            const collection = new AsyncIterableCollection([
                    "a",
                    "b",
                    "c",
                    "c",
                    "aa",
                ]),
                indexes: number[] = [];
            await collection.every((item, index) => {
                indexes.push(index);
                return item.length === 1;
            });
            expect(indexes).toEqual([0, 1, 2, 3, 4]);
        });
        test("Should return the same value when called more than 1 times", async () => {
            const collection = new AsyncIterableCollection([
                "a",
                "b",
                "c",
                "c",
                "a",
            ]);
            expect(await collection.every((item) => item.length === 1)).toBe(
                true,
            );
            expect(await collection.every((item) => item.length === 1)).toBe(
                true,
            );
        });
        test("Should work with async predicate function", async () => {
            const collection = new AsyncIterableCollection([
                "a",
                "b",
                "c",
                "c",
                "a",
            ]);
            expect(
                // eslint-disable-next-line @typescript-eslint/require-await
                await collection.every(async (item) => item.length === 1),
            ).toBe(true);
        });
    });
    describe("method: take", () => {
        test("Should take first item when input is 1", async () => {
            const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                collection = new AsyncIterableCollection(arr),
                newCollection = collection.take(1);
            expect(await newCollection.toArray()).toEqual(arr.slice(0, 1));
        });
        test("Should take 5 first items when input is 5", async () => {
            const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                collection = new AsyncIterableCollection(arr),
                newCollection = collection.take(5);
            expect(await newCollection.toArray()).toEqual(arr.slice(0, 5));
        });
        test("Should take 8 first items when input is -2", async () => {
            const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                collection = new AsyncIterableCollection(arr),
                newCollection = collection.take(-2);
            expect(await newCollection.toArray()).toEqual(arr.slice(0, -2));
        });
    });
    describe("method: takeUntil", () => {
        test("Should take all items until item is larger or equal to 3", async () => {
            const collection = new AsyncIterableCollection([1, 2, 3, 4]),
                newCollection = collection.takeUntil((item) => item >= 3);
            expect(await newCollection.toArray()).toEqual([1, 2]);
        });
        test("Should input correct indexes to predicate function", async () => {
            const collection = new AsyncIterableCollection([1, 2, 3, 4]),
                indexes: number[] = [];
            await collection
                .takeUntil((item, index) => {
                    indexes.push(index);
                    return item >= 3;
                })
                .toArray();
            expect(indexes).toEqual([0, 1, 2]);
        });
        test("Should work with async predicate function", async () => {
            const collection = new AsyncIterableCollection([1, 2, 3, 4]),
                // eslint-disable-next-line @typescript-eslint/require-await
                newCollection = collection.takeUntil(async (item) => item >= 3);
            expect(await newCollection.toArray()).toEqual([1, 2]);
        });
    });
    describe("method: takeWhile", () => {
        test("Should take all items while item is less than 3", async () => {
            const collection = new AsyncIterableCollection([1, 2, 3, 4]),
                newCollection = collection.takeWhile((item) => item < 3);
            expect(await newCollection.toArray()).toEqual([1, 2]);
        });
        test("Should input correct indexes to predicate function", async () => {
            const collection = new AsyncIterableCollection([1, 2, 3, 4]),
                indexes: number[] = [];
            await collection
                .takeWhile((item, index) => {
                    indexes.push(index);
                    return item < 3;
                })
                .toArray();
            expect(indexes).toEqual([0, 1, 2]);
        });
        test("Should work with async predicate function", async () => {
            const collection = new AsyncIterableCollection([1, 2, 3, 4]),
                // eslint-disable-next-line @typescript-eslint/require-await
                newCollection = collection.takeWhile(async (item) => item < 3);
            expect(await newCollection.toArray()).toEqual([1, 2]);
        });
    });
    describe("method: skip", () => {
        test("Should skip first item when input is 1", async () => {
            const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                collection = new AsyncIterableCollection(arr),
                newCollection = collection.skip(1);
            expect(await newCollection.toArray()).toEqual(arr.slice(1));
        });
        test("Should skip 5 first items when input is 5", async () => {
            const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                collection = new AsyncIterableCollection(arr),
                newCollection = collection.skip(5);
            expect(await newCollection.toArray()).toEqual(arr.slice(5));
        });
        test("Should skip 8 first items when input is -2", async () => {
            const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                collection = new AsyncIterableCollection(arr),
                newCollection = collection.skip(-2);
            expect(await newCollection.toArray()).toEqual(arr.slice(-2));
        });
    });
    describe("method: skipUntil", () => {
        test("Should skip all items until item is larger or equal to 3", async () => {
            const collection = new AsyncIterableCollection([1, 2, 3, 4]),
                newCollection = collection.skipUntil((item) => item >= 3);
            expect(await newCollection.toArray()).toEqual([3, 4]);
        });
        test("Should input correct indexes to predicate function", async () => {
            const collection = new AsyncIterableCollection([1, 2, 3, 4]),
                indexes: number[] = [];
            await collection
                .skipUntil((item, index) => {
                    indexes.push(index);
                    return item >= 3;
                })
                .toArray();
            expect(indexes).toEqual([0, 1, 2]);
        });
        test("Should work with async predicate function", async () => {
            const collection = new AsyncIterableCollection([1, 2, 3, 4]),
                // eslint-disable-next-line @typescript-eslint/require-await
                newCollection = collection.skipUntil(async (item) => item >= 3);
            expect(await newCollection.toArray()).toEqual([3, 4]);
        });
    });
    describe("method: skipWhile", () => {
        test("Should skipp all items while item is less than 3", async () => {
            const collection = new AsyncIterableCollection([1, 2, 3, 4]),
                newCollection = collection.skipWhile((item) => item <= 3);
            expect(await newCollection.toArray()).toEqual([4]);
        });
        test("Should input correct indexes to predicate function", async () => {
            const collection = new AsyncIterableCollection([1, 2, 3, 4]),
                indexes: number[] = [];
            await collection
                .skipWhile((item, index) => {
                    indexes.push(index);
                    return item <= 3;
                })
                .toArray();
            expect(indexes).toEqual([0, 1, 2, 3]);
        });
        test("Should work with async predicate function", async () => {
            const collection = new AsyncIterableCollection([1, 2, 3, 4]),
                // eslint-disable-next-line @typescript-eslint/require-await
                newCollection = collection.skipWhile(async (item) => item <= 3);
            expect(await newCollection.toArray()).toEqual([4]);
        });
    });
    describe("method: when", () => {
        test("Should append items when statement is true", async () => {
            const arr1 = ["a", "b", "c"],
                collection = new AsyncIterableCollection(arr1),
                arr2 = [1, 2, 3],
                newCollection = collection.when(true, (collection) =>
                    collection.append(arr2),
                );
            expect(await newCollection.toArray()).toEqual([...arr1, ...arr2]);
        });
        test("Should not append items when statement is false", async () => {
            const arr1 = ["a", "b", "c"],
                collection = new AsyncIterableCollection(arr1),
                arr2 = [1, 2, 3],
                newCollection = collection.when(false, (collection) =>
                    collection.append(arr2),
                );
            expect(await newCollection.toArray()).toEqual(arr1);
        });
        test("Should work with async modifier function", async () => {
            const arr1 = ["a", "b", "c"],
                collection = new AsyncIterableCollection(arr1),
                arr2 = [1, 2, 3],
                // eslint-disable-next-line @typescript-eslint/require-await
                newCollection = collection.when(true, async (collection) =>
                    collection.append(arr2),
                );
            expect(await newCollection.toArray()).toEqual([...arr1, ...arr2]);
        });
    });
    describe("method: whenEmpty", () => {
        test("Should append items when empty", async () => {
            const collection = new AsyncIterableCollection<string>([]),
                arr2 = [1, 2, 3],
                newCollection = collection.whenEmpty((collection) =>
                    collection.append(arr2),
                );
            expect(await newCollection.toArray()).toEqual(arr2);
        });
        test("Should not append items when not empty", async () => {
            const arr1 = ["a", "b", "c"],
                collection = new AsyncIterableCollection(arr1),
                arr2 = [1, 2, 3],
                newCollection = collection.whenEmpty((collection) =>
                    collection.append(arr2),
                );
            expect(await newCollection.toArray()).toEqual(arr1);
        });
        test("Should work with async modifier function", async () => {
            const collection = new AsyncIterableCollection<string>([]),
                arr2 = [1, 2, 3],
                // eslint-disable-next-line @typescript-eslint/require-await
                newCollection = collection.whenEmpty(async (collection) =>
                    collection.append(arr2),
                );
            expect(await newCollection.toArray()).toEqual(arr2);
        });
    });
    describe("method: whenNot", () => {
        test("Should append items when statement is false", async () => {
            const arr1 = ["a", "b", "c"],
                collection = new AsyncIterableCollection(arr1),
                arr2 = [1, 2, 3],
                newCollection = collection.whenNot(false, (collection) =>
                    collection.append(arr2),
                );
            expect(await newCollection.toArray()).toEqual([...arr1, ...arr2]);
        });
        test("Should not append items when statement is true", async () => {
            const arr1 = ["a", "b", "c"],
                collection = new AsyncIterableCollection(arr1),
                arr2 = [1, 2, 3],
                newCollection = collection.whenNot(true, (collection) =>
                    collection.append(arr2),
                );
            expect(await newCollection.toArray()).toEqual(arr1);
        });
        test("Should work with async modifier function", async () => {
            const arr1 = ["a", "b", "c"],
                collection = new AsyncIterableCollection(arr1),
                arr2 = [1, 2, 3],
                // eslint-disable-next-line @typescript-eslint/require-await
                newCollection = collection.whenNot(false, async (collection) =>
                    collection.append(arr2),
                );
            expect(await newCollection.toArray()).toEqual([...arr1, ...arr2]);
        });
    });
    describe("method: whenNotEmpty", () => {
        test("Should append items when not empty", async () => {
            const arr1 = ["a", "b", "c"],
                collection = new AsyncIterableCollection(arr1),
                arr2 = [1, 2, 3],
                newCollection = collection.whenNotEmpty((collection) =>
                    collection.append(arr2),
                );
            expect(await newCollection.toArray()).toEqual([...arr1, ...arr2]);
        });
        test("Should not append items when empty", async () => {
            const collection = new AsyncIterableCollection([]),
                arr2 = [1, 2, 3],
                newCollection = collection.whenNotEmpty((collection) =>
                    collection.append(arr2),
                );
            expect(await newCollection.toArray()).toEqual([]);
        });
        test("Should work with async modifier function", async () => {
            const arr1 = ["a", "b", "c"],
                collection = new AsyncIterableCollection(arr1),
                arr2 = [1, 2, 3],
                // eslint-disable-next-line @typescript-eslint/require-await
                newCollection = collection.whenNotEmpty(async (collection) =>
                    collection.append(arr2),
                );
            expect(await newCollection.toArray()).toEqual([...arr1, ...arr2]);
        });
    });
    describe("method: pipe", () => {
        test("Should pipe multiple functions", async () => {
            const collection = new AsyncIterableCollection([
                    "a",
                    "ab",
                    "abc",
                    "abcd",
                ]),
                a = await collection
                    .pipe((collection) =>
                        collection.map((item) =>
                            new AsyncIterableCollection(item).map((char) =>
                                char.charCodeAt(0),
                            ),
                        ),
                    )
                    .then((collection) =>
                        collection.pipe((collection) =>
                            collection.map((collection) => collection.sum()),
                        ),
                    )
                    .then((collection) =>
                        collection.pipe((collection) => collection.sum()),
                    );
            expect(a).toBeTypeOf("number");
        });
    });
    describe("method: tap", () => {
        test("Should change the original collection", async () => {
            const arr = ["a", "ab", "abc"],
                collection = new AsyncIterableCollection(arr).tap(
                    (collection) => collection.map((item) => item.length),
                );
            expect(await collection.toArray()).toEqual(arr);
        });
        test("Should work with async tap function", async () => {
            const arr = ["a", "ab", "abc"],
                collection = new AsyncIterableCollection(arr).tap(
                    // eslint-disable-next-line @typescript-eslint/require-await
                    (collection) => collection.map(async (item) => item.length),
                );
            expect(await collection.toArray()).toEqual(arr);
        });
    });
    describe("method: chunk", () => {
        test("Should group items into groups of size 1", async () => {
            const arr = [1, 2, 3, 4, 5, 6, 7, 8],
                collection = new AsyncIterableCollection(arr),
                newCollection = collection.chunk(1);
            expect(
                await newCollection.map((item) => item.toArray()).toArray(),
            ).toEqual(arr.map((item) => [item]));
        });
        test("Should group items into groups of size 4", async () => {
            const arr = [1, 2, 3, 4, 5, 6, 7, 8],
                collection = new AsyncIterableCollection(arr),
                newCollection = collection.chunk(4);
            expect(
                await newCollection.map((item) => item.toArray()).toArray(),
            ).toEqual([arr.slice(0, 4), arr.slice(4)]);
        });
    });
    describe("method: chunkWhile", () => {
        test("Should group items by checking if next item is the same as the current item", async () => {
            const collection = new AsyncIterableCollection(
                    "AABBCCCD".split(""),
                ),
                newCollection = collection.chunkWhile(
                    async (value, _index, chunk) =>
                        value === (await chunk.last()),
                );
            expect(
                await newCollection.map((item) => item.toArray()).toArray(),
            ).toEqual([["A", "A"], ["B", "B"], ["C", "C", "C"], ["D"]]);
        });
    });
    describe("method: split", () => {
        test("Should split items into 3 groups in equal size when size is 9", async () => {
            const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9],
                collection = new AsyncIterableCollection(arr),
                newCollection = collection.split(3);
            expect(
                await newCollection.map((item) => item.toArray()).toArray(),
            ).toEqual([arr.slice(0, 3), arr.slice(3, 6), arr.slice(6, 9)]);
        });
        test("Should split items into 3 groups where the first group have on item more when size is 10", async () => {
            const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                collection = new AsyncIterableCollection(arr),
                newCollection = collection.split(3);
            expect(
                await newCollection.map((item) => item.toArray()).toArray(),
            ).toEqual([arr.slice(0, 4), arr.slice(4, 7), arr.slice(7, 10)]);
        });
        test("Should split items into 3 groups where the first and second group have on item more when size is 11", async () => {
            const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
                collection = new AsyncIterableCollection(arr),
                newCollection = collection.split(3);
            expect(
                await newCollection.map((item) => item.toArray()).toArray(),
            ).toEqual([arr.slice(0, 4), arr.slice(4, 8), arr.slice(8, 11)]);
        });
    });
    describe("method: partition", () => {
        test("Should group items into strings and number", async () => {
            const arr = ["a", 1, "b", 2, "c", 3, "d", 4, "e", 5],
                collection = new AsyncIterableCollection(arr),
                newCollection = collection.partition(
                    (item) => typeof item === "string",
                );
            expect(
                await newCollection.map((item) => item.toArray()).toArray(),
            ).toEqual([
                arr.filter((item) => typeof item === "string"),
                arr.filter((item) => typeof item === "number"),
            ]);
        });
        test("Should input correct indexes to predicate function", async () => {
            const arr = ["a", 1, "b", 2, "c", 3, "d", 4, "e", 5],
                collection = new AsyncIterableCollection(arr),
                indexes: number[] = [];
            await collection
                .partition((item, index) => {
                    indexes.push(index);
                    return typeof item === "string";
                })
                .toArray();
            expect(indexes).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
        });
        test("Should work with async predicate function", async () => {
            const arr = ["a", 1, "b", 2, "c", 3, "d", 4, "e", 5],
                collection = new AsyncIterableCollection(arr),
                newCollection = collection.partition(
                    // eslint-disable-next-line @typescript-eslint/require-await
                    async (item) => typeof item === "string",
                );
            expect(
                await newCollection.map((item) => item.toArray()).toArray(),
            ).toEqual([
                arr.filter((item) => typeof item === "string"),
                arr.filter((item) => typeof item === "number"),
            ]);
        });
    });
    describe("method: sliding", () => {
        test("Should group items into 7 groups when size is 2", async () => {
            const collection = new AsyncIterableCollection([
                    "a",
                    "b",
                    "c",
                    "d",
                    "e",
                    "f",
                    "g",
                    "h",
                ]),
                newCollection = collection.sliding({ chunkSize: 2 });
            expect(
                await newCollection.map((item) => item.toArray()).toArray(),
            ).toEqual([
                ["a", "b"],
                ["b", "c"],
                ["c", "d"],
                ["d", "e"],
                ["e", "f"],
                ["f", "g"],
                ["g", "h"],
            ]);
        });
        test("Should group items into 4 groups when size is 3", async () => {
            const collection = new AsyncIterableCollection([
                    "a",
                    "b",
                    "c",
                    "d",
                    "e",
                    "f",
                    "g",
                    "h",
                ]),
                newCollection = collection.sliding({ chunkSize: 3 });
            expect(
                await newCollection.map((item) => item.toArray()).toArray(),
            ).toEqual([
                ["a", "b", "c"],
                ["c", "d", "e"],
                ["e", "f", "g"],
                ["g", "h"],
            ]);
        });
        test("Should group items into 6 groups when size is 3 and step is 1", async () => {
            const collection = new AsyncIterableCollection([
                    "a",
                    "b",
                    "c",
                    "d",
                    "e",
                    "f",
                    "g",
                    "h",
                ]),
                newCollection = collection.sliding({ chunkSize: 3, step: 1 });
            expect(
                await newCollection.map((item) => item.toArray()).toArray(),
            ).toEqual([
                ["a", "b", "c"],
                ["b", "c", "d"],
                ["c", "d", "e"],
                ["d", "e", "f"],
                ["e", "f", "g"],
                ["f", "g", "h"],
            ]);
        });
        test("Should group items into 6 groups when size is 4 and step is 2", async () => {
            const collection = new AsyncIterableCollection([
                    "a",
                    "b",
                    "c",
                    "d",
                    "e",
                    "f",
                    "g",
                    "h",
                ]),
                newCollection = collection.sliding({ chunkSize: 4, step: 2 });
            expect(
                await newCollection.map((item) => item.toArray()).toArray(),
            ).toEqual([
                ["a", "b", "c", "d"],
                ["c", "d", "e", "f"],
                ["e", "f", "g", "h"],
            ]);
        });
        test("Should group items into 4 groups when size is 1 and step is 2", async () => {
            const collection = new AsyncIterableCollection([
                    "a",
                    "b",
                    "c",
                    "d",
                    "e",
                    "f",
                    "g",
                    "h",
                ]),
                newCollection = collection.sliding({ chunkSize: 1, step: 2 });
            expect(
                await newCollection.map((item) => item.toArray()).toArray(),
            ).toEqual([["a"], ["c"], ["e"], ["g"]]);
        });
        test("Should group items into 3 groups when size is 1 and step is 3", async () => {
            const collection = new AsyncIterableCollection([
                    "a",
                    "b",
                    "c",
                    "d",
                    "e",
                    "f",
                    "g",
                    "h",
                ]),
                newCollection = collection.sliding({ chunkSize: 1, step: 3 });
            expect(
                await newCollection.map((item) => item.toArray()).toArray(),
            ).toEqual([["a"], ["d"], ["g"]]);
        });
        test("Should group items into 2 groups when size is 1 and step is 4", async () => {
            const collection = new AsyncIterableCollection([
                    "a",
                    "b",
                    "c",
                    "d",
                    "e",
                    "f",
                    "g",
                    "h",
                ]),
                newCollection = collection.sliding({ chunkSize: 1, step: 3 });
            expect(
                await newCollection.map((item) => item.toArray()).toArray(),
            ).toEqual([["a"], ["d"], ["g"]]);
        });
        test("Should group items into 1 groups when size is 2 and step is 1 and array size is 2", async () => {
            const collection = new AsyncIterableCollection(["a", "b"]),
                newCollection = collection.sliding({ chunkSize: 2, step: 1 });
            expect(
                await newCollection.map((item) => item.toArray()).toArray(),
            ).toEqual([["a", "b"]]);
        });
        test("Should group items into 1 groups when size is 2 and step is 2 and array size is 2", async () => {
            const collection = new AsyncIterableCollection(["a", "b"]),
                newCollection = collection.sliding({ chunkSize: 2, step: 2 });
            expect(
                await newCollection.map((item) => item.toArray()).toArray(),
            ).toEqual([["a", "b"]]);
        });
        test("Should group items into 1 groups when size is 3 and step is 2 and array size is 2", async () => {
            const collection = new AsyncIterableCollection(["a", "b"]),
                newCollection = collection.sliding({ chunkSize: 2, step: 3 });
            expect(
                await newCollection.map((item) => item.toArray()).toArray(),
            ).toEqual([["a", "b"]]);
        });
        test("Should group items into 1 groups when size is 2 and step is 3 and array size is 2", async () => {
            const collection = new AsyncIterableCollection(["a", "b"]),
                newCollection = collection.sliding({ chunkSize: 3, step: 2 });
            expect(
                await newCollection.map((item) => item.toArray()).toArray(),
            ).toEqual([["a", "b"]]);
        });
        test("Should return empty collection when size is 1", async () => {
            const collection = new AsyncIterableCollection([
                    "a",
                    "b",
                    "c",
                    "d",
                    "e",
                    "f",
                    "g",
                    "h",
                ]),
                newCollection = collection.sliding({ chunkSize: 1 });
            expect(await newCollection.toArray()).toEqual([]);
        });
    });
    describe("method: groupBy", () => {
        test("Should group by with default map function", async () => {
            const arr = ["a", "b", "c", "a", "b", "c", "b", "d"],
                collection = new AsyncIterableCollection(arr),
                newCollection = collection.groupBy();
            expect(
                await newCollection
                    .map(
                        async ([key, item]): Promise<
                            RecordItem<string, string[]>
                        > => [key, await item.toArray()],
                    )
                    .toArray(),
            ).toEqual([
                ["a", arr.filter((item) => item === "a")],
                ["b", arr.filter((item) => item === "b")],
                ["c", arr.filter((item) => item === "c")],
                ["d", arr.filter((item) => item === "d")],
            ]);
        });
        test("Should group by with custom map function", async () => {
            type Person = {
                name: string;
                age: number;
            };
            const arr: Person[] = [
                    {
                        name: "Abra",
                        age: 20,
                    },
                    {
                        name: "Asmail",
                        age: 34,
                    },
                    {
                        name: "Ibra",
                        age: 50,
                    },
                    {
                        name: "Asmail",
                        age: 21,
                    },
                    {
                        name: "Abra",
                        age: 32,
                    },
                    {
                        name: "Abra",
                        age: 67,
                    },
                ],
                collection = new AsyncIterableCollection<Person>(arr),
                newCollection = collection.groupBy({
                    selectFn(item) {
                        return item.name;
                    },
                });
            expect(
                await newCollection
                    .map(
                        async ([key, item]): Promise<
                            RecordItem<string, Person[]>
                        > => [key, await item.toArray()],
                    )
                    .toArray(),
            ).toEqual([
                ["Abra", arr.filter((item) => item.name === "Abra")],
                ["Asmail", arr.filter((item) => item.name === "Asmail")],
                ["Ibra", arr.filter((item) => item.name === "Ibra")],
            ]);
        });
        test("Should input correct indexes to predicate function", async () => {
            const collection = new AsyncIterableCollection([
                    "a",
                    "b",
                    "c",
                    "a",
                    "b",
                    "c",
                    "b",
                    "d",
                ]),
                indexes: number[] = [];
            await collection
                .groupBy({
                    selectFn: (item, index) => {
                        indexes.push(index);
                        return item;
                    },
                })
                .toArray();
            expect(indexes).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
        });
        test("Should work with async map function", async () => {
            type Person = {
                name: string;
                age: number;
            };
            const arr: Person[] = [
                    {
                        name: "Abra",
                        age: 20,
                    },
                    {
                        name: "Asmail",
                        age: 34,
                    },
                    {
                        name: "Ibra",
                        age: 50,
                    },
                    {
                        name: "Asmail",
                        age: 21,
                    },
                    {
                        name: "Abra",
                        age: 32,
                    },
                    {
                        name: "Abra",
                        age: 67,
                    },
                ],
                collection = new AsyncIterableCollection<Person>(arr),
                newCollection = collection.groupBy({
                    // eslint-disable-next-line @typescript-eslint/require-await
                    selectFn: async (item) => {
                        return item.name;
                    },
                });
            expect(
                await newCollection
                    .map(
                        async ([key, item]): Promise<
                            RecordItem<string, Person[]>
                        > => [key, await item.toArray()],
                    )
                    .toArray(),
            ).toEqual([
                ["Abra", arr.filter((item) => item.name === "Abra")],
                ["Asmail", arr.filter((item) => item.name === "Asmail")],
                ["Ibra", arr.filter((item) => item.name === "Ibra")],
            ]);
        });
    });
    describe("method: countBy", () => {
        test("Should count by with default map function", async () => {
            const arr = ["a", "b", "c", "a", "b", "c", "b", "d"],
                collection = new AsyncIterableCollection(arr),
                newCollection = collection.countBy();
            expect(await newCollection.toArray()).toEqual([
                ["a", arr.filter((item) => item === "a").length],
                ["b", arr.filter((item) => item === "b").length],
                ["c", arr.filter((item) => item === "c").length],
                ["d", arr.filter((item) => item === "d").length],
            ]);
        });
        test("Should count by with custom map function", async () => {
            type Person = {
                name: string;
                age: number;
            };
            const arr: Person[] = [
                    {
                        name: "Abra",
                        age: 20,
                    },
                    {
                        name: "Asmail",
                        age: 34,
                    },
                    {
                        name: "Ibra",
                        age: 50,
                    },
                    {
                        name: "Asmail",
                        age: 21,
                    },
                    {
                        name: "Abra",
                        age: 32,
                    },
                    {
                        name: "Abra",
                        age: 67,
                    },
                ],
                collection = new AsyncIterableCollection<Person>(arr),
                newCollection = collection.countBy({
                    selectFn(item) {
                        return item.name;
                    },
                });
            expect(await newCollection.toArray()).toEqual([
                ["Abra", arr.filter((item) => item.name === "Abra").length],
                ["Asmail", arr.filter((item) => item.name === "Asmail").length],
                ["Ibra", arr.filter((item) => item.name === "Ibra").length],
            ]);
        });
        test("Should input correct indexes to predicate function", async () => {
            const collection = new AsyncIterableCollection([
                    "a",
                    "b",
                    "c",
                    "a",
                    "b",
                    "c",
                    "b",
                    "d",
                ]),
                indexes: number[] = [];
            await collection
                .countBy({
                    selectFn: (item, index) => {
                        indexes.push(index);
                        return item;
                    },
                })
                .toArray();
            expect(indexes).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
        });
    });
    describe("method: unique", () => {
        test("Should return unique items with default map function", async () => {
            const collection = new AsyncIterableCollection([
                    "a",
                    "b",
                    "c",
                    "a",
                    "b",
                    "c",
                ]),
                newCollection = collection.unique();
            expect(await newCollection.toArray()).toEqual(["a", "b", "c"]);
        });
        test("Should return unique items with custom map function", async () => {
            const collection = new AsyncIterableCollection([
                    "a",
                    "bb",
                    "cc",
                    "acc",
                    "b",
                    "cccc",
                ]),
                newCollection = collection.unique({
                    selectFn(item) {
                        return item.length;
                    },
                });
            expect(await newCollection.toArray()).toEqual([
                "a",
                "bb",
                "acc",
                "cccc",
            ]);
        });
        test("Should input correct indexes to predicate function", async () => {
            const collection = new AsyncIterableCollection([
                    "a",
                    "b",
                    "c",
                    "a",
                    "b",
                    "c",
                    "b",
                    "d",
                ]),
                indexes: number[] = [];
            await collection
                .unique({
                    selectFn: (item, index) => {
                        indexes.push(index);
                        return item;
                    },
                })
                .toArray();
            expect(indexes).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
        });
        test("Should work with async predicate function", async () => {
            const collection = new AsyncIterableCollection([
                    "a",
                    "bb",
                    "cc",
                    "acc",
                    "b",
                    "cccc",
                ]),
                newCollection = collection.unique({
                    // eslint-disable-next-line @typescript-eslint/require-await
                    selectFn: async (item) => {
                        return item.length;
                    },
                });
            expect(await newCollection.toArray()).toEqual([
                "a",
                "bb",
                "acc",
                "cccc",
            ]);
        });
    });
    describe("method: difference", () => {
        test("Should remove all elements matches the given iterable elements with default selectFn function", async () => {
            const collection = new AsyncIterableCollection([1, 2, 2, 3, 4, 5]);
            const difference = collection.difference([2, 4, 6, 8]);
            expect(await difference.toArray()).toEqual([1, 3, 5]);
        });
        test("Should remove all elements matches the given iterable elements with custom selectFn function", async () => {
            type Product = {
                name: string;
                brand: string;
                type: string;
            };
            const items: Product[] = [
                { name: "iPhone 6", brand: "Apple", type: "phone" },
                { name: "iPhone 5", brand: "Apple", type: "phone" },
                { name: "Apple Watch", brand: "Apple", type: "watch" },
                { name: "Galaxy S6", brand: "Samsung", type: "phone" },
                { name: "Galaxy Gear", brand: "Samsung", type: "watch" },
            ];
            const collection = new AsyncIterableCollection<Product>(items);
            const difference = collection.difference(
                [{ name: "Apple Watch", brand: "Apple", type: "watch" }],
                (product) => product.type,
            );
            expect(await difference.toArray()).toStrictEqual([
                { name: "iPhone 6", brand: "Apple", type: "phone" },
                { name: "iPhone 5", brand: "Apple", type: "phone" },
                { name: "Galaxy S6", brand: "Samsung", type: "phone" },
            ]);
        });
        test("Should remove all elements matches the given AsyncIterable", async () => {
            const collection = new AsyncIterableCollection([1, 2, 3, 4, 5]);
            const asyncIterable: AsyncIterable<number> = {
                // eslint-disable-next-line @typescript-eslint/require-await
                async *[Symbol.asyncIterator](): AsyncIterator<number> {
                    yield 2;
                    yield 4;
                    yield 6;
                    yield 8;
                },
            };
            const difference = collection.difference(asyncIterable);
            expect(await difference.toArray()).toEqual([1, 3, 5]);
        });
    });
    describe("method: repeat", () => {
        test("Should repeath all elements 2 times when input is 3", async () => {
            const arr = [1, 2, 3];
            const collection = new AsyncIterableCollection(arr);
            const newCollection = collection.repeat(4);
            expect(await newCollection.toArray()).toEqual([
                ...arr,
                ...arr,
                ...arr,
            ]);
        });
    });
    describe("method: padStart", () => {
        test(`Should retuern "foofoofabc" when maxLength is 10 and fillItems "foo"`, async () => {
            const result = await new AsyncIterableCollection("abc")
                .padStart(10, "foo")
                .join({
                    seperator: "",
                });
            expect(result).toBe("foofoofabc");
        });
        test(`Should retuern "123abc" when maxLength is 6 and fillItems "abc"`, async () => {
            const result = await new AsyncIterableCollection("abc")
                .padStart(6, "123465")
                .join({ seperator: "" });
            expect(result).toBe("123abc");
        });
        test(`Should retuern "00000abc" when maxLength is 8 and fillItems "00000abc"`, async () => {
            const result = await new AsyncIterableCollection("abc")
                .padStart(8, "0")
                .join({ seperator: "" });
            expect(result).toBe("00000abc");
        });
        test(`Should retuern "abc" when maxLength is 1 and fillItems "_"`, async () => {
            const result = await new AsyncIterableCollection("abc")
                .padStart(1, "_")
                .join({ seperator: "" });
            expect(result).toBe("abc");
        });
        test("Should work with AsyncIterable", async () => {
            const asyncIterable: AsyncIterable<string> = {
                // eslint-disable-next-line @typescript-eslint/require-await
                async *[Symbol.asyncIterator](): AsyncIterator<string> {
                    yield "f";
                    yield "o";
                    yield "o";
                },
            };
            const result = await new AsyncIterableCollection("abc")
                .padStart(10, asyncIterable)
                .join({
                    seperator: "",
                });
            expect(result).toBe("foofoofabc");
        });
    });
    describe("method: padEnd", () => {
        test(`Should retuern "abcfoofoof" when maxLength is 10 and fillItems "foo"`, async () => {
            const result = await new AsyncIterableCollection("abc")
                .padEnd(10, "foo")
                .join({
                    seperator: "",
                });
            expect(result).toBe("abcfoofoof");
        });
        test(`Should retuern "abc123" when maxLength is 6 and fillItems "abc"`, async () => {
            const result = await new AsyncIterableCollection("abc")
                .padEnd(6, "123465")
                .join({ seperator: "" });
            expect(result).toBe("abc123");
        });
        test(`Should retuern "abc00000" when maxLength is 8 and fillItems "00000abc"`, async () => {
            const result = await new AsyncIterableCollection("abc")
                .padEnd(8, "0")
                .join({ seperator: "" });
            expect(result).toBe("abc00000");
        });
        test(`Should retuern "abc" when maxLength is 1 and fillItems "_"`, async () => {
            const result = await new AsyncIterableCollection("abc")
                .padEnd(1, "_")
                .join({ seperator: "" });
            expect(result).toBe("abc");
        });
        test("Should work with AsyncIterable", async () => {
            const asyncIterable: AsyncIterable<string> = {
                // eslint-disable-next-line @typescript-eslint/require-await
                async *[Symbol.asyncIterator](): AsyncIterator<string> {
                    yield "f";
                    yield "o";
                    yield "o";
                },
            };
            const result = await new AsyncIterableCollection("abc")
                .padEnd(10, asyncIterable)
                .join({
                    seperator: "",
                });
            expect(result).toBe("abcfoofoof");
        });
    });
    describe("method: slice", () => {
        test("Should return [1] when start is 0, end is 1 and array is [1, 2, 3, 4, 5]", async () => {
            const arr = [1, 2, 3, 4, 5];
            const collection = new AsyncIterableCollection(arr);
            const newCollection = collection.slice({ start: 0, end: 1 });
            expect(await newCollection.toArray()).toEqual(arr.slice(0, 1));
        });
        test("Should return [4, 5] when start is -2 and array is [1, 2, 3, 4, 5]", async () => {
            const arr = [1, 2, 3, 4, 5];
            const collection = new AsyncIterableCollection(arr);
            const newCollection = collection.slice({ start: -2 });
            expect(await newCollection.toArray()).toEqual(arr.slice(-2));
        });
        test("Should return [1, 2, 3, 4] when start is 0, end is -1 and array is [1, 2, 3, 4, 5]", async () => {
            const arr = [1, 2, 3, 4, 5];
            const collection = new AsyncIterableCollection(arr);
            const newCollection = collection.slice({ start: 0, end: -1 });
            expect(await newCollection.toArray()).toEqual(arr.slice(0, -1));
        });
        test("Should return [3, 4] when start is 2, end is -1 and array is [1, 2, 3, 4, 5]", async () => {
            const arr = [1, 2, 3, 4, 5];
            const collection = new AsyncIterableCollection(arr);
            const newCollection = collection.slice({ start: 2, end: -1 });
            expect(await newCollection.toArray()).toEqual(arr.slice(2, -1));
        });
        test("Should return [2, 3, 4] when start is 1, end is 4 and array is [1, 2, 3, 4, 5]", async () => {
            const arr = [1, 2, 3, 4, 5];
            const collection = new AsyncIterableCollection(arr);
            const newCollection = collection.slice({ start: 1, end: 4 });
            expect(await newCollection.toArray()).toEqual(arr.slice(1, 4));
        });
        test("Should return [3, 4] when start is 2, end is 4 and array is [1, 2, 3, 4, 5]", async () => {
            const arr = [1, 2, 3, 4, 5];
            const collection = new AsyncIterableCollection(arr);
            const newCollection = collection.slice({ start: 2, end: 4 });
            expect(await newCollection.toArray()).toEqual(arr.slice(2, 4));
        });
    });
    describe("method: prepend", () => {
        test("Should prepend Iterable", async () => {
            const arr1 = ["a", "b", "c"],
                collection = new AsyncIterableCollection(arr1),
                arr2 = [1, 2, 3],
                prependedCollection = collection.prepend(arr2);
            expect(await prependedCollection.toArray()).toEqual([
                ...arr2,
                ...arr1,
            ]);
        });
        test("Should prepend AsyncIterable", async () => {
            const arr1 = ["a", "b", "c"],
                collection = new AsyncIterableCollection(arr1),
                arr2 = [1, 2, 3];
            const asyncIterable: AsyncIterable<number> = {
                // eslint-disable-next-line @typescript-eslint/require-await
                async *[Symbol.asyncIterator](): AsyncIterator<number> {
                    yield* arr2;
                },
            };
            const prependedCollection = collection.prepend(asyncIterable);
            expect(await prependedCollection.toArray()).toEqual([
                ...arr2,
                ...arr1,
            ]);
        });
    });
    describe("method: append", () => {
        test("Should append Iterable", async () => {
            const arr1 = ["a", "b", "c"],
                collection = new AsyncIterableCollection(arr1),
                arr2 = [1, 2, 3],
                appendedCollection = collection.append(arr2);
            expect(await appendedCollection.toArray()).toEqual([
                ...arr1,
                ...arr2,
            ]);
        });
        test("Should append AsyncIterable", async () => {
            const arr1 = ["a", "b", "c"],
                collection = new AsyncIterableCollection(arr1),
                arr2 = [1, 2, 3];
            const asyncIterable: AsyncIterable<number> = {
                // eslint-disable-next-line @typescript-eslint/require-await
                async *[Symbol.asyncIterator](): AsyncIterator<number> {
                    yield* arr2;
                },
            };
            const appendedCollection = collection.append(asyncIterable);
            expect(await appendedCollection.toArray()).toEqual([
                ...arr1,
                ...arr2,
            ]);
        });
    });
    describe("method: insertBefore", () => {
        test("Should insert Iterable before first item", async () => {
            const arr1 = ["a", "b", "c"],
                collection = new AsyncIterableCollection(arr1),
                arr2 = [1, 2, 3],
                newCollection = collection.insertBefore(
                    (item) => item === "a",
                    arr2,
                );
            expect(await newCollection.toArray()).toEqual([...arr2, ...arr1]);
        });
        test("Should insert Iterable before last item", async () => {
            const arr1 = ["a", "b", "c"],
                collection = new AsyncIterableCollection(arr1),
                arr2 = [1, 2, 3],
                newCollection = collection.insertBefore(
                    (item) => item === "c",
                    arr2,
                );
            expect(await newCollection.toArray()).toEqual([
                ...arr1.slice(0, -1),
                ...arr2,
                ...arr1.slice(-1),
            ]);
        });
        test("Should not insert Iterable if filter item not found", async () => {
            const arr1 = ["a", "b", "c"],
                collection = new AsyncIterableCollection(arr1),
                arr2 = [1, 2, 3],
                newCollection = collection.insertBefore(
                    (item) => item === "d",
                    arr2,
                );
            expect(await newCollection.toArray()).toEqual(arr1);
        });
        test("Should insert AsyncIterable before first item", async () => {
            const arr1 = ["a", "b", "c"],
                collection = new AsyncIterableCollection(arr1),
                arr2 = [1, 2, 3];
            const asyncIterable: AsyncIterable<number> = {
                // eslint-disable-next-line @typescript-eslint/require-await
                async *[Symbol.asyncIterator](): AsyncIterator<number> {
                    yield* arr2;
                },
            };
            const newCollection = collection.insertBefore(
                (item) => item === "a",
                asyncIterable,
            );
            expect(await newCollection.toArray()).toEqual([...arr2, ...arr1]);
        });
    });
    describe("method: insertAfter", () => {
        test("Should insert Iterable after last item", async () => {
            const arr1 = ["a", "b", "c"],
                collection = new AsyncIterableCollection(arr1),
                arr2 = [1, 2, 3],
                newCollection = collection.insertAfter(
                    (item) => item === "c",
                    arr2,
                );
            expect(await newCollection.toArray()).toEqual([...arr1, ...arr2]);
        });
        test("Should insert Iterable after first item", async () => {
            const arr1 = ["a", "b", "c"],
                collection = new AsyncIterableCollection(arr1),
                arr2 = [1, 2, 3],
                newCollection = collection.insertAfter(
                    (item) => item === "a",
                    arr2,
                );
            expect(await newCollection.toArray()).toEqual([
                ...arr1.slice(0, 1),
                ...arr2,
                ...arr1.slice(-2),
            ]);
        });
        test("Should not insert Iterable if filter item not found", async () => {
            const arr1 = ["a", "b", "c"],
                collection = new AsyncIterableCollection(arr1),
                arr2 = [1, 2, 3],
                newCollection = collection.insertAfter(
                    (item) => item === "d",
                    arr2,
                );
            expect(await newCollection.toArray()).toEqual(arr1);
        });
        test("Should insert AsyncIterable after last item", async () => {
            const arr1 = ["a", "b", "c"],
                collection = new AsyncIterableCollection(arr1),
                arr2 = [1, 2, 3];
            const asyncIterable: AsyncIterable<number> = {
                // eslint-disable-next-line @typescript-eslint/require-await
                async *[Symbol.asyncIterator](): AsyncIterator<number> {
                    yield* arr2;
                },
            };
            const newCollection = collection.insertAfter(
                (item) => item === "c",
                asyncIterable,
            );
            expect(await newCollection.toArray()).toEqual([...arr1, ...arr2]);
        });
    });
    describe("method: crossJoin", () => {
        test(`Should return 4 combinations when input Iterable is [1, 2] and ["a", "b"]`, async () => {
            const collection = new AsyncIterableCollection([1, 2]);
            const matrix = collection.crossJoin(["a", "b"]);

            expect(
                await matrix
                    .map((collection) => collection.toArray())
                    .toArray(),
            ).toEqual([
                [1, "a"],
                [1, "b"],
                [2, "a"],
                [2, "b"],
            ]);
        });
        test("Should work with AsyncIterables", async () => {
            const collection = new AsyncIterableCollection([1, 2]);
            const asyncIterable: AsyncIterable<string> = {
                // eslint-disable-next-line @typescript-eslint/require-await
                async *[Symbol.asyncIterator](): AsyncIterator<string> {
                    yield "a";
                    yield "b";
                },
            };
            const matrix = collection.crossJoin(asyncIterable);

            expect(
                await matrix
                    .map((collection) => collection.toArray())
                    .toArray(),
            ).toEqual([
                [1, "a"],
                [1, "b"],
                [2, "a"],
                [2, "b"],
            ]);
        });
        test(`Should return 8 combinations when input Iterable is [1, 2], ["a", "b"] and ["I", "II"]`, async () => {
            const collection = new AsyncIterableCollection([1, 2]);
            const matrix = collection.crossJoin(["a", "b"], ["I", "II"]);
            expect(
                await matrix
                    .map((collection) => collection.toArray())
                    .toArray(),
            ).toEqual([
                [1, "a", "I"],
                [1, "a", "II"],
                [1, "b", "I"],
                [1, "b", "II"],
                [2, "a", "I"],
                [2, "a", "II"],
                [2, "b", "I"],
                [2, "b", "II"],
            ]);
        });
    });
    describe("method: zip", () => {
        test("Should zip Iterable", async () => {
            const arr1 = ["a", "b", "c"],
                collection = new AsyncIterableCollection(arr1),
                arr2 = [1, 2, 3],
                newCollection = collection.zip(arr2);
            expect(await newCollection.toArray()).toEqual([
                [arr1[0], arr2[0]],
                [arr1[1], arr2[1]],
                [arr1[2], arr2[2]],
            ]);
        });
        test("Should zip AsyncIterable", async () => {
            const arr1 = ["a", "b", "c"],
                collection = new AsyncIterableCollection(arr1),
                arr2 = [1, 2, 3];
            const asyncIterable: AsyncIterable<number> = {
                // eslint-disable-next-line @typescript-eslint/require-await
                async *[Symbol.asyncIterator](): AsyncIterator<number> {
                    yield* arr2;
                },
            };
            const newCollection = collection.zip(asyncIterable);
            expect(await newCollection.toArray()).toEqual([
                [arr1[0], arr2[0]],
                [arr1[1], arr2[1]],
                [arr1[2], arr2[2]],
            ]);
        });
        test("Should have the length of collection", async () => {
            const arr1 = ["a", "b", "c", "d"],
                collection = new AsyncIterableCollection(arr1),
                arr2 = [1, 2, 3],
                newCollection = collection.zip(arr2);
            expect(await newCollection.toArray()).toEqual([
                [arr1[0], arr2[0]],
                [arr1[1], arr2[1]],
                [arr1[2], arr2[2]],
            ]);
        });
        test("Should have the length of input Iterable", async () => {
            const arr1 = ["a", "b", "c"],
                collection = new AsyncIterableCollection(arr1),
                arr2 = [1, 2, 3, 4],
                newCollection = collection.zip(arr2);
            expect(await newCollection.toArray()).toEqual([
                [arr1[0], arr2[0]],
                [arr1[1], arr2[1]],
                [arr1[2], arr2[2]],
            ]);
        });
    });
    describe("method: sort", () => {
        test("Sort numbers from smallest to largest with custom comparator function", async () => {
            const arr = [-1, 2, 1, -3, 4, 20, 15, -5, -3],
                collection = new AsyncIterableCollection(arr),
                newCollection = collection.sort((a, b) => a - b);
            expect(await newCollection.toArray()).toEqual(
                [...arr].sort((a, b) => a - b),
            );
        });
        test("Sort numbers from smallest to largest with default compartor function", async () => {
            const arr = [-1, 2, 1, -3, 4, 20, 15, -5, -3],
                collection = new AsyncIterableCollection(arr),
                newCollection = collection.sort();
            expect(await newCollection.toArray()).toEqual([...arr].sort());
        });
    });
    describe("method: reverse", () => {
        test("Should reverse Iterable", async () => {
            const arr = ["a", "b", "c", "d", "e", "f"],
                collection = new AsyncIterableCollection(arr),
                newCollection = collection.reverse();
            expect(await newCollection.toArray()).toEqual([...arr].reverse());
        });
    });
    describe("method: first", () => {
        test("Should return first item that matches the predicate function", async () => {
            type Person = {
                name: string;
                age: number;
            };
            const persons: Person[] = [
                    {
                        name: "Joe",
                        age: 20,
                    },
                    {
                        name: "Jhon",
                        age: 23,
                    },
                    {
                        name: "Joe",
                        age: 30,
                    },
                    {
                        name: "Jhon",
                        age: 50,
                    },
                ],
                collection = new AsyncIterableCollection(persons),
                item = await collection.first({
                    predicateFn: (person) => person.name === "Joe",
                });
            expect(item).toEqual(persons[0]);
        });
        test("Should return first item when found", async () => {
            const collection = new AsyncIterableCollection([1, 2, 3, 4, 5]),
                item = await collection.first();
            expect(item).toBe(1);
        });
        test("Should return null when item not found", async () => {
            const collection = new AsyncIterableCollection([1, 2, 3, 4, 5]),
                item = await collection.first({
                    predicateFn: (item) => item === 6,
                });
            expect(item).toBe(null);
        });
        test("Should input correct indexes to predicate function", async () => {
            const collection = new AsyncIterableCollection([1, 2, 3, 4, 5]),
                indexes: number[] = [];
            await collection.first({
                predicateFn: (item, index) => {
                    indexes.push(index);
                    return item === 6;
                },
            });
            expect(indexes).toEqual([0, 1, 2, 3, 4]);
        });
        test("Should return the same value when called more than 1 times", async () => {
            const collection = new AsyncIterableCollection([1, 2, 3, 4, 5]);
            expect(await collection.first()).toBe(1);
            expect(await collection.first()).toBe(1);
        });
        test("Should work with async predicate function", async () => {
            type Person = {
                name: string;
                age: number;
            };
            const persons: Person[] = [
                    {
                        name: "Joe",
                        age: 20,
                    },
                    {
                        name: "Jhon",
                        age: 23,
                    },
                    {
                        name: "Joe",
                        age: 30,
                    },
                    {
                        name: "Jhon",
                        age: 50,
                    },
                ],
                collection = new AsyncIterableCollection(persons),
                item = await collection.first({
                    // eslint-disable-next-line @typescript-eslint/require-await
                    predicateFn: async (person) => person.name === "Joe",
                });
            expect(item).toEqual(persons[0]);
        });
    });
    describe("method: firstOr", () => {
        test("Should return first item that matches the predicate function", async () => {
            type Person = {
                name: string;
                age: number;
            };
            const persons: Person[] = [
                    {
                        name: "Joe",
                        age: 20,
                    },
                    {
                        name: "Jhon",
                        age: 23,
                    },
                    {
                        name: "Joe",
                        age: 30,
                    },
                    {
                        name: "Jhon",
                        age: 50,
                    },
                ],
                collection = new AsyncIterableCollection(persons),
                item = await collection.firstOr({
                    defaultValue: null,
                    predicateFn: (person) => person.name === "Joe",
                });
            expect(item).toEqual(persons[0]);
        });
        test("Should return first item when found", async () => {
            const collection = new AsyncIterableCollection([1, 2, 3, 4, 5]),
                item = await collection.firstOr({
                    defaultValue: "a",
                });
            expect(item).toBe(1);
        });
        test("Should return default value when item not found", async () => {
            const collection = new AsyncIterableCollection([1, 2, 3, 4, 5]),
                item = await collection.firstOr({
                    defaultValue: "a",
                    predicateFn: (item) => item === 6,
                });
            expect(item).toBe("a");
        });
        test("Should input correct indexes to predicate function", async () => {
            const collection = new AsyncIterableCollection([1, 2, 3, 4, 5]),
                indexes: number[] = [];
            await collection.firstOr({
                defaultValue: null,
                predicateFn: (item, index) => {
                    indexes.push(index);
                    return item === 6;
                },
            });
            expect(indexes).toEqual([0, 1, 2, 3, 4]);
        });
        test("Should return the same value when called more than 1 times", async () => {
            const collection = new AsyncIterableCollection([1, 2, 3, 4, 5]);
            expect(
                await collection.firstOr({
                    defaultValue: "a",
                }),
            ).toBe(1);
            expect(
                await collection.firstOr({
                    defaultValue: "a",
                }),
            ).toBe(1);
        });
        test("Should work with async predicate function", async () => {
            type Person = {
                name: string;
                age: number;
            };
            const persons: Person[] = [
                    {
                        name: "Joe",
                        age: 20,
                    },
                    {
                        name: "Jhon",
                        age: 23,
                    },
                    {
                        name: "Joe",
                        age: 30,
                    },
                    {
                        name: "Jhon",
                        age: 50,
                    },
                ],
                collection = new AsyncIterableCollection(persons),
                item = await collection.firstOr({
                    defaultValue: null,
                    // eslint-disable-next-line @typescript-eslint/require-await
                    predicateFn: async (person) => person.name === "Joe",
                });
            expect(item).toEqual(persons[0]);
        });
    });
    describe("method: firstOrFail", () => {
        test("Should return first item that matches the predicate function", async () => {
            type Person = {
                name: string;
                age: number;
            };
            const persons: Person[] = [
                    {
                        name: "Joe",
                        age: 20,
                    },
                    {
                        name: "Jhon",
                        age: 23,
                    },
                    {
                        name: "Joe",
                        age: 30,
                    },
                    {
                        name: "Jhon",
                        age: 50,
                    },
                ],
                collection = new AsyncIterableCollection(persons),
                item = await collection.firstOrFail({
                    predicateFn: (person) => person.name === "Joe",
                });
            expect(item).toEqual(persons[0]);
        });
        test("Should return first item when found", async () => {
            const collection = new AsyncIterableCollection([1, 2, 3, 4, 5]),
                item = await collection.firstOrFail();
            expect(item).toBe(1);
        });
        test("Should throw CollectionError when item not found", async () => {
            const collection = new AsyncIterableCollection([1, 2, 3, 4, 5]);
            await expect(async () => {
                await collection.firstOrFail({
                    predicateFn: (item) => item === 6,
                });
            }).rejects.toThrowError(CollectionError);
        });
        test("Should throw ItemNotFoundError when item not found", async () => {
            const collection = new AsyncIterableCollection([1, 2, 3, 4, 5]);
            await expect(async () => {
                await collection.firstOrFail({
                    predicateFn: (item) => item === 6,
                });
            }).rejects.toThrowError(ItemNotFoundCollectionError);
        });
        test("Should input correct indexes to predicate function", async () => {
            const collection = new AsyncIterableCollection([1, 2, 3, 4, 5]),
                indexes: number[] = [];
            try {
                await collection.firstOrFail({
                    predicateFn: (item, index) => {
                        indexes.push(index);
                        return item === 6;
                    },
                });
            } catch {
                /* Empty */
            }
            expect(indexes).toEqual([0, 1, 2, 3, 4]);
        });
        test("Should return the same value when called more than 1 times", async () => {
            const collection = new AsyncIterableCollection([1, 2, 3, 4, 5]);
            expect(await collection.firstOrFail()).toBe(1);
            expect(await collection.firstOrFail()).toBe(1);
        });
        test("Should work with async predicate function", async () => {
            type Person = {
                name: string;
                age: number;
            };
            const persons: Person[] = [
                    {
                        name: "Joe",
                        age: 20,
                    },
                    {
                        name: "Jhon",
                        age: 23,
                    },
                    {
                        name: "Joe",
                        age: 30,
                    },
                    {
                        name: "Jhon",
                        age: 50,
                    },
                ],
                collection = new AsyncIterableCollection(persons),
                item = await collection.firstOrFail({
                    // eslint-disable-next-line @typescript-eslint/require-await
                    predicateFn: async (person) => person.name === "Joe",
                });
            expect(item).toEqual(persons[0]);
        });
    });
    describe("method: last", () => {
        test("Should return last item that matches the predicate function", async () => {
            type Person = {
                name: string;
                age: number;
            };
            const persons: Person[] = [
                    {
                        name: "Joe",
                        age: 20,
                    },
                    {
                        name: "Jhon",
                        age: 23,
                    },
                    {
                        name: "Joe",
                        age: 30,
                    },
                    {
                        name: "Jhon",
                        age: 50,
                    },
                ],
                collection = new AsyncIterableCollection(persons),
                item = await collection.last({
                    predicateFn: (person) => person.name === "Joe",
                });
            expect(item).toEqual(persons[2]);
        });
        test("Should return last item when found", async () => {
            const collection = new AsyncIterableCollection([1, 2, 3, 4, 5]),
                item = await collection.last();
            expect(item).toBe(5);
        });
        test("Should return null when item not found", async () => {
            const collection = new AsyncIterableCollection([1, 2, 3, 4, 5]),
                item = await collection.last({
                    predicateFn: (item) => item === 6,
                });
            expect(item).toBe(null);
        });
        test("Should input correct indexes to predicate function", async () => {
            const collection = new AsyncIterableCollection([1, 2, 3, 4, 5]),
                indexes: number[] = [];
            await collection.last({
                predicateFn: (item, index) => {
                    indexes.push(index);
                    return item === 6;
                },
            });
            expect(indexes).toEqual([0, 1, 2, 3, 4]);
        });
        test("Should return the same value when called more than 1 times", async () => {
            const collection = new AsyncIterableCollection([1, 2, 3, 4, 5]);
            expect(await collection.last()).toBe(5);
            expect(await collection.last()).toBe(5);
        });
        test("Should work with async predicate function", async () => {
            type Person = {
                name: string;
                age: number;
            };
            const persons: Person[] = [
                    {
                        name: "Joe",
                        age: 20,
                    },
                    {
                        name: "Jhon",
                        age: 23,
                    },
                    {
                        name: "Joe",
                        age: 30,
                    },
                    {
                        name: "Jhon",
                        age: 50,
                    },
                ],
                collection = new AsyncIterableCollection(persons),
                item = await collection.last({
                    // eslint-disable-next-line @typescript-eslint/require-await
                    predicateFn: async (person) => person.name === "Joe",
                });
            expect(item).toEqual(persons[2]);
        });
    });
    describe("method: lastOr", () => {
        test("Should return last item that matches the predicate function", async () => {
            type Person = {
                name: string;
                age: number;
            };
            const persons: Person[] = [
                    {
                        name: "Joe",
                        age: 20,
                    },
                    {
                        name: "Jhon",
                        age: 23,
                    },
                    {
                        name: "Joe",
                        age: 30,
                    },
                    {
                        name: "Jhon",
                        age: 50,
                    },
                ],
                collection = new AsyncIterableCollection(persons),
                item = await collection.lastOr({
                    defaultValue: null,
                    predicateFn: (person) => person.name === "Joe",
                });
            expect(item).toEqual(persons[2]);
        });
        test("Should return last item when found", async () => {
            const collection = new AsyncIterableCollection([1, 2, 3, 4, 5]),
                item = await collection.lastOr({
                    defaultValue: "a",
                });
            expect(item).toBe(5);
        });
        test("Should return default value when item not found", async () => {
            const collection = new AsyncIterableCollection([1, 2, 3, 4, 5]),
                item = await collection.lastOr({
                    defaultValue: "a",
                    predicateFn: (item) => item === 6,
                });
            expect(item).toBe("a");
        });
        test("Should input correct indexes to predicate function", async () => {
            const collection = new AsyncIterableCollection([1, 2, 3, 4, 5]),
                indexes: number[] = [];
            await collection.lastOr({
                defaultValue: null,
                predicateFn: (item, index) => {
                    indexes.push(index);
                    return item === 6;
                },
            });
            expect(indexes).toEqual([0, 1, 2, 3, 4]);
        });
        test("Should return the same value when called more than 1 times", async () => {
            const collection = new AsyncIterableCollection([1, 2, 3, 4, 5]);
            expect(
                await collection.lastOr({
                    defaultValue: "a",
                }),
            ).toBe(5);
            expect(
                await collection.lastOr({
                    defaultValue: "a",
                }),
            ).toBe(5);
        });
        test("Should work with async predicate function", async () => {
            type Person = {
                name: string;
                age: number;
            };
            const persons: Person[] = [
                    {
                        name: "Joe",
                        age: 20,
                    },
                    {
                        name: "Jhon",
                        age: 23,
                    },
                    {
                        name: "Joe",
                        age: 30,
                    },
                    {
                        name: "Jhon",
                        age: 50,
                    },
                ],
                collection = new AsyncIterableCollection(persons),
                item = await collection.lastOr({
                    defaultValue: null,
                    // eslint-disable-next-line @typescript-eslint/require-await
                    predicateFn: async (person) => person.name === "Joe",
                });
            expect(item).toEqual(persons[2]);
        });
    });
    describe("method: lastOrFail", () => {
        test("Should return last item that matches the predicate function", async () => {
            type Person = {
                name: string;
                age: number;
            };
            const persons: Person[] = [
                    {
                        name: "Joe",
                        age: 20,
                    },
                    {
                        name: "Jhon",
                        age: 23,
                    },
                    {
                        name: "Joe",
                        age: 30,
                    },
                    {
                        name: "Jhon",
                        age: 50,
                    },
                ],
                collection = new AsyncIterableCollection(persons),
                item = await collection.lastOrFail({
                    predicateFn: (person) => person.name === "Joe",
                });
            expect(item).toEqual(persons[2]);
        });
        test("Should return last item when found", async () => {
            const collection = new AsyncIterableCollection([1, 2, 3, 4, 5]),
                item = await collection.lastOrFail();
            expect(item).toBe(5);
        });
        test("Should throw CollectionError when item not found", async () => {
            const collection = new AsyncIterableCollection([1, 2, 3, 4, 5]);
            await expect(async () => {
                await collection.lastOrFail({
                    predicateFn: (item) => item === 6,
                });
            }).rejects.toThrowError(CollectionError);
        });
        test("Should throw ItemNotFoundError when item not found", async () => {
            const collection = new AsyncIterableCollection([1, 2, 3, 4, 5]);
            await expect(async () => {
                await collection.lastOrFail({
                    predicateFn: (item) => item === 6,
                });
            }).rejects.toThrowError(ItemNotFoundCollectionError);
        });
        test("Should input correct indexes to predicate function", async () => {
            const collection = new AsyncIterableCollection([1, 2, 3, 4, 5]),
                indexes: number[] = [];
            try {
                await collection.lastOrFail({
                    predicateFn: (item, index) => {
                        indexes.push(index);
                        return item === 6;
                    },
                });
            } catch {
                /* Empty */
            }
            expect(indexes).toEqual([0, 1, 2, 3, 4]);
        });
        test("Should return the same value when called more than 1 times", async () => {
            const collection = new AsyncIterableCollection([1, 2, 3, 4, 5]);
            expect(await collection.lastOrFail()).toBe(5);
            expect(await collection.lastOrFail()).toBe(5);
        });
        test("Should work with async predicate function", async () => {
            type Person = {
                name: string;
                age: number;
            };
            const persons: Person[] = [
                    {
                        name: "Joe",
                        age: 20,
                    },
                    {
                        name: "Jhon",
                        age: 23,
                    },
                    {
                        name: "Joe",
                        age: 30,
                    },
                    {
                        name: "Jhon",
                        age: 50,
                    },
                ],
                collection = new AsyncIterableCollection(persons),
                item = await collection.lastOrFail({
                    // eslint-disable-next-line @typescript-eslint/require-await
                    predicateFn: async (person) => person.name === "Joe",
                });
            expect(item).toEqual(persons[2]);
        });
    });
    describe("method: before", () => {
        test(`Should return "a" when searching for string "b" of ["a", "b", "c"]`, async () => {
            const collection = new AsyncIterableCollection(["a", "b", "c"]),
                item = await collection.before((item) => item === "b");
            expect(item).toBe("a");
        });
        test(`Should return "b" when searching for string "c" of ["a", "b", "c"]`, async () => {
            const collection = new AsyncIterableCollection(["a", "b", "c"]),
                item = await collection.before((item) => item === "c");
            expect(item).toBe("b");
        });
        test(`Should return null when searching for string "a" of ["a", "b", "c"]`, async () => {
            const collection = new AsyncIterableCollection(["a", "b", "c"]),
                item = await collection.before((item) => item === "a");
            expect(item).toBe(null);
        });
        test(`Should return null when searching for string "d" of ["a", "b", "c"]`, async () => {
            const collection = new AsyncIterableCollection(["a", "b", "c"]),
                item = await collection.before((item) => item === "d");
            expect(item).toBe(null);
        });
        test("Should input correct indexes to predicate function", async () => {
            const collection = new AsyncIterableCollection(["a", "b", "c"]),
                indexes: number[] = [];
            await collection.before((item, index) => {
                indexes.push(index);
                return item === "c";
            });
            expect(indexes).toEqual([0, 1, 2]);
        });
        test("Should return the same value when called more than 1 times", async () => {
            const collection = new AsyncIterableCollection(["a", "b", "c"]);
            expect(await collection.before((item) => item === "c")).toBe("b");
            expect(await collection.before((item) => item === "c")).toBe("b");
        });
        test("Should work with async predicate function", async () => {
            const collection = new AsyncIterableCollection(["a", "b", "c"]),
                // eslint-disable-next-line @typescript-eslint/require-await
                item = await collection.before(async (item) => item === "b");
            expect(item).toBe("a");
        });
    });
    describe("method: beforeOr", () => {
        test(`Should return "a" when searching for string "b" of ["a", "b", "c"]`, async () => {
            const collection = new AsyncIterableCollection(["a", "b", "c"]),
                item = await collection.beforeOr(-1, (item) => item === "b");
            expect(item).toBe("a");
        });
        test(`Should return "b" when searching for string "c" of ["a", "b", "c"]`, async () => {
            const collection = new AsyncIterableCollection(["a", "b", "c"]),
                item = await collection.beforeOr(-1, (item) => item === "c");
            expect(item).toBe("b");
        });
        test(`Should return default value when searching for string "a" of ["a", "b", "c"]`, async () => {
            const collection = new AsyncIterableCollection(["a", "b", "c"]),
                item = await collection.beforeOr(-1, (item) => item === "a");
            expect(item).toBe(-1);
        });
        test(`Should return default value when searching for string "d" of ["a", "b", "c"]`, async () => {
            const collection = new AsyncIterableCollection(["a", "b", "c"]),
                item = await collection.beforeOr(-1, (item) => item === "d");
            expect(item).toBe(-1);
        });
        test("Should input correct indexes to predicate function", async () => {
            const collection = new AsyncIterableCollection(["a", "b", "c"]),
                indexes: number[] = [];
            await collection.beforeOr(null, (item, index) => {
                indexes.push(index);
                return item === "c";
            });
            expect(indexes).toEqual([0, 1, 2]);
        });
        test("Should return the same value when called more than 1 times", async () => {
            const collection = new AsyncIterableCollection(["a", "b", "c"]);
            expect(await collection.beforeOr(-1, (item) => item === "c")).toBe(
                "b",
            );
            expect(await collection.beforeOr(-1, (item) => item === "c")).toBe(
                "b",
            );
        });
        test("Should work with async predicate function", async () => {
            const collection = new AsyncIterableCollection(["a", "b", "c"]),
                item = await collection.beforeOr(
                    -1,
                    // eslint-disable-next-line @typescript-eslint/require-await
                    async (item) => item === "b",
                );
            expect(item).toBe("a");
        });
    });
    describe("method: beforeOrFail", () => {
        test(`Should return "a" when searching for string "b" of ["a", "b", "c"]`, async () => {
            const collection = new AsyncIterableCollection(["a", "b", "c"]),
                item = await collection.beforeOrFail((item) => item === "b");
            expect(item).toBe("a");
        });
        test(`Should return "b" when searching for string "c" of ["a", "b", "c"]`, async () => {
            const collection = new AsyncIterableCollection(["a", "b", "c"]),
                item = await collection.beforeOrFail((item) => item === "c");
            expect(item).toBe("b");
        });
        test(`Should throw CollectionError when searching for string "a" of ["a", "b", "c"]`, async () => {
            const collection = new AsyncIterableCollection(["a", "b", "c"]);
            await expect(async () => {
                await collection.beforeOrFail((item) => item === "a");
            }).rejects.toThrowError(CollectionError);
        });
        test(`Should throw ItemNotFoundError when searching for string "d" of ["a", "b", "c"]`, async () => {
            const collection = new AsyncIterableCollection(["a", "b", "c"]);
            await expect(async () => {
                await collection.beforeOrFail((item) => item === "d");
            }).rejects.toThrowError(ItemNotFoundCollectionError);
        });
        test("Should input correct indexes to predicate function", async () => {
            const collection = new AsyncIterableCollection(["a", "b", "c"]),
                indexes: number[] = [];
            try {
                await collection.beforeOrFail((item, index) => {
                    indexes.push(index);
                    return item === "c";
                });
            } catch {
                /* Empty */
            }
            expect(indexes).toEqual([0, 1, 2]);
        });
        test("Should return the same value when called more than 1 times", async () => {
            const collection = new AsyncIterableCollection(["a", "b", "c"]);
            expect(await collection.beforeOrFail((item) => item === "c")).toBe(
                "b",
            );
            expect(await collection.beforeOrFail((item) => item === "c")).toBe(
                "b",
            );
        });
        test("Should work with async predicate function", async () => {
            const collection = new AsyncIterableCollection(["a", "b", "c"]),
                item = await collection.beforeOrFail(
                    // eslint-disable-next-line @typescript-eslint/require-await
                    async (item) => item === "b",
                );
            expect(item).toBe("a");
        });
    });
    describe("method: after", () => {
        test(`Should return "c" when searching for string "b" of ["a", "b", "c"]`, async () => {
            const collection = new AsyncIterableCollection(["a", "b", "c"]),
                item = await collection.after((item) => item === "b");
            expect(item).toBe("c");
        });
        test(`Should return "b" when searching for string "a" of ["a", "b", "c"]`, async () => {
            const collection = new AsyncIterableCollection(["a", "b", "c"]),
                item = await collection.after((item) => item === "a");
            expect(item).toBe("b");
        });
        test(`Should return null when searching for string "c" of ["a", "b", "c"]`, async () => {
            const collection = new AsyncIterableCollection(["a", "b", "c"]),
                item = await collection.after((item) => item === "c");
            expect(item).toBe(null);
        });
        test(`Should return null when searching for string "d" of ["a", "b", "c"]`, async () => {
            const collection = new AsyncIterableCollection(["a", "b", "c"]),
                item = await collection.after((item) => item === "d");
            expect(item).toBe(null);
        });
        test("Should input correct indexes to predicate function", async () => {
            const collection = new AsyncIterableCollection(["a", "b", "c"]),
                indexes: number[] = [];
            await collection.after((item, index) => {
                indexes.push(index);
                return item === "c";
            });
            expect(indexes).toEqual([0, 1, 2]);
        });
        test("Should return the same value when called more than 1 times", async () => {
            const collection = new AsyncIterableCollection(["a", "b", "c"]);
            expect(await collection.after((item) => item === "a")).toBe("b");
            expect(await collection.after((item) => item === "a")).toBe("b");
        });
        test("Should work with async predicate function", async () => {
            const collection = new AsyncIterableCollection(["a", "b", "c"]),
                // eslint-disable-next-line @typescript-eslint/require-await
                item = await collection.after(async (item) => item === "b");
            expect(item).toBe("c");
        });
    });
    describe("method: afterOr", () => {
        test(`Should return "c" when searching for string "b" of ["a", "b", "c"]`, async () => {
            const collection = new AsyncIterableCollection(["a", "b", "c"]),
                item = await collection.afterOr(-1, (item) => item === "b");
            expect(item).toBe("c");
        });
        test(`Should return "b" when searching for string "a" of ["a", "b", "c"]`, async () => {
            const collection = new AsyncIterableCollection(["a", "b", "c"]),
                item = await collection.afterOr(-1, (item) => item === "a");
            expect(item).toBe("b");
        });
        test(`Should return default value when searching for string "c" of ["a", "b", "c"]`, async () => {
            const collection = new AsyncIterableCollection(["a", "b", "c"]),
                item = await collection.afterOr(-1, (item) => item === "c");
            expect(item).toBe(-1);
        });
        test(`Should return default value when searching for string "d" of ["a", "b", "c"]`, async () => {
            const collection = new AsyncIterableCollection(["a", "b", "c"]),
                item = await collection.afterOr(-1, (item) => item === "d");
            expect(item).toBe(-1);
        });
        test("Should input correct indexes to predicate function", async () => {
            const collection = new AsyncIterableCollection(["a", "b", "c"]),
                indexes: number[] = [];
            await collection.afterOr(null, (item, index) => {
                indexes.push(index);
                return item === "c";
            });
            expect(indexes).toEqual([0, 1, 2]);
        });
        test("Should return the same value when called more than 1 times", async () => {
            const collection = new AsyncIterableCollection(["a", "b", "c"]);
            expect(await collection.afterOr(-1, (item) => item === "a")).toBe(
                "b",
            );
            expect(await collection.afterOr(-1, (item) => item === "a")).toBe(
                "b",
            );
        });
        test("Should work async predicate function", async () => {
            const collection = new AsyncIterableCollection(["a", "b", "c"]),
                item = await collection.afterOr(
                    -1,
                    // eslint-disable-next-line @typescript-eslint/require-await
                    async (item) => item === "b",
                );
            expect(item).toBe("c");
        });
    });
    describe("method: afterOrFail", () => {
        test(`Should return "c" when searching for string "b" of ["a", "b", "c"]`, async () => {
            const collection = new AsyncIterableCollection(["a", "b", "c"]),
                item = await collection.afterOrFail((item) => item === "b");
            expect(item).toBe("c");
        });
        test(`Should return "b" when searching for string "a" of ["a", "b", "c"]`, async () => {
            const collection = new AsyncIterableCollection(["a", "b", "c"]),
                item = await collection.afterOrFail((item) => item === "a");
            expect(item).toBe("b");
        });
        test(`Should throw CollectionError when searching for string "c" of ["a", "b", "c"]`, async () => {
            const collection = new AsyncIterableCollection(["a", "b", "c"]);
            await expect(async () => {
                await collection.afterOrFail((item) => item === "c");
            }).rejects.toThrowError(CollectionError);
        });
        test(`Should throw ItemNotFoundError when searching for string "d" of ["a", "b", "c"]`, async () => {
            const collection = new AsyncIterableCollection(["a", "b", "c"]);
            await expect(async () => {
                await collection.afterOrFail((item) => item === "d");
            }).rejects.toThrowError(ItemNotFoundCollectionError);
        });
        test("Should input correct indexes to predicate function", async () => {
            const collection = new AsyncIterableCollection(["a", "b", "c"]),
                indexes: number[] = [];
            try {
                await collection.afterOrFail((item, index) => {
                    indexes.push(index);
                    return item === "c";
                });
            } catch {
                /* Empty */
            }
            expect(indexes).toEqual([0, 1, 2]);
        });
        test("Should return the same value when called more than 1 times", async () => {
            const collection = new AsyncIterableCollection(["a", "b", "c"]);
            expect(await collection.afterOrFail((item) => item === "a")).toBe(
                "b",
            );
            expect(await collection.afterOrFail((item) => item === "a")).toBe(
                "b",
            );
        });
        test("Should work with async predicate function", async () => {
            const collection = new AsyncIterableCollection(["a", "b", "c"]),
                item = await collection.afterOrFail(
                    // eslint-disable-next-line @typescript-eslint/require-await
                    async (item) => item === "b",
                );
            expect(item).toBe("c");
        });
    });
    describe("method: sole", () => {
        test("Should throw ItemNotFoundError when item does not exist", async () => {
            const collection = new AsyncIterableCollection([
                "a",
                "a",
                "b",
                "c",
                "b",
            ]);
            await expect(async () => {
                await collection.sole((item) => item === "f");
            }).rejects.toThrowError(ItemNotFoundCollectionError);
        });
        test("Should throw MultipleItemsFoundError when multiple item of same sort does exist", async () => {
            const collection = new AsyncIterableCollection([
                "a",
                "a",
                "b",
                "c",
                "b",
            ]);
            await expect(async () => {
                await collection.sole((item) => item === "a");
            }).rejects.toThrowError(MultipleItemsFoundCollectionError);
        });
        test("Should return item when only one item of the same sort exist", async () => {
            const collection = new AsyncIterableCollection([
                "a",
                "a",
                "b",
                "c",
                "b",
            ]);
            expect(await collection.sole((item) => item === "c")).toBe("c");
        });
        test("Should input correct indexes to predicate function", async () => {
            const collection = new AsyncIterableCollection([
                    "a",
                    "a",
                    "b",
                    "c",
                    "b",
                ]),
                indexes: number[] = [];
            await collection.sole((item, index) => {
                indexes.push(index);
                return item === "c";
            });
            expect(indexes).toEqual([0, 1, 2, 3, 4]);
        });
        test("Should return the same value when called more than 1 times", async () => {
            const collection = new AsyncIterableCollection([
                "a",
                "a",
                "b",
                "c",
                "b",
            ]);
            expect(await collection.sole((item) => item === "c")).toBe("c");
            expect(await collection.sole((item) => item === "c")).toBe("c");
        });
        test("Should work with async predicate function", async () => {
            const collection = new AsyncIterableCollection([
                "a",
                "a",
                "b",
                "c",
                "b",
            ]);
            // eslint-disable-next-line @typescript-eslint/require-await
            expect(await collection.sole(async (item) => item === "c")).toBe(
                "c",
            );
        });
    });
    describe("method: nth", () => {
        test("Should filter the 4:th items", async () => {
            const collection = new AsyncIterableCollection([
                    "a",
                    "b",
                    "c",
                    "d",
                    "e",
                    "f",
                ]),
                newCollection = collection.nth(4);
            expect(await newCollection.toArray()).toEqual(["a", "e"]);
        });
    });
    describe("method: count", () => {
        test(`Should return number 0 when filtering all string "a" of ["b", "b"]`, async () => {
            const collection = new AsyncIterableCollection(["b", "b"]);
            expect(await collection.count((item) => item === "a")).toBe(0);
        });
        test(`Should return number 3 when filtering all string "a" of ["a", "b", "a", "b", "a"]`, async () => {
            const collection = new AsyncIterableCollection([
                "a",
                "b",
                "a",
                "b",
                "a",
            ]);
            expect(await collection.count((item) => item === "a")).toBe(3);
        });
        test("Should input correct indexes to predicate function", async () => {
            const collection = new AsyncIterableCollection([
                    "a",
                    "a",
                    "b",
                    "c",
                    "b",
                ]),
                indexes: number[] = [];
            await collection.count((_item, index) => {
                indexes.push(index);
                return true;
            });
            expect(indexes).toEqual([0, 1, 2, 3, 4]);
        });
        test("Should return the same value when called more than 1 times", async () => {
            const collection = new AsyncIterableCollection([
                "a",
                "b",
                "a",
                "b",
                "a",
            ]);
            expect(await collection.count((item) => item === "a")).toBe(3);
            expect(await collection.count((item) => item === "a")).toBe(3);
        });
        test("Should work with async predicate function", async () => {
            const collection = new AsyncIterableCollection(["b", "b"]);
            // eslint-disable-next-line @typescript-eslint/require-await
            expect(await collection.count(async (item) => item === "b")).toBe(
                2,
            );
        });
    });
    describe("method: size", () => {
        test("Should return 0 when empty", async () => {
            const collection = new AsyncIterableCollection([]);
            expect(await collection.size()).toBe(0);
        });
        test("Should return number larger than 0 when empty", async () => {
            const collection = new AsyncIterableCollection(["a", "b", "c"]);
            expect(await collection.size()).toBeGreaterThan(0);
        });
        test("Should return 3 when contains 3 items", async () => {
            const collection = new AsyncIterableCollection(["a", "b", "c"]);
            expect(await collection.size()).toBe(3);
        });
        test("Should return the same value when called more than 1 times", async () => {
            const collection = new AsyncIterableCollection(["a", "b", "c"]);
            expect(await collection.size()).toBe(3);
            expect(await collection.size()).toBe(3);
        });
    });
    describe("method: isEmpty", () => {
        test("Should return true when empty", async () => {
            const collection = new AsyncIterableCollection([]);
            expect(await collection.isEmpty()).toBe(true);
        });
        test("Should return false when not empty", async () => {
            const collection = new AsyncIterableCollection([""]);
            expect(await collection.isEmpty()).toBe(false);
        });
        test("Should return the same value when called more than 1 times", async () => {
            const collection = new AsyncIterableCollection([]);
            expect(await collection.isEmpty()).toBe(true);
            expect(await collection.isEmpty()).toBe(true);
        });
    });
    describe("method: isNotEmpty", () => {
        test("Should return true when not empty", async () => {
            const collection = new AsyncIterableCollection([""]);
            expect(await collection.isNotEmpty()).toBe(true);
        });
        test("Should return false when empty", async () => {
            const collection = new AsyncIterableCollection([]);
            expect(await collection.isNotEmpty()).toBe(false);
        });
        test("Should return the same value when called more than 1 times", async () => {
            const collection = new AsyncIterableCollection([""]);
            expect(await collection.isNotEmpty()).toBe(true);
            expect(await collection.isNotEmpty()).toBe(true);
        });
    });
    describe("method: searchFirst", () => {
        test("Should return -1 when searching for value that does not exist in collection", async () => {
            const collection = new AsyncIterableCollection([
                "a",
                "b",
                "b",
                "c",
            ]);
            expect(await collection.searchFirst((item) => item === "d")).toBe(
                -1,
            );
        });
        test(`Should return 1 when searching for string "b" of ["a", "b", "b", "c"]`, async () => {
            const collection = new AsyncIterableCollection([
                "a",
                "b",
                "b",
                "c",
            ]);
            expect(await collection.searchFirst((item) => item === "b")).toBe(
                1,
            );
        });
        test("Should return the same value when called more than 1 times", async () => {
            const collection = new AsyncIterableCollection([
                "a",
                "b",
                "b",
                "c",
            ]);
            expect(await collection.searchFirst((item) => item === "b")).toBe(
                1,
            );
            expect(await collection.searchFirst((item) => item === "b")).toBe(
                1,
            );
        });
        test("Should work with async predicate function", async () => {
            const collection = new AsyncIterableCollection([
                "a",
                "b",
                "b",
                "c",
            ]);
            expect(
                // eslint-disable-next-line @typescript-eslint/require-await
                await collection.searchFirst(async (item) => item === "b"),
            ).toBe(1);
        });
    });
    describe("method: searchLast", () => {
        test("Should return -1 when searching for value that does not exist in collection", async () => {
            const collection = new AsyncIterableCollection([
                "a",
                "b",
                "b",
                "c",
            ]);
            expect(await collection.searchLast((item) => item === "d")).toBe(
                -1,
            );
        });
        test(`Should return 1 when searching for string "b" of ["a", "b", "b", "c"]`, async () => {
            const collection = new AsyncIterableCollection([
                "a",
                "b",
                "b",
                "c",
            ]);
            expect(await collection.searchLast((item) => item === "b")).toBe(2);
        });
        test("Should return the same value when called more than 1 times", async () => {
            const collection = new AsyncIterableCollection([
                "a",
                "b",
                "b",
                "c",
            ]);
            expect(await collection.searchLast((item) => item === "b")).toBe(2);
            expect(await collection.searchLast((item) => item === "b")).toBe(2);
        });
        test("Should work with async predicate function", async () => {
            const collection = new AsyncIterableCollection([
                "a",
                "b",
                "b",
                "c",
            ]);
            expect(
                // eslint-disable-next-line @typescript-eslint/require-await
                await collection.searchLast(async (item) => item === "b"),
            ).toBe(2);
        });
    });
    describe("method: forEach", () => {
        test("Should iterate all items", async () => {
            const arr1 = [1, 2, 3],
                collection = new AsyncIterableCollection(arr1),
                arr2: number[] = [];
            await collection.forEach((item) => arr2.push(item));
            expect(arr2).toEqual(arr1);
        });
        test("Should input correct indexes to predicate function", async () => {
            const collection = new AsyncIterableCollection([1, 2, 3]),
                indexes: number[] = [];
            await collection.forEach((_item, index) => {
                indexes.push(index);
            });
            expect(indexes).toEqual([0, 1, 2]);
        });
        test("Should return the same value when called more than 1 times", async () => {
            const arr1 = [1, 2, 3],
                collection = new AsyncIterableCollection(arr1),
                arr2: number[] = [];
            await collection.forEach((item) => arr2.push(item));
            expect(arr2).toEqual(arr1);
            expect(arr2).toEqual(arr1);
        });
        test("Should work with async predicate function", async () => {
            const arr1 = [1, 2, 3],
                collection = new AsyncIterableCollection(arr1),
                arr2: number[] = [];
            // eslint-disable-next-line @typescript-eslint/require-await
            await collection.forEach(async (item) => arr2.push(item));
            expect(arr2).toEqual(arr1);
        });
    });
    describe("method: toArray", () => {
        test("Should return array with 0 items when empty", async () => {
            const collection = new AsyncIterableCollection([]);
            expect(await collection.toArray()).toEqual([]);
        });
        test("Should return array with items when that match collection items", async () => {
            const collection = new AsyncIterableCollection(["a", "b", "c"]);
            expect(await collection.toArray()).toEqual(["a", "b", "c"]);
        });
        test("Should return the same value when called more than 1 times", async () => {
            const collection = new AsyncIterableCollection(["a", "b", "c"]);
            expect(await collection.toArray()).toEqual(["a", "b", "c"]);
            expect(await collection.toArray()).toEqual(["a", "b", "c"]);
        });
    });
});
