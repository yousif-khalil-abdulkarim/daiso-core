---
"@daiso-tech/core": minor
---

Updated `ILock` contract.

- Removed the method `getRemainingTime`.

- Removed the method `getOwner`.

- Removed the method `isExpired`.

- Removed the method `isLocked`.

- Added `getState` method that replaces the following methods `getRemainingTime`, `getOwner`, `isExpired` and `isLocked`.

- Added `key` readonly field that returns the lock instance key.

- Added `id` readonly field that returns the lock instance id.

- Added `ttl` readonly field that returns the lock instance ttl.

- The `refreshOrFail` now only throws one error, it throws `FailedRefreshLockError`
