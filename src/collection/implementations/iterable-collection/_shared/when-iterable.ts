/**
 * @module Collection
 */

import {
    type ISyncCollection,
    type SyncModifier,
} from "@/collection/contracts/_module-exports.js";

/**
 * @internal
 */
export class WhenIterable<TInput, TExtended>
    implements Iterable<TInput | TExtended>
{
    constructor(
        private collection: ISyncCollection<TInput>,
        private condition: () => boolean,
        private callback: SyncModifier<
            ISyncCollection<TInput>,
            ISyncCollection<TExtended>
        >,
    ) {}

    *[Symbol.iterator](): Iterator<TInput | TExtended> {
        if (this.condition()) {
            yield* this.callback(this.collection);
            return;
        }
        yield* this.collection as ISyncCollection<TInput | TExtended>;
    }
}
