/**
 * @module Cache
 */

import {
    type ICacheAdapter,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type ICache,
} from "@/cache/contracts/_module-exports.js";
import type { TimeSpan } from "@/utilities/_module-exports.js";

/**
 * This <i>NoOpCacheAdapter</i> will do nothing and is used for easily mocking <i>{@link ICache}</i> for testing.
 *
 *
 * IMPORT_PATH: ```"@daiso-tech/core/cache/adapters"```
 * @group Adapters
 */
export class NoOpCacheAdapter<TType> implements ICacheAdapter<TType> {
    get(_key: string): PromiseLike<TType | null> {
        return Promise.resolve(null);
    }

    getAndRemove(_key: string): PromiseLike<TType | null> {
        return Promise.resolve(null);
    }

    add(
        _key: string,
        _value: TType,
        _ttl: TimeSpan | null,
    ): PromiseLike<boolean> {
        return Promise.resolve(true);
    }

    put(
        _key: string,
        _value: TType,
        _ttl: TimeSpan | null,
    ): PromiseLike<boolean> {
        return Promise.resolve(true);
    }

    update(_key: string, _value: TType): PromiseLike<boolean> {
        return Promise.resolve(true);
    }

    increment(_key: string, _value: number): PromiseLike<boolean> {
        return Promise.resolve(true);
    }

    removeMany(_keys: string[]): PromiseLike<boolean> {
        return Promise.resolve(true);
    }

    removeAll(): PromiseLike<void> {
        return Promise.resolve();
    }

    removeByKeyPrefix(_prefix: string): PromiseLike<void> {
        return Promise.resolve();
    }
}
