/**
 * @module Storage
 */

import type { IStorageAdapter } from "@/storage/contracts/storage-adapter.contract";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { IStorage } from "@/storage/contracts/storage.contract";

/**
 * Name of all the events of <i>{@link IStorage}</i>.
 * @group Events
 */
export const STORAGE_EVENTS = {
    KEYS_FOUND: "keys_found",
    KEYS_NOT_FOUND: "keys_not_found",
    KEYS_ADDED: "keys_added",
    KEYS_UPDATED: "keys_updated",
    KEYS_REMOVED: "keys_removed",
    KEYS_CLEARED: "keys_cleared",
    KEY_INCREMENTED: "key_incremented",
    KEY_DECREMENTED: "key_decremented",
} as const;

/**
 * @group Events
 */
export type StorageEventNames =
    (typeof STORAGE_EVENTS)[keyof typeof STORAGE_EVENTS];

/**
 * @group Events
 */
export type StorageEvent = {
    namespace: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    adapter: IStorageAdapter<any>;
};

/**
 * @group Events
 */
export type KeysFoundStorageEvent<TType> = StorageEvent & {
    type: (typeof STORAGE_EVENTS)["KEYS_FOUND"];
    values: Record<string, TType>;
};

/**
 * @group Events
 */
export type KeysNotFoundStorageEvent = StorageEvent & {
    type: (typeof STORAGE_EVENTS)["KEYS_NOT_FOUND"];
    keys: string[];
};

/**
 * @group Events
 */
export type KeysAddedStorageEvent<TType> = StorageEvent & {
    type: (typeof STORAGE_EVENTS)["KEYS_ADDED"];
    values: Record<string, TType>;
};

/**
 * @group Events
 */
export type KeysUpdatedStorageEvent<TType> = StorageEvent & {
    type: (typeof STORAGE_EVENTS)["KEYS_UPDATED"];
    values: Record<string, TType>;
};

/**
 * @group Events
 */
export type KeyIncrementedStorageEvent = StorageEvent & {
    type: (typeof STORAGE_EVENTS)["KEY_INCREMENTED"];
    key: string;
    value: number;
};

/**
 * @group Events
 */
export type KeyDecrementedStorageEvent = StorageEvent & {
    type: (typeof STORAGE_EVENTS)["KEY_DECREMENTED"];
    key: string;
    value: number;
};

/**
 * @group Events
 */
export type KeysRemovedStorageEvent = StorageEvent & {
    type: (typeof STORAGE_EVENTS)["KEYS_REMOVED"];
    keys: string[];
};

/**
 * This event will be triggered when storage is cleared.
 * @group Events
 */
export type KeysClearedStorageEvent = StorageEvent & {
    type: (typeof STORAGE_EVENTS)["KEYS_CLEARED"];
};

/**
 * @group Events
 */
export type AllStorageEvents<TType = unknown> =
    | KeysFoundStorageEvent<TType>
    | KeysNotFoundStorageEvent
    | KeysAddedStorageEvent<TType>
    | KeysUpdatedStorageEvent<TType>
    | KeysRemovedStorageEvent
    | KeysClearedStorageEvent
    | KeyIncrementedStorageEvent
    | KeyDecrementedStorageEvent;
