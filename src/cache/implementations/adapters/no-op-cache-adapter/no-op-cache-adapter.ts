/**
 * @module Cache
 */

import { type ICacheAdapter } from "@/cache/contracts/cache-adapter.contract";
import type { TimeSpan } from "@/utilities/_module";

/**
 * This <i>NoOpCacheAdapter</i> will do nothing and is used for easily mocking {@link ICacheAdapter} for testing.
 * @group Adapters
 */
export class NoOpCacheAdapter<TType> implements ICacheAdapter<TType> {
    get(_key: string): Promise<TType | null> {
        return Promise.resolve(null);
    }

    add(_key: string, _value: TType, _ttl: TimeSpan | null): Promise<boolean> {
        return Promise.resolve(false);
    }

    update(_key: string, _value: TType): Promise<boolean> {
        return Promise.resolve(false);
    }

    put(_key: string, _value: TType, _ttl: TimeSpan | null): Promise<boolean> {
        return Promise.resolve(false);
    }

    remove(_key: string): Promise<boolean> {
        return Promise.resolve(false);
    }

    increment(_key: string, _value: number): Promise<boolean> {
        return Promise.resolve(false);
    }

    clear(_prefix: string): Promise<void> {
        return Promise.resolve();
    }
}
