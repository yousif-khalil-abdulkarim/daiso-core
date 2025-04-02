/**
 * @module Lock
 */

import type { OneOrMore, TimeSpan } from "@/utilities/_module-exports.js";
import type { ILock } from "@/lock/contracts/lock.contract.js";
import type { IEventListenable } from "@/event-bus/contracts/_module-exports.js";
import type { LockEvents } from "@/lock/contracts/lock.events.js";

/**
 * The `ILockListenable` contract defines a way for listening {@link ILock | `ILock`} operations.
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Contracts
 */
export type ILockListenable = IEventListenable<LockEvents>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Contracts
 */
export type LockProviderCreateSettings = {
    /**
     * You can also provide a `settings.ttl` value using. If not specified it defaults to null, meaning no TTL is applied.
     */
    ttl?: TimeSpan | null;

    /**
     * You can provide a custom owner. If not specified a unique owner will be generated by default.
     */
    owner?: OneOrMore<string>;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Contracts
 */
export type ILockProviderBase = {
    /**
     * The `create` method is used to create an instance of {@link ILock | `ILock`}.
     *
     * @param key - can be a string or an `Iterable` of strings.
     * If it's an `Iterable`, it will be joined into a single string.
     * Think of an `Iterable` as representing a path.
     */
    create(
        key: OneOrMore<string>,
        settings?: LockProviderCreateSettings,
    ): ILock;
};

/**
 * The `ILockProvider` contract defines a way for managing locks independent of the underlying technology.
 * It commes with more convient methods compared to `ILockAdapter`.
 *
 * IMPORT_PATH: `"@daiso-tech/core/lock/contracts"`
 * @group Contracts
 */
export type ILockProvider = ILockListenable & ILockProviderBase;
