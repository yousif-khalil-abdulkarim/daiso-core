/**
 * @module Collection
 */

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type SyncTap<TCollection> = (collection: TCollection) => void;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type AsyncTap<TCollection> = (
    collection: TCollection,
) => PromiseLike<void>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type Tap<TCollection> = SyncTap<TCollection> | AsyncTap<TCollection>;
