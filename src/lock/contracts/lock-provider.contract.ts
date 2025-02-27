/**
 * @module Lock
 */

import type { OneOrMore, TimeSpan } from "@/utilities/_module-exports.js";
import type { ILock, ILockListenable } from "@/lock/contracts/lock.contract.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/contracts"```
 * @group Contracts
 */
export type LockProviderCreateSettings = {
    ttl?: TimeSpan | null;
    owner?: OneOrMore<string>;
};

/**
 * The <i>ILockProvider</i> contract defines a way for managing locks independent of the underlying technology.
 * It commes with more convient methods compared to <i>ILockAdapter</i>.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/contracts"```
 * @group Contracts
 */
export type ILockProvider = ILockListenable & {
    /**
     * The <i>create</i> method is used to create an instance of <i>{@link ILock}</i>.
     * You can provide a custom owner using the <i>settings.owner</i> field. If not specified a unique owner will be generated by default.
     * You can also provide a TTL value using the <i>settings.ttl</i> field. If not specified it defaults to null, meaning no TTL is applied.
     */
    create(
        key: OneOrMore<string>,
        settings?: LockProviderCreateSettings,
    ): ILock;

    /**
     * The <i>getGroup</i> method returns the group name.
     */
    getGroup(): string;
};

/**
 * The <i>IGroupableLockProvider</i> contract defines a way for managing locks independent of the underlying technology.
 * It commes with one extra method which is useful for multitennat applications compared to <i>{@link ILockProvider}</i>.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/lock/contracts"```
 * @group Contracts
 */
export type IGroupableLockProvider = ILockProvider & {
    /**
     * The <i>withGroup</i> method returns a new <i>{@link ILockProvider}</i> instance that groups locks together.
     * Only locks in the same group will be acquired and released, leaving locks outside the group unaffected.
     * This useful for multitennat applications.
     */
    withGroup(group: OneOrMore<string>): ILockProvider;
};
