---
"@daiso-tech/core": minor
---

Removed the following `LockProvider` errors:

- `UnableToReleaseLockError`
- `UnableToAquireLockError`

`LockProvider` errors obscures unexpected errors originating from the underlying client, making it harder to identify the root cause.

