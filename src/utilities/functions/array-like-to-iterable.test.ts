import { describe, expect, test } from "vitest";
import { isIterable } from "@/utilities/functions/is-iterable.js";
import { arrayLikeToIterable } from "@/utilities/functions/array-like-to-iterable.js";

describe("function: arrayLikeToIterable", () => {
    test("Should convert ArrayLike to Iterable", () => {
        const arrayLike: ArrayLike<unknown> = {
            0: "a",
            1: "b",
            2: "c",
            length: 3,
        };

        const result = isIterable(arrayLikeToIterable(arrayLike));

        expect(result).toBe(true);
    });
});
