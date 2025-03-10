/**
 * @module Collection
 */

import {
    type ICollection,
    type SyncTap,
} from "@/collection/contracts/_module-exports.js";

/**
 * @internal
 */
export class TapIterable<TInput> implements Iterable<TInput> {
    constructor(
        private collection: ICollection<TInput>,
        private callback: SyncTap<ICollection<TInput>>,
    ) {}

    *[Symbol.iterator](): Iterator<TInput> {
        this.callback(this.collection);
        yield* this.collection;
    }
}
