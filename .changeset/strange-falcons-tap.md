---
"@daiso-tech/core": minor
---

## New features
* Added EventBus class and IEventBus contract that includes methods that are useful for multitennacy.
* Added IEventBusAdapter, RedisEventBusAdapter and MemoryEventBusAdapter.

## Improvements
* Improvevd IStorage so they trigger events that can be listenable
* Improved IStorage by adding new methods that that are useful for multitennacy

## New Features
- Introduced the `EventBus` class and the `IEventBus` contract, which provide essential methods for supporting multitenancy.
- Added IEventBusAdapter contract the following event bus adapters:
  - `RedisEventBusAdapter`
  - `MemoryEventBusAdapter`

## Improvements
- Enhanced `IStorage` to trigger events that can be subscribed to for better event-driven behavior.
- Expanded `IStorage` with new methods designed to support multitenancy effectively.