---
"@daiso-tech/core": minor
---

Renamed, updated and removed some lock events.

- Renamed event `UnownedReleaseTryLockEvent` to `FailedReleaseLockEvent`.

- Renamed event `UnownedRefreshTryLockEvent` to `FailedRefreshLockEvent`.

- Removed event `UnexpireableKeyRefreshTryLockEvent`.

- Renamed `owner` field to `lockId`.

- Now in all events you can access the lock state.
