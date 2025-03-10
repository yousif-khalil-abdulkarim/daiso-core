/**
 * @module Collection
 */

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type Tap<TCollection> = (collection: TCollection) => void;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type AsyncTap_<TCollection> = (
    collection: TCollection,
) => PromiseLike<void>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/collection/contracts"```
 */
export type AsyncTap<TCollection> = Tap<TCollection> | AsyncTap_<TCollection>;
