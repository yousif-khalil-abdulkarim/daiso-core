---
"@daiso-tech/core": minor
---

Removed individual configuration methods `setAbortSignal`, `setTotalTimeout`, `setRetryTimeout`, `setRetryPolicy`, `setRetryAttempts` and `setBackofPolicy` from `LazyPromise`.
The new approach allows you to apply `AsyncMiddleware` to `LazyPromise` by the `pipe` and `pipeWhen` methods.
This change promotes a more composable and extendable design while reducing API surface area.