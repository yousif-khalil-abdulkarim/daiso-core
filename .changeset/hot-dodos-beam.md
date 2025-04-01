---
"@daiso-tech/core": minor
---
Following methods where removed from `LazyPromise`:
  - `setAbortSignal`
  - `setTotalTimeout`
  - `setRetryTimeout`
  - `setRetryPolicy`
  - `setRetryAttempts`
  - `setBackofPolicy`

The new approach allows you to apply `AsyncMiddleware` to `LazyPromise` by the `pipe` and `pipeWhen` methods. This change promotes a more composable and extendable design while reducing API surface area.