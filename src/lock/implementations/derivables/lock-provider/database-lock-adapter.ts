/**
 * @module Lock
 */

import type { TimeSpan } from "@/utilities/_module-exports.js";
import { UnexpectedCacheError } from "@/cache/contracts/_module-exports.js";
import type {
    IDatabaseLockAdapter,
    ILockAdapter,
} from "@/lock/contracts/_module-exports.js";

/**
 * @internal
 */
export class DatabaseLockAdapter implements ILockAdapter {
    constructor(private readonly adapter: IDatabaseLockAdapter) {}

    async acquire(
        key: string,
        owner: string,
        ttl: TimeSpan | null,
    ): Promise<boolean> {
        const expiration = ttl?.toEndDate() ?? null;

        try {
            await this.adapter.insert(key, owner, expiration);
            return true;
        } catch (error: unknown) {
            if (error instanceof UnexpectedCacheError) {
                throw error;
            }
            const result = await this.adapter.update(key, owner, expiration);
            return result > 0;
        }
    }

    async release(key: string, owner: string): Promise<boolean> {
        const lock = await this.adapter.find(key);
        if (lock === null) {
            return true;
        }
        await this.adapter.remove(key, owner);
        const isOwner = lock.owner === owner;
        return isOwner;
    }

    async forceRelease(key: string): Promise<void> {
        await this.adapter.remove(key, null);
    }

    async refresh(key: string, owner: string, ttl: TimeSpan): Promise<boolean> {
        const result = await this.adapter.refresh(key, owner, ttl.toEndDate());
        return result > 0;
    }
}
