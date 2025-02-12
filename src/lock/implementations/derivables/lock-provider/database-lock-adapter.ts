/**
 * @module Lock
 */

import { TimeSpan, UnexpectedCacheError } from "@/_module";
import type {
    IDatabaseLockAdapter,
    ILockAdapter,
} from "@/lock/contracts/_module";

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

    async isLocked(key: string): Promise<boolean> {
        const lock = await this.adapter.find(key);
        if (!lock) {
            return false;
        }
        if (lock.expiration === null) {
            return true;
        }
        const isLocked = lock.expiration.getTime() <= Date.now();
        return !isLocked;
    }

    async getRemainingTime(key: string): Promise<TimeSpan | null> {
        const lock = await this.adapter.find(key);
        if (lock === null) {
            return null;
        }
        const { expiration } = lock;
        if (expiration === null) {
            return null;
        }
        const hasExpired = expiration.getTime() <= Date.now();
        if (hasExpired) {
            return null;
        }
        return TimeSpan.fromDateRange(new Date(), expiration);
    }

    async refresh(key: string, owner: string, ttl: TimeSpan): Promise<boolean> {
        const result = await this.adapter.refresh(key, owner, ttl.toEndDate());
        return result > 0;
    }

    getGroup(): string {
        return this.adapter.getGroup();
    }

    withGroup(group: string): ILockAdapter {
        return new DatabaseLockAdapter(this.adapter.withGroup(group));
    }
}
