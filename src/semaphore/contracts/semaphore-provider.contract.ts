/**
 * @module Semaphore
 */

import type { TimeSpan } from "@/utilities/_module-exports.js";
import type { ISemaphore } from "@/semaphore/contracts/semaphore.contract.js";
import type { IEventListenable } from "@/event-bus/contracts/_module-exports.js";
import type { SemaphoreEventMap } from "@/semaphore/contracts/semaphore.events.js";

/**
 * The `ISemaphoreListenable` contract defines a way for listening {@link ISemaphore | `ISemaphore`} operations.
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/contracts"`
 * @group Contracts
 */
export type ISemaphoreListenable = IEventListenable<SemaphoreEventMap>;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/contracts"`
 * @group Contracts
 */
export type SemaphoreProviderCreateSettings = {
    limit: number;

    /**
     * You can also provide a `settings.ttl` value using. If not specified it defaults to null, meaning no TTL is applied.
     */
    ttl?: TimeSpan | null;

    slotId?: string;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/contracts"`
 * @group Contracts
 */
export type ISemaphoreProviderBase = {
    /**
     * The `create` method is used to create an instance of {@link ISemaphore | `ISemaphore`}.
     *
     * @param key - can be a string or an `Iterable` of strings.
     * If it's an `Iterable`, it will be joined into a single string.
     * Think of an `Iterable` as representing a path.
     */
    create(key: string, settings: SemaphoreProviderCreateSettings): ISemaphore;
};

/**
 * The `ISemaphoreProvider` contract defines a way for managing semaphores independent of the underlying technology.
 * It commes with more convient methods compared to `ISemaphoreAdapter`.
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/contracts"`
 * @group Contracts
 */
export type ISemaphoreProvider = ISemaphoreListenable & ISemaphoreProviderBase;
