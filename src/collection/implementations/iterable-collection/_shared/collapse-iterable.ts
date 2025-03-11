/**
 * @module Collection
 */

import { isIterable } from "@/collection/implementations/_shared.js";
import {
    type Collapse,
    type ISyncCollection,
} from "@/collection/contracts/_module-exports.js";

/**
 * @internal
 */
export class CollapseIterable<TInput> implements Iterable<Collapse<TInput>> {
    constructor(private collection: ISyncCollection<TInput>) {}

    *[Symbol.iterator](): Iterator<Collapse<TInput>> {
        for (const item of this.collection) {
            if (isIterable<TInput>(item)) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                yield* item as any;
            } else {
                yield item as Collapse<TInput>;
            }
        }
    }
}
