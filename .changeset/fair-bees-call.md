---
"@daiso-tech/core": minor
---

Updated the `AsyncHook` class to accept an `AbortSignalBinder` parameter. This enables binding an `AbortSignal` to the middleware for two-way abortion control.
The `AsyncHook` know exposes function name to the middleware function which is useful for logging.