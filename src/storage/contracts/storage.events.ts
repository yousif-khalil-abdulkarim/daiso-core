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
    KEY_FOUND: "key_found",
    KEY_NOT_FOUND: "key_not_found",
    KEY_ADDED: "key_added",
    KEY_UPDATED: "key_updated",
    KEY_REMOVED: "key_removed",
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
    adapter: IStorageAdapter<any>;
};

/**
 * @group Events
 */
export type KeyFoundStorageEvent<TType = unknown> = StorageEvent & {
    type: (typeof STORAGE_EVENTS)["KEY_FOUND"];
    key: string;
    value: TType;
};

/**
 * @group Events
 */
export type KeyNotFoundStorageEvent = StorageEvent & {
    type: (typeof STORAGE_EVENTS)["KEY_NOT_FOUND"];
    key: string;
};

/**
 * @group Events
 */
export type KeyAddedStorageEvent<TType = unknown> = StorageEvent & {
    type: (typeof STORAGE_EVENTS)["KEY_ADDED"];
    key: string;
    value: TType;
};

/**
 * @group Events
 */
export type KeyUpdatedStorageEvent<TType = unknown> = StorageEvent & {
    type: (typeof STORAGE_EVENTS)["KEY_UPDATED"];
    key: string;
    value: TType;
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
export type KeyRemovedStorageEvent = StorageEvent & {
    type: (typeof STORAGE_EVENTS)["KEY_REMOVED"];
    key: string;
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
export type AllStorageEvents<TType> =
    | KeyFoundStorageEvent<TType>
    | KeyNotFoundStorageEvent
    | KeyAddedStorageEvent<TType>
    | KeyUpdatedStorageEvent<TType>
    | KeyRemovedStorageEvent
    | KeysClearedStorageEvent
    | KeyIncrementedStorageEvent
    | KeyDecrementedStorageEvent;
