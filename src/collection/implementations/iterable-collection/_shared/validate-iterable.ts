/**
 * @module Collection
 */
import { isPromiseLike } from "@/utilities/_module.js";
import type { StandardSchemaV1 } from "@standard-schema/spec";

/**
 * @internal
 */
export class ValidateIterable<TInput, TOutput> implements Iterable<TOutput> {
    constructor(
        private readonly iterable: Iterable<TInput>,
        private readonly schema: StandardSchemaV1<TInput, TOutput>,
    ) {}

    *[Symbol.iterator](): Iterator<TOutput> {
        for (const item of this.iterable) {
            const result = this.schema["~standard"].validate(item);
            if (isPromiseLike(result)) {
                throw new TypeError("Schema validation must be synchronous");
            }
            if (!result.issues) {
                yield result.value;
            }
        }
    }
}
