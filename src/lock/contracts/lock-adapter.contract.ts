/**
 * @module Lock
 */

import type { TimeSpan } from "@/utilities/_module";

/**
 * @group Contracts
 */
export type ILockAdapter = {
    acquire(
        key: string,
        owner: string,
        ttl: TimeSpan | null,
    ): PromiseLike<boolean>;

    release(key: string, owner: string): PromiseLike<boolean>;

    forceRelease(key: string): PromiseLike<void>;

    isLocked(key: string): PromiseLike<boolean>;

    getRemainingTime(key: string): PromiseLike<TimeSpan | null>;

    refresh(key: string, owner: string, ttl: TimeSpan): PromiseLike<boolean>;

    getGroup(): string;

    withGroup(group: string): ILockAdapter;
};
