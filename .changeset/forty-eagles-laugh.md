---
"@daiso-tech/core": minor
---

Removed `IGroupableLockProvider` contract and remove `getGroup` method from `ILockProvider` meaning you cant longer use `withGroup` and `getGroup` methods of the `LockProvider`class. This feature was not flexible.
