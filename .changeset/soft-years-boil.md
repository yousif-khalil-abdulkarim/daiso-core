---
"@daiso-tech/core": minor
---

Removed <i>LazyPromiseSettings</i> from the follwing classes:
  - Cache
  - CacheFactory
  - LockProvider
  - LockProviderFactory
  - EventBus
  - EventBusFactory
  - AsyncIterableCollection

Instead, you now pass a <i>lazyPromiseFactory</i> settings field to configure <i>LazyPromise</i> defaults for these classes.

