/**
 * @module Cache
 */

import type { TimeSpan } from "@/utilities/_module";

export type CacheEvents<TType = unknown> = {
    key_found: {
        group: string;
        key: string;
        value: TType;
    };
    key_not_found: {
        group: string;
        key: string;
    };
    key_added: {
        group: string;
        key: string;
        value: TType;
        ttl: TimeSpan | null;
    };
    key_updated: {
        group: string;
        key: string;
        value: TType;
    };
    key_removed: {
        group: string;
        key: string;
    };
    key_incremented: {
        group: string;
        key: string;
        value: number;
    };
    key_decremented: {
        group: string;
        key: string;
        value: number;
    };
    keys_cleared: {
        group: string;
    };
};
