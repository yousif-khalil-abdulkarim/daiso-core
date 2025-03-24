---
"@daiso-tech/core": minor
---

Removed `IGroupableEventBus` contract and remove `getGroup` method from `IEventBus` meaning you cant longer use `withGroup` and `getGroup` methods of the `EventBus`class. This feature was not flexible.

