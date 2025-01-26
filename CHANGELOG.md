# @daiso-tech/core

## 0.19.0

### Minor Changes

-   615e616: - Added new settings to the <i>Cache</i> class, allowing you to decide whether to register all <i>Cache</i> related events and errors.

## 0.18.0

### Minor Changes

-   29334ad: ### Changes
    -   Simplified the event registration process by removing the <i>registerCacheEvents</i> function.
    -   All cache-related events are now registered directly within the <i>Cache</i> class constructor for improved clarity and maintainability.
-   a6fe783: ### Changes
    -   Made all the cahce related Error serializable and deserializable
    -   All cache related error are registered directly within the <i>Cache</i> class constructor for improved clarity and maintainability
-   97a3934: ### Changes
    -   Made all the event bus related Error serializable and deserializable
    -   All event bus related error are registered directly within the <i>EventBus</i> class constructor for improved clarity and maintainability
-   f64191c: ### Changes
    -   Introduced a new method, <i>registerCustom</i>, in the <i>IFlexibleSerde</i> contract.
        This method enables support for custom serialization and deserialization processes.

## 0.17.4

### Patch Changes

-   29aa4d7: Improved documentation

## 0.17.3

### Patch Changes

-   6d9dd94: Updated documentation

## 0.17.2

### Patch Changes

-   c31871e: Added missing imports

## 0.17.1

### Patch Changes

-   5f8076b: Improved documentation

## 0.17.0

### Minor Changes

-   e21e0ce: ### Changes

    -   <i>ICache</i> and <i>ICacheAdapter</i> Enhancements:
        -   All <i>ICache</i> and <i>ICacheAdapter</i> classes now take a single constructor argument.
        -   A settings builder has been introduced for all <i>ICache</i> and <i>ICacheAdapter</i> classes.
    -   <i>IEventBus</i> and <i>IEventBusAdapter</i> Enhancements:
        -   All <i>IEventBus</i> and <i>IEventBusAdapter</i> classes now take a single constructor argument.
        -   A settings builder has been introduced for all <i>IEventBus</i> and <i>IEventBusAdapter</i> classes.
    -   <i>LazyPromise</i> class Enhancements:
        -   Removed the settings from <i>LazyPromise</i> class.
        -   Renamed to methods to use set as prefix

### Patch Changes

-   e21e0ce: ### Changes
    -   Generic Type Defaults: Added default generic types for the following interfaces and classes
    -   Caching
        -   ICache contract
        -   Cache class
        -   ICacheAdapter contract
        -   MemoryCacheAdapter class
        -   SqliteCacheAdapter class
        -   LibsqlCacheAdapter class
        -   RedisCacheAdapter class
        -   MongodbCacheAdapter class
    -   Event bus:
        -   IEventBus contract
        -   EventBus class
    -   Collections:
        -   IAsyncCollection contract
        -   AsyncIterableCollection class
        -   ICollection contract
        -   IterableCollection class
        -   ListCollection class
-   caa9f36: ## Changes
    -   Ensured consistent serialization and deserialization in all the cache adapters and event bus adapters.
-   e21e0ce: ### Changes
    -   Remove <i>withType</i> method from <i>ICacheFactory</i> and <i>IEventBusFactory</i>.

## 0.16.0

### Minor Changes

-   9197902: ## Changes
    -   Moved cache group logic from the <i>Cache</i> class into the adapters classes.
        -   **Key Impact**: Each adapter is now required to implement the <i>getGroup</i> and <i>withGroup</i> methods.
        -   This change enhances flexibility for adapter-specific logic.
-   7d07f5d: ## New Features

    -   Introduced new static helper methods for the <i>LazyPromise</i> class:

        -   <i>all</i>
        -   <i>allSettled</i>
        -   <i>race</i>
        -   <i>any</i>

        These methods are similar to JavaScript <i>Promise</i> methods but execute lazily.

-   29bfdf2: ## Changes
    -   Renamed everything that start with </i>namespace</i> to </i>group</i>.
-   cd2342b: ## Changes

    -   Renamed all instances of the <i>ISerializer</i> contract to <i>ISerde</i>.
    -   Added two new contracts:
        -   <i>IDeserializer</i>: Handles only deserialization.
        -   <i>ISerializer</i>: Handles olny serialization.

    ## New Features

    -   Introduced the <i>ISerializable</i> contract, enabling classes to be marked as serializable.
    -   Added the <i>IFlexibleSerde</i> contract, allowing registration of custom classes for serialization and deserialization.
    -   Implemented the <i>ISerializable</i> contract the <i>TimeSpan</i> class.

-   46d2474: ## New features
    -   Introduced a new static helper method <i>wrapFn</i> for the <i>LazyPromise</i> class.
        This method simplifies the process of wrapping asynchronous functions with <i>LazyPromise</i>.
-   d3eec52: ## Changes
    -   Removed abstract <i>BaseCache</i> class
    -   Removed abstract <i>BaseEventBus</i> class
    -   Added lazyPromiseSettings for <i>AsyncIterableCollection</i> class
    -   Added lazyPromiseSettings for <i>Cache</i> class
    -   Added lazyPromiseSettings for <i>EventBus</i> class
-   5e7dae8: ## New features

    -   Introduced a instance static method <i>listenOnce</i> for the <i>IEventBus</i> contract and <i>EventBus</i> class.
        This method simplifies add listener that will only execute once.

    ## Changes

    -   Moved event bus group logic from the <i>Cache</i> class into the adapters classes.
        -   **Key Impact**: Each adapter is now required to implement the <i>getGroup</i> and <i>withGroup</i> methods.
        -   This change enhances flexibility for adapter-specific logic.

-   67ec890: ## New Features
    -   Introduced new static helper methods for the <i>AsyncIterableCollection</i>, <i>IterableCollection</i> and <i>ListCollection</i> classes:
        -   <i>concat</i>
        -   <i>difference</i>
        -   <i>zip</i>

## 0.15.0

### Minor Changes

-   e08c7d6: ## Changes
    -   Changed <i>IEventBus</i> contract to use event maps types.
-   18e68be: ## Changes
    -   Removed <i>abort</i>, <i>retry</i>, <i>timeout</i> methods.
    -   Added these methods as part of the <i>LazyPromise</i> class for better developer experience.

### Patch Changes

-   2cc89b6: ## Minor features
    -   Added reusable tests for <i>ICace</i> contract.

## 0.14.0

### Minor Changes

-   8b27f63: ## Changes
    -   Added: A new <i>NoOpCacheAdapter</i> for mocking cache operations in testing environments.
    -   Updated: All cache and eventbus adapters now require a serializer to be explicitly provided, ensuring consistent serialization behavior.
    -   Removed: The validation feature has been removed from the <i>EventBus</i> and <i>EventBusFactory</i> classes.
    -   Added: A new abstract class <i>BaseEventBus</i> to simplify the implementation of <i>IEventBus</i>. This allows direct use without needing <i>IEventBusAdapter</i>.

## 0.13.0

### Minor Changes

-   29e7aee: ### ICollection

    -   **Added `toRecord`**: Converts a collection to a `Record` if the items are tuples of two elements, where the first element is a `string`, `number`, or `symbol`.
    -   **Added `toMap`**: Converts a collection to a `Map` if the items are tuples of two elements.

    ### IAsyncCollection

    -   **Added `toRecord`**: Converts a collection to a `Record` if the items are tuples of two elements, where the first element is a `string`, `number`, or `symbol`.
    -   **Added `toMap`**: Converts a collection to a `Map` if the items are tuples of two elements.

## 0.12.0

### Minor Changes

-   dc33da1: ## Changes

    -   Added Cache module that can work ttl keys and none ttl keys.
    -   Remove Storage module in favor of the Cache module because it can with ttl keys and none ttl keys.
    -   Added MongodbCacheAdapter
    -   Added SqliteCacheAdapter
    -   Added LibsqlCacheAdapter
    -   Added RedisCacheAdapter
    -   Added MemoryCacheAdapter

    ## Changes

    -   Added Cache module: Introduced a new Cache module that supports both TTL (time-to-live) keys and non-TTL keys.
    -   Removed Storage module: Its functionality has been replaced by the more versatile Cache module, which supports both TTL and non-TTL keys.
        -   New Cache Adapters: Added the following cache adapters for improved flexibility and compatibility:
        -   MongodbCacheAdapter
        -   SqliteCacheAdapter
        -   LibsqlCacheAdapter
        -   RedisCacheAdapter
        -   MemoryCacheAdapter

## 0.11.0

### Minor Changes

-   6308641: ## Changes
    -   Enhanced the IStorageFactory, so the will throw runtime erros.
    -   Enhanced the IEventBusFactory, so the will throw runtime erros.
    -   Simplified the IStorage contract
    -   Simplified the IStorageAdapter contract
    -   Simplified Storage class
    -   Rewrote all the adapters

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
