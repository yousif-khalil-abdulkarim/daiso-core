import { describe, test, expect } from "vitest";

import { isAsyncIterable } from "@/utilities/functions/is-async-iterable.js";
import { iterableToAsyncIterable } from "@/utilities/functions/iterable-to-async-iterable.js";

describe("function: iterableToAsyncIterable", () => {
    test("Should convert Iterable to AsyncIterable", () => {
        const iterable: Iterable<unknown> = {
            *[Symbol.iterator](): Iterator<unknown> {
                yield 1;
                yield 2;
            },
        };

        const result = isAsyncIterable(iterableToAsyncIterable(iterable));

        expect(result).toBe(true);
    });
});
