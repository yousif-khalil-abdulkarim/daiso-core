---
sidebar_position: 5
---

# Lock API

[`Lock module`](https://yousif-khalil-abdulkarim.github.io/daiso-core/modules/Lock.html)

## Lock contracts

-   [`ILockProvider`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Lock.ILockProvider.html)

-   [`ILock`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Lock.ILock.html)

-   [`ILockProvider`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Lock.ILockProvider.html)

-   [`ILockListenable`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Lock.ILockListenable.html)

-   [`ILockAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Lock.ILockAdapter.html)

-   [`IDatabaseLockAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Lock.IDatabaseLockAdapter.html)

-   [`ILockProviderFactory`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Lock.ILockProviderFactory.html)

## Lock derivables

-   [`Lock`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Lock.Lock.html)

-   [`LockProvider`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Lock.LockProvider.html)

-   [`LockProviderFactory`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Lock.LockProviderFactory.html)

## Lock adapters

-   [`MemoryLockAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Lock.MemoryLockAdapter.html)

-   [`MongodbLockAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Lock.MongodbLockAdapter.html)

-   [`RedisLockAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Lock.RedisLockAdapter.html)

-   [`SqliteLockAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Lock.SqliteLockAdapter.html)

-   [`LibsqlLockAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Lock.LibsqlLockAdapter.html)

-   [`NoOpLockAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Lock.NoOpLockAdapter.html)

## Lock errors

-   [`LockError`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Lock.LockError.html)

-   [`KeyAlreadyAcquiredLockError`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Lock.KeyAlreadyAcquiredLockError.html)

-   [`UnexpectedLockError`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Lock.UnexpectedLockError.html)

-   [`UnownedRefreshLockError`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Lock.UnownedRefreshLockError.html)

-   [`UnownedReleaseLockError`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Lock.UnownedReleaseLockError.html)

-   [`LOCK_ERRORS`](https://yousif-khalil-abdulkarim.github.io/daiso-core/variables/Lock.LOCK_ERRORS.html)

-   [`registerLockErrorsToSerde`](https://yousif-khalil-abdulkarim.github.io/daiso-core/functions/Lock.registerLockErrorsToSerde.html)

## Lock events

-   [`AcquiredLockEvent`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Lock.AcquiredLockEvent.html)

-   [`ForceReleasedLockEvent`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Lock.ForceReleasedLockEvent.html)

-   [`NotAvailableLockEvent`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Lock.NotAvailableLockEvent.html)

-   [`RefreshedLockEvent`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Lock.RefreshedLockEvent.html)

-   [`ReleasedLockEvent`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Lock.ReleasedLockEvent.html)

-   [`UnexpectedErrorLockEvent`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Lock.UnexpectedErrorLockEvent.html)

-   [`UnownedRefreshTryLockEvent`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Lock.UnownedRefreshTryLockEvent.html)

-   [`UnownedReleaseTryLockEvent`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Lock.UnownedReleaseTryLockEvent.html)

-   [`LockEventMap`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Lock.LockEventMap.html)

-   [`LOCK_EVENTS`](https://yousif-khalil-abdulkarim.github.io/daiso-core/variables/Lock.LOCK_EVENTS.html)

## Lock test utilities

-   [`lockAdapterTestSuite`](https://yousif-khalil-abdulkarim.github.io/daiso-core/functions/Lock.lockAdapterTestSuite.html)

-   [`databaseLockAdapterTestSuite`](https://yousif-khalil-abdulkarim.github.io/daiso-core/functions/Lock.databaseLockAdapterTestSuite.html)

-   [`lockProviderTestSuite`](https://yousif-khalil-abdulkarim.github.io/daiso-core/functions/Lock.lockProviderTestSuite.html)
