---
"@daiso-tech/core": minor
---

# IAsyncCollection and AsyncIterableCollection
Changed IAsyncCollection contract to use PromiseLike instead of Promise.
Changed AsyncIterableCollection to use LazyPromise instead of Promise.
Removed all try catches catched unknown errors.
Renamed timeout to takeUntilTimeout, and abort to takeUntilAbort.