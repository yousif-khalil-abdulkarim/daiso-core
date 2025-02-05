/**
 * @module Lock
 */

import type { OneOrMore, TimeSpan } from "@/utilities/_module";
import type { ILock } from "@/lock/contracts/lock.contract";

/**
 * @group Contracts
 */
export type LockProviderCreateSettings = {
    ttl?: TimeSpan | null;
    owner?: OneOrMore<string>;
};

/**
 * @group Contracts
 */
export type ILockProvider = {
    create(
        key: OneOrMore<string>,
        settings?: LockProviderCreateSettings,
    ): ILock;

    getGroup(): string;
};

/**
 * @group Contracts
 */
export type IGroupableLockProvider = ILockProvider & {
    withGroup(group: OneOrMore<string>): ILockProvider;
};
