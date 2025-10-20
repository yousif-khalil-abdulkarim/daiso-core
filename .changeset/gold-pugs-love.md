---
"@daiso-tech/core": minor
---

Added new default namespaces for the following components:

- `Cache`
- `CacheFactory`
- `EventBus`
- `EventBusFactory`
- `LockProvider`
- `LockFactory`

Now you can use following constant variables:

- ```ts
  const DEFAULT_CACHE_NAMESPACE = new Namespace("@cache");
  ```
- ```ts
  const DEFAULT_EVENT_BUS_NAMESPACE = new Namespace("@event-bus");
  ```
- ```ts
  const DEFAULT_LOCK_PROVIDER_NAMESPACE = new Namespace("@lock-provider");
  ```
