/**
 * @module Lock
 */

import type { IDeinitizable, IInitizable } from "@/utilities/_module";

/**
 * @group Contracts
 */
export type ILockData = {
    owner: string;
    expiration: Date | null;
};

/**
 * @group Contracts
 */
export type IDatabaseLockAdapter = IDeinitizable &
    IInitizable & {
        insert(
            key: string,
            owner: string,
            expiration: Date | null,
        ): PromiseLike<void>;

        update(
            key: string,
            owner: string,
            expiration: Date | null,
        ): PromiseLike<number>;

        remove(key: string, owner: string | null): PromiseLike<void>;

        refresh(
            key: string,
            owner: string,
            expiration: Date,
        ): PromiseLike<number>;

        find(key: string): PromiseLike<ILockData | null>;

        getGroup(): string;

        withGroup(group: string): IDatabaseLockAdapter;
    };
