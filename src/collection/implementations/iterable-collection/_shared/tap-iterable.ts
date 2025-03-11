/**
 * @module Collection
 */

import {
    type ISyncCollection,
    type SyncTap,
} from "@/collection/contracts/_module-exports.js";

/**
 * @internal
 */
export class TapIterable<TInput> implements Iterable<TInput> {
    constructor(
        private collection: ISyncCollection<TInput>,
        private callback: SyncTap<ISyncCollection<TInput>>,
    ) {}

    *[Symbol.iterator](): Iterator<TInput> {
        this.callback(this.collection);
        yield* this.collection;
    }
}
