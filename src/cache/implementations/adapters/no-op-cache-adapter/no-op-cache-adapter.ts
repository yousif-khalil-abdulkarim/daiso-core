/**
 * @module Cache
 */

import type { ICacheAdapter } from "@/cache/contracts/cache-adapter.contract";
import type { TimeSpan } from "@/utilities/_module";

/**
 * This <i>NoOpCacheAdapter</i> will do nothing and is used for easily mocking {@link ICacheAdapter} for testing.
 * @group Adapters
 */
export class NoOpCacheAdapter<TType = unknown> implements ICacheAdapter<TType> {
    getGroup(): string {
        return "";
    }

    withGroup(_group: string): ICacheAdapter<TType> {
        return new NoOpCacheAdapter();
    }

    exists(_key: string): Promise<boolean> {
        return Promise.resolve(false);
    }

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

    clear(): Promise<void> {
        return Promise.resolve();
    }
}
