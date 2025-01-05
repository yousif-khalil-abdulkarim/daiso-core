# @daiso-tech/core

## 0.10.0

### Minor Changes

-   f675866: ## Changes
    -   Changed IAsyncCollection contract to use LazyPromise instead PromiseLike.
    -   Changed IEventBus contract to use LazyPromise instead PromiseLike.
    -   Changed IStorage contract to use LazyPromise instead PromiseLike.
    -   Changed ISerializer contract to use PrommiseLike instead Promise.

## 0.9.0

### Minor Changes

-   adfe30a: ## Changes
    -   Added <i>get</i>, <i>getOrFail</i> and <i>set</i> methods for the <i>ICollection</i> and <i>IAsyncCollection</i> contracts
        -   <i>get</i> method makes it easy to retrieve an item based on index. If item is not found null will be returned.
        -   <i>getOr</i> method makes it easy to retrieve an item based on index. If item is not found an error will be thrown.
        -   <i>set</i> method makes it easy to set item by index.

## 0.8.1

### Patch Changes

-   0684e61: ## Changes
    -   Improved the IEventBusManager
    -   Improved the IStorageManager

## 0.8.0

### Minor Changes

-   a462c8f: ## New features

    -   Added EventBus class and IEventBus contract that includes methods that are useful for multitennacy.
    -   Added IEventBusAdapter, RedisEventBusAdapter and MemoryEventBusAdapter.

    ## Improvements

    -   Improvevd IStorage so they trigger events that can be listenable
    -   Improved IStorage by adding new methods that that are useful for multitennacy

    ## New Features

    -   Introduced the `EventBus` class and the `IEventBus` contract, which provide essential methods for supporting multitenancy.
    -   Added IEventBusAdapter contract the following event bus adapters:
        -   `RedisEventBusAdapter`
        -   `MemoryEventBusAdapter`

    ## Improvements

    -   Enhanced `IStorage` to trigger events that can be subscribed to for better event-driven behavior.
    -   Expanded `IStorage` with new methods designed to support multitenancy effectively.

## 0.7.0

### Minor Changes

-   99c4671: Simplified the storage contracts

## 0.6.0

### Minor Changes

-   f324fc1: # Storage
    -   Simplified StorageAdapter contract
    -   Changed the StorageAdapter and Storage contract to use PromiseLike instead of Promise.
    -   Changed the Storage class to use LazyPromise instead of Promise.
    -   Removed unnecessary try catches from Storage class so unknown error can propagate up

## 0.5.0

### Minor Changes

-   790a76c: # IAsyncCollection and AsyncIterableCollection
    Changed IAsyncCollection contract to use PromiseLike instead of Promise.
    Changed AsyncIterableCollection to use LazyPromise instead of Promise.
    Removed all try catches catched unknown errors.
    Renamed timeout to takeUntilTimeout, and abort to takeUntilAbort.

## 0.4.0

### Minor Changes

-   e2031da: # New features

    ## Async utilities

    -   Added <i>abortable</i> async utility function.
    -   Added <i>abortableIterable</i> utility function.
    -   Added <i>delay</i> async utility function.
    -   Added <i>delayIterable</i> utility function.
    -   Added <i>retry</i> async utility function.
    -   Added <i>retryIterable</i> utility function.
    -   Added <i>timeout</i> async utility function.
    -   Added <i>timeoutIterable</i> utility function.
    -   Added <i>LazyPromise</i> class utility.
    -   Added <i>constant</i>, <i>exponential</i>, <i>linear</i> and <i>polynomial</i> backoff policies.

    ## Utilities

    -   Added TimeSpan class that makes easy to work time intervals.

-   d070f85: Introduced a new namespace feature for the Storage contract. This enhancement enables the creation of a new Storage instance with a specified prefixed namespace, derived from the current Storage.

### Patch Changes

-   d070f85: Removed AsyncDispose for StorageContract

## 0.3.0

### Minor Changes

-   ff9b885: ## Cache

    ### Contracts

    -   Added cache contract
    -   Added cache adapter contract.

    ### Adapters

    -   Added redis cache adapter
    -   Added mongodb cache adapter
    -   Added sqlite cache adapter.

    ## Serializer

    ### Contracts

    -   Added serializer contract

    ### Adapters

    -   Added super json serializer adapter
    -   Added redis serializer adapter
    -   Added mongodb serializer adapter
    -   Added sqlite serializer adapter.

## 0.2.1

### Patch Changes

-   fad301c: Removed documentation for internal functions

## 0.2.0

### Minor Changes

-   7cb54cb: ## ICollection and IAsyncCollection changes
    Removed the <i>throwOnIndexOverflow</i> setting from all ICollection and IAsyncCollection methods. This change was made because the setting <i>throwOnIndexOverflow</i> was unnecessary; it only applied to very large collections, where using JavaScript is not advisable.

    Changed the <i>slice</i> method signature to align with the JavaScript version.

    Changed the <i>shuffle</i> method to accept a custom Math.random function, making it easier for testing.

    Changed the <i>sum</i>, <i>average</i>, <i>median</i>, <i>min</i>, <i>max</i>, and <i>percentage</i> methods to throw an error when the collection is empty.

    Changed the <i>crossJoin</i> method signature and its usage to ensure proper type inference.

## 0.1.5

### Patch Changes

-   7206c93: Updated the docs

## 0.1.4

### Patch Changes

-   218a64c: Added link to docs in readme

## 0.1.3

### Patch Changes

-   60c686d: Added proper documentation, changed som method names, added 2 new methods

## 0.1.2

### Patch Changes

-   a10193f: Empty collection class instances can be created without passing in empty arrays

## 0.1.1

### Patch Changes

-   25b7503: Added npmignore

## 0.1.0

### Minor Changes

-   First release
