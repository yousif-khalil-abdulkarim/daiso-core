# @daiso-tech/core

## 0.37.3

### Patch Changes

- 3ca15f1: Updated package.json

## 0.37.2

### Patch Changes

- 8cbf371: Updated package.json

## 0.37.1

### Patch Changes

- 4137d8c: Updated the docs

## 0.37.0

### Minor Changes

- bd9e529: ---

    ## "@daiso-tech/core": minor

    `LibsqlLockAdapter` and `SqliteLockAdapter` have been removed. Use `KyselyLockAdapter` instead. It supports `postgres`, `mysql`, and `sqlite` (including derived databases) via `kysely`.

- bd9e529: `LibsqlCacheAdapter` and `SqliteCacheAdapter` have been removed. Use `KyselyCacheAdapter` instead. It supports `postgres`, `mysql`, and `sqlite` (including derived databases) via `kysely`.
- 2cb3dd2: Added [standard schema](https://standardschema.dev/) integration with following components:

    - `Collection` and `AsyncCollection` components can now use [standard schema](https://standardschema.dev/) object filter all items match the schema and thereafter transform the matched items.
    - `Cache` component can now use [standard schema](https://standardschema.dev/) object to validate all input and output data.
    - `EventBus` component can now use [standard schema](https://standardschema.dev/) object to validate all input and output data.
    - `fallback` middleware can now use [standard schema](https://standardschema.dev/) as error policy.
    - `retry` middleware can now use [standard schema](https://standardschema.dev/) as error policy.

## 0.36.0

### Minor Changes

- 3ca9190: Renamed `FallbackSettings.fallbackPolicy` to `FallbackSettings.errorPolicy`
- 3ca9190: - Removed the following types:

                - `AsyncFactoryable`
                - `Factoryable`

    - Updated remaining factory types to use the new `InvokableFn` and `InvokableObject` contracts:
        - Synchronous factories:
            - `FactoryFn`
            - `IFactoryObject`
            - `Factory`
        - Asynchronous factories:
            - `AsyncFactoryFn`
            - `IAsyncFactoryObject`
            - `AsyncFactory`

    This change simplifies the type hierarchy and ensures consistent behavior between factory and invokable patterns.

- 3ca9190: Renamed `IAsyncCollection.values` method `IAsyncCollection.copy`
- 3ca9190: Renamed `ICollection.values` method `ICollection.copy`
- 3ca9190: Made `LockProviderSettingsBase.namespace` optional by using default value
- 3ca9190: Made `CacheSettingsBase.namespace` optional by using default value
- 3ca9190: Renamed `RetrySettings.retryPolicy` to `RetrySettings.errorPolicy`
- 47f061a: Renamed the `KeyPrefixer` class to `Namespace`.
  Renamed the `CacheSettingsBase.keyPrefixer` setting to `CacheSettingsBase.namespace`.
  Renamed the `EvebtBusSettingsBase.keyPrefixer` setting to `EvebtBusSettingsBase.namespace`.
  Renamed the `LockProviderSettingsBase.keyPrefixer` setting to `LockProviderSettingsBase.namespace`.
- 3ca9190: Added new methods to the `Namespace` class:

    - `setIdentifierDelimeter` method: allows for overriding `NamespaceSettings.identifierDelimeter`
    - `setKeyDelimeter` method: allows for overriding `NamespaceSettings.keyDelimeter`
    - `setRootIdentifier` method: allows for overriding `NamespaceSettings.rootIdentifier`
    - `appendRoot` method: allows for appending to `InternalNamespace` class constructor argument `_rootPrefix`

- 3ca9190: Added new types `ResultFailure` and `ResultSuccess`.
- 3ca9190: Made `CacheSettingsBase.namespace` optional by using default value

### Patch Changes

- cc0d9e9: Fixed a serialization issue in the Lock class where using multiple adapters caused improper serialization and deserialization. The Lock now correctly serializes and deserializes across all supported adapters.
- d2f36f2: Added documentation website

## 0.35.4

### Patch Changes

- 9747f8d: Renamed `FoundCacheEventt` type to `FoundCacheEvent`.

## 0.35.3

### Patch Changes

- 9a127d2: Updated documentation

## 0.35.2

### Patch Changes

- a3223f5: docs/async-hooks
- a3223f5: Updated docs of `AsyncHooks` and `Hooks` classes.

## 0.35.1

### Patch Changes

- b7438c6: Updated `concurentHedging middleware to abort promises by AbortSignal`

## 0.35.0

### Minor Changes

- a2c56f4: Added a new `sequentialHedging` middleware that executes the primary function and all fallback functions sequentially.
  It returns the result of the first successful function and automatically cancels all remaining function.
  If all function fail than error is thrown.
- a2c56f4: Updated the settings of `dynamic`, `fallback`, `hedging`, `observe`, `retry`, and `timeout` middlewares.
- a2c56f4: Updated the `AsyncHook` class to accept an `AbortSignalBinder` parameter. This enables binding an `AbortSignal` to the middleware for two-way abortion control.
  The `AsyncHook` know exposes function name to the middleware function which is useful for logging.
- f604f53: Simplified the `IEventBus` contract to use event map instead of classes for events. The following classes / contracts are effected:
    - `ILockProvider` contract and `LockProvider` class.
    - `ICache` contract and `Cache` class.
    - `IFlexibleSerde` contract and `Serde` class.
        - The `registerEvent` method is not needed longer and thereby is removed.
- f604f53: Renamed the cache events.
- a2c56f4: Updated `Hook` class. It know exposes function name to the middleware function which can is useful for logging.
- a2c56f4: Added new `bulkhead` middleware to limit concurrent execution of `PromiseLike` objects to a specified maximum.
- f604f53: Renamed the lock events.
- a2c56f4: Added a new `concurrentHedging` middleware executes the primary function and all fallback functions concurrently.
  It returns the result of the first successful function and automatically aborts all remaining functions.
  If all function fail than error is thrown.

## 0.34.0

### Minor Changes

- 7e5a059: Added new utility `Hooks` class which allows for adding middlewares to any sync functions.
- 96e2f95: Removed `delay`, `takeUntilAbort` `takeUntilTimeout` from `IAsyncCollection` contract.
- 96e2f95: Following methods where removed from `LazyPromise`:

    - `setAbortSignal`
    - `setTotalTimeout`
    - `setRetryTimeout`
    - `setRetryPolicy`
    - `setRetryAttempts`
    - `setBackofPolicy`

    The new approach allows you to apply `AsyncMiddleware` to `LazyPromise` by the `pipe` and `pipeWhen` methods. This change promotes a more composable and extendable design while reducing API surface area.

- f8a6439: Added following middlewares:
    - `dynamic`: Enables runtime configuration of other middlewares for flexible behavior adjustments.
    - `fallback`: Provides a default value or fallback mechanism when an error occurs.
    - `retry`: Automatically retries failed operations with customizable retry policies.
    - `timeout`: Ensures functions terminate after a specified duration to prevent hanging.
    - `observe`: Monitors async functions, tracking success/failure states for logging or analytics.
- 7e5a059: Added new utility `AsyncHooks` class which allows for adding middlewares to any sync and async functions.

### Patch Changes

- ea8aff2: Enhanced performance of `crossJoin` method in the following collection classes:
    - `ListCollection`
    - `IterableCollection`
    - `AsyncIterableCollection`

## 0.33.0

### Minor Changes

- afba80e: Changed `ILock` contract to not extend `IEventListenable` contract. Meaning you can't add listeners to a specific `ILock`. This feature was unnecessary.
- 73973ef: Removed `addListenerMany`, `removeListenerMany`, `subscribeMany`, and `dispatchMany` from `IEventBus` contract because they where unnecessary.
- d223f07: Removed `IGroupableEventBus` contract and remove `getGroup` method from `IEventBus` meaning you cant longer use `withGroup` and `getGroup` methods of the `EventBus`class. This feature was not flexible.
- 2ae41e0: Changed `Cache` class so it cannot take adapter factory. This feature was not flexible and unnecessary.
- 653a224: Removed `IGroupableLockProvider` contract and remove `getGroup` method from `ILockProvider` meaning you cant longer use `withGroup` and `getGroup` methods of the `LockProvider`class. This feature was not flexible.
- de018b1: Changed `EventBus` class so it cannot take adapter factory. This feature was not flexible and unnecessary.
- f54390c: Removed the `group` field from all `ICache` events.
- ab20280: Removed `IGroupableCache` contract and remove `getGroup` method from `ICache` meaning you cant longer use `withGroup` and `getGroup` methods of the `Cache`class. This feature was not flexible.
- 75a0999: Changed `LockProvider` class so it cannot take adapter factory. This feature was not flexible and unnecessary.

## 0.32.1

### Patch Changes

- 7b77989: Updated documentation.

## 0.32.0

### Minor Changes

- d66438f: Addded new static method to <i>LazyPromise</i> class:
    - The <i>fromCallback</i> method is a convenient utility for wrapping Node.js-style callback functions into a <i>LazyPromise</i>.
- d66438f: Removed <i>onError</i>, <i>onSuccess</i>, and <i>onFinally</i> from <i>LazyPromise</i>. Added <i>addListener</i> and <i>removeListener</i> instead, making it easier to track and handle all states of a <i>LazyPromise</i> which is useful for observability.
- d66438f: Removed <i>LazyPromiseSettings</i> from the follwing classes:

    - Cache
    - CacheFactory
    - LockProvider
    - LockProviderFactory
    - EventBus
    - EventBusFactory
    - AsyncIterableCollection

    Instead, you now pass a <i>lazyPromiseFactory</i> settings field to configure <i>LazyPromise</i> defaults for these classes.

## 0.31.1

### Patch Changes

- 1747137: Improved docs

## 0.31.0

### Minor Changes

- a897a71: Updated the <i>LazyPromise</i> <i>wrapFn</i> method to support <i>Invokable</i> tyeps as an argument

### Patch Changes

- a897a71: Fixed a typing bug in the static <i>LazyPromise</i> wrap method.

## 0.30.0

### Minor Changes

- 45bc897: Updated <i>ICollection</i> and <i>IAsyncCollection</i> to support <i>Invokable</i> types, for example allowing <i>IInvokableObject</i> instances as predicates.

## 0.29.0

### Minor Changes

- c4058ae: Added <i>subscribeOnce</i> method to the <i>IEventBus</i> contract. It works like <i>listenOnce</i> but returns an <i>unsubscribe</i> function for easier management.

### Patch Changes

- c4058ae: Fixed a bug in the <i>EventBus</i> class's <i>listenOnce</i> method: listener can now be removed before their first trigger.
- 501e19c: Fixed major bug with package.json exports field

## 0.28.1

### Patch Changes

- d597727: Fixed a bug in <i>LockProvider</i> where using two <i>ILockAdapter<i> instances with the same name caused ILock serialization/deserialization issues. Now, you can pass in unique prefix to <i>LockProvider</i> to differentiate them.

## 0.28.0

### Minor Changes

- f7c33fb: Added new <i>ICacheAdapter</i> class: <i>NoOpCacheAdapter</i> that is used for easily mocking <i>ICache</i> for testing.
- ceaac8a: Removed <i>setTimeout</i> method of <i>LazyPromise</i> class.
- f7c33fb: Added <i>ILockAdapter</i> class: <i>NoOpLockAdapter</i> that is used for easily mocking <i>ILockProvider</i> for testing.
- ceaac8a: Added new method to <i>LazyPromise</i> class:
    - <i>setRetryTimeout</i>: Sets a timeout for each retry attempt, ensuring it aborts if retry exceeds the specified time.
- ceaac8a: Added new method to <i>LazyPromise</i> class:
    - <i>setTotalTimeout</i>: Sets a timeout <i>LazyPromise</i>, ensuring it aborts if <i>LazyPromise</i> exceeds the specified time.
- 8285a0d: Added new methods to ILock contract: runBlockingOrFail, and acquireBlockingOrFail.

### Patch Changes

- 8f69793: Updated documentation
- f7c33fb: Fixed a bug with <i>LockProviderFactory</i> class, now each named <i>ILockAdapter</i> has a unique <i>KeyPrefixer</i> instance.
- f7c33fb: Updated old types of <i>LockProviderFactory</i> class.
- f7c33fb: Fixed a bug with <i>CacheFactory</i> class, now each named <i>ICacheAdapter</i> has a unique <i>KeyPrefixer</i> instance.
- 8f69793: Fixed a bug with resolving the OneOrMore type
- f7c33fb: Fixed a bug with <i>KeyPrefixer</i> class <i>originalRootPrefix</i> method.
- f7c33fb: Updated old types of <i>EventBusFactory</i> class.
- 6cae88d: Updated the <i>ICache</i> contract: modified the <i>removeMany</i> method to accept an <i>Iterable</i> argument instead of an <i>Array</i>.

## 0.27.0

### Minor Changes

- e6ad128: Added new method <i>onError</i> on <i>LazyPromise</i> class.
- 5a2a996: Updated the <i>Cache</i> and <i>CacheFactory</i> classes, they can now take factory function/object that returns a <i>ICacheAdapter</i> and <i>IDatabaseCacheAdapter</i>.
- 0602f10: Made the <i>LockProviderFactory</i> class configurable by using the builder pattern.
- d947cb3: Shortend the import paths
- e6ad128: Changed <i>LazyPromise</i> class to be immutable.
- 9c8b932: Made the <i>CacheFactory</i> class configurable by using the builder pattern.
- e6ad128: Moved the <i>delay</i> function to <i>LazyPromise</i> class as a static method.
- e6ad128: Added new method <i>onSuccess</i> on <i>LazyPromise</i> class.
- 5a2a996: Removed <i>withGroup</i> and <i>group</i> methods from <i>ICacheAdapter</i>. Added <i>removeAll</i> method to <i>ICacheAdapter</i>.
- e6ad128: Removed callbacks from <i>LazyPromise</i> <i>defer</i> method.
- 0602f10: Updated the <i>LockProvider</i> and <i>LockProviderFactory</i> classes, they can now take factory function/object that returns a <i>ILockAdapter</i> or <i>IDatabaseLockAdapter</i>.
- 5a2a996: Removed the following methods from <i>ICache</i> contract:
    - <i>existsMany</i>
    - <i>missingMany</i>
    - <i>getMany</i>
    - <i>getOrMany</i>
    - <i>addMany</i>
    - <i>updateMany</i>
    - <i>putMany</i>
      Changed the <i>removeMany<i> method, it now returns a boolean.
- b9d03e1: Removed <i>withGroup</i> and <i>group</i> methods from <i>IEventBusAdapter</i> contract.
- 0602f10: Removed <i>withGroup</i> and <i>group</i> methods from <i>ILockAdapter</i> and <i>IDatabaseLockAdapter</i>.
- 9c8b932: Made the <i>EventBusFactory</i> class configurable by using the builder pattern.
- 5a2a996: Added <i>IDatabaseCacheAdapter</i> contract.
- e6ad128: Added new method <i>onFinally</i> on <i>LazyPromise</i> class.
- b9d03e1: Updated the <i>EventBus</i> and <i>EventBusFactory</i> classes, they can now take factory function/object that returns a <i>IEventBusAdapter</i>.

### Patch Changes

- 5a2a996: Fixed a bug with <i>LockProvider</i> class
- dd22f21: Fixed a typecript bug with <i>IEventListenable</i> contract.

## 0.26.1

### Patch Changes

- 2128106: Fixed a but <i>LockProvider</i> class

## 0.26.0

### Minor Changes

- a93ee80: The <i>Pipeline</i> class <i>invoke</i> method can now take function, async function, LazyPromise and reguler value
- 70e2494: Changed <i>IInvokableObject</i> method name
- b34c3dc: The <i>LazyPromise</i> <i>defer</i> method now accepts callbacks <i>onSuccess</i>, <i>onFailure</i>, and <i>onFinally</i>.
- 70e2494: Removed <i>IEventListenerObject</i> and <i>EventListener</i> types.
- 84e333c: Added new <i>Pipeline</i> utility class makes it easy to chain multiple functions and <i>IInvokableObject</i> instances together. Each function or object in the pipeline can inspect or modify the input as it passes through. The <i>Pipeline</i> class is immutable, so you can safely extend or modify it without causing issues.
- 0cc289d: Changed the serialization, deserialization of the <i>TimeSpan</i> class

## 0.25.0

### Minor Changes

- a4349e5: Renamed <i>ILockListener</i> contract to <i>ILockListenable</i>.
- a4349e5: Renamed <i>ICacheListener</i> contract to <i>ICacheListenable</i>.
- 92d7dd3: The <i>LockProvider</i> class and <i>LockProviderFactory</i> class uses <i>MemoryEventBusAdapter</i> by default now.
- 76063a4: Renamed <i>IEventListener</i> contract to <i>IEventListenable</i>.
- 89aa51e: Added 2 new methods for <i>ILock</i> contract, <i>acquireBlocking</i> and <i>runBlocking</i>.
  They retry acquiring the lock at a set interval until the timeout is reached."
- 76063a4: Renamed <i>Listener</i> type to <i>EventListener</i>
- 76063a4: Enhanced the <i>IEventListenable</i> contract to support both function, object literal and class instance listeners, providing greater flexibility in event handling.
- afa57c7: Added new method <i>asPromise</i> to the <I>IEventBus<i>. The <i>asPromise</i> method returns <i>LazyPromise</i> objecet that resolves once the <i>BaseEvent</i> is dispatched.

### Patch Changes

- 57e4bb5: Updated documentation
- 92d7dd3: The <i>Cache</i> class and <i>CacehFactory</i> class uses <i>MemoryEventBusAdapter</i> by default now.

## 0.24.0

### Minor Changes

- 1f1b344: Renamed function <i>registerEventBusErrors</i> to <i>registerEventBusErrorsToSerde</i>.
- 78bad79: Made <i>ListCollection</i> and <i>IterableCollection</i> class serializable and deserializable.
- 1f1b344: Renamed function <i>registerCacheErrors</i> to <i>registerCacheErrorsToSerde</i>
- 8253d62: Changed <i>Lock</i> class so it now doesn't implement <i>ISerdeTransformer</i> contract.
- fadaaeb: - Changes
    - Converted the project to ESM only module.
    - Removed the main entrypoint and multiple entry points to the project via package.json exports field.
- 4e4b1b8: Added new <i>Serde</i> class that implements <i>IFlexibleSerded</i> and that can be derivied from <i>IFlexibleSerdeAdapter</i>.
- 1f1b344: Renamed function <i>registerCacheEvents</i> to <i>registerCacheEventsToSerde</i>
- 66215ea: The <i>ISerdeTransformer</i> contract name field can now be bot a <i>string</i> and <i>string[]</i>.

### Patch Changes

- 7055619: Improved lock component documentation
- 8253d62: Fixed a bug with <i>Lock</i> class serialization and deserialization
- 1f1b344: Added new functions <i>registerCollectionsToSerde</i> and <i>registerCollectionErrorsToSerde</i>

## 0.23.0

### Minor Changes

- 9160158: Renamed <i>UnownedExtendLockError</i> to <i>UnownedRefreshLockError</i>
- ebd0666: Removed <i>IDatabaseLockAdapter</i> inheritance from <i>IDeinitizable</i> and <i>IInitizable</i> to simplify the contract.
- 4a4b537: Removed the <i>ISerdeRegistrable</i> contract
- ebd0666: Removed <i>isLocked</i> method and <i>getRemainingTime</i> method from <i>ILockAdapter</i>.

### Patch Changes

- 4a4b537: Updated READNE.md and package.json.
- ebd0666: - <i>Lock</i> class
    - Fixed a bug in <i>acquireOrFail</i>, it now correctly throws an error.

## 0.22.2

### Patch Changes

- e456cbe: Updated READNE.md and package.json.

## 0.22.1

### Patch Changes

- c2a6a79: Added more documentation for the lock component

## 0.22.0

### Minor Changes

- ecabc49: - Changes
    - Remove static settings methods and settings builder classes from:
        - EventBus class
        - EventBusFactory class
        - MemoryEventBusAdapter class
        - RedisPubSubEventBusAdapter class
- 1c41caf: - New features
    - Added new <i>ILock</i> <i>UnexpectedLockErrorEvent</i> that will dispatched when error occurs.
    - Added event listeners to <i>ILockProvider</i>, enabling monitoring of lock events from multiple locks.
    - Changes
        - Made all the <i>ILock</i> events defered when dispatched.
- 1821d46: - New features
    - Added new <i>ICache</i> <i>UnexpectedCacheErrorEvent</i> that will dispatched when error occurs.
    - Changes
        - Made all the <i>ICache</i> events defered when dispatched.
- 9a0c764: - Changes
    - Remove static settings methods and settings builder classes from:
        - Cache class
        - CacheFactory class
        - MemoryCacheAdapter class
        - MongodbCacheAdapter class
        - LibsqlCacheAdapter class
        - SqliteCacheAdapter class
        - RedisCacheAdapter class
- 9ef0a81: - New features
    - Added distributed lock.
        - Contracts
            - Added IDatabaseLockAdapter
            - Added ILockAdapter
            - ILockProvider
            - ILockProviderFactory
            - ILock
        - Derivables
            - Added <i>LockProvider</i> class.
            - Added <i>LockProviderFactory</i> class.
        - Adapter
            - LibsqlLockAdapter
            - MemoryLockAdapter
            - MongodbLockAdapter
            - RedisLockAdapter
            - SqliteLockAdapter
- 0dfe16c: - Changes
    - Simplified the cacheAdapterTestSuite
    - Simplified the cacheTestSuite
- 8fa218c: - Changes
    - Simplified the eventBusAdapterTestSuite
    - Simplified the eventBusTestSuite
- e2f6d79: - Changes
    - IAsyncCollection: You can now pass in LazyPromise as default value in the following methods.
        - firstOr
        - lastOr
        - beforeOr
        - afterOr
    - Cache: You can now pass in LazyPromise as default value in the following methods.
        - getOr
        - getOrAdd

### Patch Changes

- ef2315b: Fixed a minor type bug
- d486046: Added missing exports
- 604e43f: - Improved documentations

## 0.21.1

### Patch Changes

- c3aaf06: - Fixed bugs with LazyPromise class
- ccf442d: - Removed <i>exists</i> mehtod from the <i>ICacheAdapter</i> contract and all classes that implement the contract.

## 0.21.0

### Minor Changes

- afdd280: - Removed <i>shouldRegisterEvents</i> and <i>shouldRegisterErrors</i> from <i>CacheSettings</i>.
    - Removed <i>shouldRegisterErrors</i> from <i>EventBusSettings</i>.
- 81396af: - Updated the documentation and made <i>CacheSettings.eventBus</i> field required.

## 0.20.0

### Minor Changes

- 3dfbd75: - Updated the <i>ICacheAdapter</i> contract: The <i>withGroup</i> method now accepts only a string as its argument.
    - Updated the <i>IEventBusAdapter</i> contract: The <i>withGroup</i> method now accepts only a string as its argument.

## 0.19.0

### Minor Changes

- 615e616: - Added new settings to the <i>Cache</i> class, allowing you to decide whether to register all <i>Cache</i> related events and errors.

## 0.18.0

### Minor Changes

- 29334ad: ### Changes
    - Simplified the event registration process by removing the <i>registerCacheEvents</i> function.
    - All cache-related events are now registered directly within the <i>Cache</i> class constructor for improved clarity and maintainability.
- a6fe783: ### Changes
    - Made all the cahce related Error serializable and deserializable
    - All cache related error are registered directly within the <i>Cache</i> class constructor for improved clarity and maintainability
- 97a3934: ### Changes
    - Made all the event bus related Error serializable and deserializable
    - All event bus related error are registered directly within the <i>EventBus</i> class constructor for improved clarity and maintainability
- f64191c: ### Changes
    - Introduced a new method, <i>registerCustom</i>, in the <i>IFlexibleSerde</i> contract.
      This method enables support for custom serialization and deserialization processes.

## 0.17.4

### Patch Changes

- 29aa4d7: Improved documentation

## 0.17.3

### Patch Changes

- 6d9dd94: Updated documentation

## 0.17.2

### Patch Changes

- c31871e: Added missing imports

## 0.17.1

### Patch Changes

- 5f8076b: Improved documentation

## 0.17.0

### Minor Changes

- e21e0ce: ### Changes

    - <i>ICache</i> and <i>ICacheAdapter</i> Enhancements:
        - All <i>ICache</i> and <i>ICacheAdapter</i> classes now take a single constructor argument.
        - A settings builder has been introduced for all <i>ICache</i> and <i>ICacheAdapter</i> classes.
    - <i>IEventBus</i> and <i>IEventBusAdapter</i> Enhancements:
        - All <i>IEventBus</i> and <i>IEventBusAdapter</i> classes now take a single constructor argument.
        - A settings builder has been introduced for all <i>IEventBus</i> and <i>IEventBusAdapter</i> classes.
    - <i>LazyPromise</i> class Enhancements:
        - Removed the settings from <i>LazyPromise</i> class.
        - Renamed to methods to use set as prefix

### Patch Changes

- e21e0ce: ### Changes
    - Generic Type Defaults: Added default generic types for the following interfaces and classes
    - Caching
        - ICache contract
        - Cache class
        - ICacheAdapter contract
        - MemoryCacheAdapter class
        - SqliteCacheAdapter class
        - LibsqlCacheAdapter class
        - RedisCacheAdapter class
        - MongodbCacheAdapter class
    - Event bus:
        - IEventBus contract
        - EventBus class
    - Collections:
        - IAsyncCollection contract
        - AsyncIterableCollection class
        - ICollection contract
        - IterableCollection class
        - ListCollection class
- caa9f36: ## Changes
    - Ensured consistent serialization and deserialization in all the cache adapters and event bus adapters.
- e21e0ce: ### Changes
    - Remove <i>withType</i> method from <i>ICacheFactory</i> and <i>IEventBusFactory</i>.

## 0.16.0

### Minor Changes

- 9197902: ## Changes
    - Moved cache group logic from the <i>Cache</i> class into the adapters classes.
        - **Key Impact**: Each adapter is now required to implement the <i>getGroup</i> and <i>withGroup</i> methods.
        - This change enhances flexibility for adapter-specific logic.
- 7d07f5d: ## New Features

    - Introduced new static helper methods for the <i>LazyPromise</i> class:

        - <i>all</i>
        - <i>allSettled</i>
        - <i>race</i>
        - <i>any</i>

        These methods are similar to JavaScript <i>Promise</i> methods but execute lazily.

- 29bfdf2: ## Changes
    - Renamed everything that start with </i>namespace</i> to </i>group</i>.
- cd2342b: ## Changes

    - Renamed all instances of the <i>ISerializer</i> contract to <i>ISerde</i>.
    - Added two new contracts:
        - <i>IDeserializer</i>: Handles only deserialization.
        - <i>ISerializer</i>: Handles olny serialization.

    ## New Features

    - Introduced the <i>ISerializable</i> contract, enabling classes to be marked as serializable.
    - Added the <i>IFlexibleSerde</i> contract, allowing registration of custom classes for serialization and deserialization.
    - Implemented the <i>ISerializable</i> contract the <i>TimeSpan</i> class.

- 46d2474: ## New features
    - Introduced a new static helper method <i>wrapFn</i> for the <i>LazyPromise</i> class.
      This method simplifies the process of wrapping asynchronous functions with <i>LazyPromise</i>.
- d3eec52: ## Changes
    - Removed abstract <i>BaseCache</i> class
    - Removed abstract <i>BaseEventBus</i> class
    - Added lazyPromiseSettings for <i>AsyncIterableCollection</i> class
    - Added lazyPromiseSettings for <i>Cache</i> class
    - Added lazyPromiseSettings for <i>EventBus</i> class
- 5e7dae8: ## New features

    - Introduced a instance static method <i>listenOnce</i> for the <i>IEventBus</i> contract and <i>EventBus</i> class.
      This method simplifies add listener that will only execute once.

    ## Changes

    - Moved event bus group logic from the <i>Cache</i> class into the adapters classes.
        - **Key Impact**: Each adapter is now required to implement the <i>getGroup</i> and <i>withGroup</i> methods.
        - This change enhances flexibility for adapter-specific logic.

- 67ec890: ## New Features
    - Introduced new static helper methods for the <i>AsyncIterableCollection</i>, <i>IterableCollection</i> and <i>ListCollection</i> classes:
        - <i>concat</i>
        - <i>difference</i>
        - <i>zip</i>

## 0.15.0

### Minor Changes

- e08c7d6: ## Changes
    - Changed <i>IEventBus</i> contract to use event maps types.
- 18e68be: ## Changes
    - Removed <i>abort</i>, <i>retry</i>, <i>timeout</i> methods.
    - Added these methods as part of the <i>LazyPromise</i> class for better developer experience.

### Patch Changes

- 2cc89b6: ## Minor features
    - Added reusable tests for <i>ICace</i> contract.

## 0.14.0

### Minor Changes

- 8b27f63: ## Changes
    - Added: A new <i>NoOpCacheAdapter</i> for mocking cache operations in testing environments.
    - Updated: All cache and eventbus adapters now require a serializer to be explicitly provided, ensuring consistent serialization behavior.
    - Removed: The validation feature has been removed from the <i>EventBus</i> and <i>EventBusFactory</i> classes.
    - Added: A new abstract class <i>BaseEventBus</i> to simplify the implementation of <i>IEventBus</i>. This allows direct use without needing <i>IEventBusAdapter</i>.

## 0.13.0

### Minor Changes

- 29e7aee: ### ICollection

    - **Added `toRecord`**: Converts a collection to a `Record` if the items are tuples of two elements, where the first element is a `string`, `number`, or `symbol`.
    - **Added `toMap`**: Converts a collection to a `Map` if the items are tuples of two elements.

    ### IAsyncCollection

    - **Added `toRecord`**: Converts a collection to a `Record` if the items are tuples of two elements, where the first element is a `string`, `number`, or `symbol`.
    - **Added `toMap`**: Converts a collection to a `Map` if the items are tuples of two elements.

## 0.12.0

### Minor Changes

- dc33da1: ## Changes

    - Added Cache module that can work ttl keys and none ttl keys.
    - Remove Storage module in favor of the Cache module because it can with ttl keys and none ttl keys.
    - Added MongodbCacheAdapter
    - Added SqliteCacheAdapter
    - Added LibsqlCacheAdapter
    - Added RedisCacheAdapter
    - Added MemoryCacheAdapter

    ## Changes

    - Added Cache module: Introduced a new Cache module that supports both TTL (time-to-live) keys and non-TTL keys.
    - Removed Storage module: Its functionality has been replaced by the more versatile Cache module, which supports both TTL and non-TTL keys.
        - New Cache Adapters: Added the following cache adapters for improved flexibility and compatibility:
        - MongodbCacheAdapter
        - SqliteCacheAdapter
        - LibsqlCacheAdapter
        - RedisCacheAdapter
        - MemoryCacheAdapter

## 0.11.0

### Minor Changes

- 6308641: ## Changes
    - Enhanced the IStorageFactory, so the will throw runtime erros.
    - Enhanced the IEventBusFactory, so the will throw runtime erros.
    - Simplified the IStorage contract
    - Simplified the IStorageAdapter contract
    - Simplified Storage class
    - Rewrote all the adapters

## 0.10.0

### Minor Changes

- f675866: ## Changes
    - Changed IAsyncCollection contract to use LazyPromise instead PromiseLike.
    - Changed IEventBus contract to use LazyPromise instead PromiseLike.
    - Changed IStorage contract to use LazyPromise instead PromiseLike.
    - Changed ISerializer contract to use PrommiseLike instead Promise.

## 0.9.0

### Minor Changes

- adfe30a: ## Changes
    - Added <i>get</i>, <i>getOrFail</i> and <i>set</i> methods for the <i>ICollection</i> and <i>IAsyncCollection</i> contracts
        - <i>get</i> method makes it easy to retrieve an item based on index. If item is not found null will be returned.
        - <i>getOr</i> method makes it easy to retrieve an item based on index. If item is not found an error will be thrown.
        - <i>set</i> method makes it easy to set item by index.

## 0.8.1

### Patch Changes

- 0684e61: ## Changes
    - Improved the IEventBusManager
    - Improved the IStorageManager

## 0.8.0

### Minor Changes

- a462c8f: ## New features

    - Added EventBus class and IEventBus contract that includes methods that are useful for multitennacy.
    - Added IEventBusAdapter, RedisEventBusAdapter and MemoryEventBusAdapter.

    ## Improvements

    - Improvevd IStorage so they trigger events that can be listenable
    - Improved IStorage by adding new methods that that are useful for multitennacy

    ## New Features

    - Introduced the `EventBus` class and the `IEventBus` contract, which provide essential methods for supporting multitenancy.
    - Added IEventBusAdapter contract the following event bus adapters:
        - `RedisEventBusAdapter`
        - `MemoryEventBusAdapter`

    ## Improvements

    - Enhanced `IStorage` to trigger events that can be subscribed to for better event-driven behavior.
    - Expanded `IStorage` with new methods designed to support multitenancy effectively.

## 0.7.0

### Minor Changes

- 99c4671: Simplified the storage contracts

## 0.6.0

### Minor Changes

- f324fc1: # Storage
    - Simplified StorageAdapter contract
    - Changed the StorageAdapter and Storage contract to use PromiseLike instead of Promise.
    - Changed the Storage class to use LazyPromise instead of Promise.
    - Removed unnecessary try catches from Storage class so unknown error can propagate up

## 0.5.0

### Minor Changes

- 790a76c: # IAsyncCollection and AsyncIterableCollection
  Changed IAsyncCollection contract to use PromiseLike instead of Promise.
  Changed AsyncIterableCollection to use LazyPromise instead of Promise.
  Removed all try catches catched unknown errors.
  Renamed timeout to takeUntilTimeout, and abort to takeUntilAbort.

## 0.4.0

### Minor Changes

- e2031da: # New features

    ## Async utilities

    - Added <i>abortable</i> async utility function.
    - Added <i>abortableIterable</i> utility function.
    - Added <i>delay</i> async utility function.
    - Added <i>delayIterable</i> utility function.
    - Added <i>retry</i> async utility function.
    - Added <i>retryIterable</i> utility function.
    - Added <i>timeout</i> async utility function.
    - Added <i>timeoutIterable</i> utility function.
    - Added <i>LazyPromise</i> class utility.
    - Added <i>constant</i>, <i>exponential</i>, <i>linear</i> and <i>polynomial</i> backoff policies.

    ## Utilities

    - Added TimeSpan class that makes easy to work time intervals.

- d070f85: Introduced a new namespace feature for the Storage contract. This enhancement enables the creation of a new Storage instance with a specified prefixed namespace, derived from the current Storage.

### Patch Changes

- d070f85: Removed AsyncDispose for StorageContract

## 0.3.0

### Minor Changes

- ff9b885: ## Cache

    ### Contracts

    - Added cache contract
    - Added cache adapter contract.

    ### Adapters

    - Added redis cache adapter
    - Added mongodb cache adapter
    - Added sqlite cache adapter.

    ## Serializer

    ### Contracts

    - Added serializer contract

    ### Adapters

    - Added super json serializer adapter
    - Added redis serializer adapter
    - Added mongodb serializer adapter
    - Added sqlite serializer adapter.

## 0.2.1

### Patch Changes

- fad301c: Removed documentation for internal functions

## 0.2.0

### Minor Changes

- 7cb54cb: ## ICollection and IAsyncCollection changes
  Removed the <i>throwOnIndexOverflow</i> setting from all ICollection and IAsyncCollection methods. This change was made because the setting <i>throwOnIndexOverflow</i> was unnecessary; it only applied to very large collections, where using JavaScript is not advisable.

    Changed the <i>slice</i> method signature to align with the JavaScript version.

    Changed the <i>shuffle</i> method to accept a custom Math.random function, making it easier for testing.

    Changed the <i>sum</i>, <i>average</i>, <i>median</i>, <i>min</i>, <i>max</i>, and <i>percentage</i> methods to throw an error when the collection is empty.

    Changed the <i>crossJoin</i> method signature and its usage to ensure proper type inference.

## 0.1.5

### Patch Changes

- 7206c93: Updated the docs

## 0.1.4

### Patch Changes

- 218a64c: Added link to docs in readme

## 0.1.3

### Patch Changes

- 60c686d: Added proper documentation, changed som method names, added 2 new methods

## 0.1.2

### Patch Changes

- a10193f: Empty collection class instances can be created without passing in empty arrays

## 0.1.1

### Patch Changes

- 25b7503: Added npmignore

## 0.1.0

### Minor Changes

- First release
