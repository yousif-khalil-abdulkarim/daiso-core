/**
 * @module Lock
 */

import { UnexpectedError, type TimeSpan } from "@/utilities/_module-exports.js";
import {
    LOCK_REFRESH_RESULT,
    type IDatabaseLockAdapter,
    type ILockAdapter,
    type LockRefreshResult,
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
        try {
            const expiration = ttl?.toEndDate() ?? null;
            // An error will be thrown if the lock already exists
            await this.adapter.insert(key, owner, expiration);
            return true;
        } catch (error: unknown) {
            if (error instanceof UnexpectedError) {
                throw error;
            }
            const expiration = ttl?.toEndDate() ?? null;
            const result = await this.adapter.updateIfExpired(
                key,
                owner,
                expiration,
            );
            return result > 0;
        }
    }

    async release(key: string, owner: string): Promise<boolean> {
        const lockData = await this.adapter.removeIfOwner(key, owner);
        if (lockData === null) {
            return false;
        }

        const { expiration } = lockData;
        const hasNoExpiration = expiration === null;
        if (hasNoExpiration) {
            return true;
        }

        const { owner: currentOwner } = lockData;
        const isNotExpired = expiration > new Date();
        const isCurrentOwner = owner === currentOwner;
        return isNotExpired && isCurrentOwner;
    }

    async forceRelease(key: string): Promise<boolean> {
        const lockData = await this.adapter.remove(key);
        if (lockData === null) {
            return false;
        }
        if (lockData.expiration === null) {
            return true;
        }
        return lockData.expiration > new Date();
    }

    async refresh(
        key: string,
        owner: string,
        ttl: TimeSpan,
    ): Promise<LockRefreshResult> {
        const lockData = await this.adapter.find(key);
        if (lockData === null) {
            return LOCK_REFRESH_RESULT.UNOWNED_REFRESH;
        }

        if (lockData.owner !== owner) {
            return LOCK_REFRESH_RESULT.UNOWNED_REFRESH;
        }

        if (lockData.expiration === null) {
            return LOCK_REFRESH_RESULT.UNEXPIRABLE_KEY;
        }

        if (lockData.expiration <= new Date()) {
            return LOCK_REFRESH_RESULT.UNOWNED_REFRESH;
        }

        const expiration = ttl.toEndDate();
        const result = await this.adapter.updateExpirationIfOwner(
            key,
            owner,
            expiration,
        );
        if (result > 0) {
            return LOCK_REFRESH_RESULT.REFRESHED;
        }
        return LOCK_REFRESH_RESULT.UNOWNED_REFRESH;
    }
}
