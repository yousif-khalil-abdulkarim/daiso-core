---
"@daiso-tech/core": minor
---

Simplified the `IEventBus` contract to use event map instead of classes for events. The following classes / contracts are effected:
- `ILockProvider` contract and `LockProvider` class.
- `ICache` contract and `Cache` class.
- `IFlexibleSerde` contract and `Serde` class.
   - The `registerEvent` method is not needed longer and thereby is removed. 