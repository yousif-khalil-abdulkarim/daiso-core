---
"@daiso-tech/core": minor
---

Added new methods to `ICache` contract:

- `addOrFail` same as the `add` method but throws an error if key already exists

- `updateOrFail` same as `update` method but throws an error if key is not found

- `incrementOrFail` same as `increment` method but throws an error if key is not found

- `decrementOrFail` same as `decrement` method but throws an error if key is not found

- `removeOrFail` same as `remove` method but throws an error if key is not found

Seperated `WrittenCacheEvent` to multiple events:

- `AddedCacheEvent`

- `UpdatedCacheEvent`

- `RemovedCacheEvent`

- `IncrementedCacheEvent`

- `DecrementedCacheEvent`

Removed `TypeCollectionError` of the Collection component.
