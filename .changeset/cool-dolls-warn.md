---
"@daiso-tech/core": minor
---

The `observe` middleware works now with `Result` type. This means the middleware will call the `onError` callback when the function returns a failed `Result`.
