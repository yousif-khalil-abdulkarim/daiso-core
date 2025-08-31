---
"@daiso-tech/core": minor
---

Updated `ILock` contract.

- Removed the method `getRemainingTime`.

- Removed the method `getOwner`.

- Removed the method `isExpired`.

- Removed the method `isLocked`.

- Added `getState` method that replaces the following methods `getRemainingTime`, `getOwner`, `isExpired` and `isLocked`.

- The `refreshOrFail` now only throws one error, it throws `FailedRefreshLockError`
