---
"@daiso-tech/core": minor
---

# Storage
* Simplified StorageAdapter contract
* Changed the StorageAdapter and Storage contract to use PromiseLike instead of Promise.
* Changed the Storage class to use LazyPromise instead of Promise.
* Removed unnecessary try catches from Storage class so unknown error can propagate up
