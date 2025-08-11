---
"@daiso-tech/core": minor
---

Simplified `ILockAdapter` methods, now they return `Promise` instead of `PromiseLike`. Also updated `forceRelease` and `refresh` methods:
- `forceRelease` method returns true if the lock was released or false if the lock doesnt exists.
- `forceRelease` method returns `LockRefreshResult` enum instead of `boolean`.
