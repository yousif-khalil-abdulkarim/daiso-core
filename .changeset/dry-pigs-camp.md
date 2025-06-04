---
"@daiso-tech/core": minor
---

---

## "@daiso-tech/core": minor

`LibsqlLockAdapter` and `SqliteLockAdapter` have been removed. Use `KyselyLockAdapter` instead. It supports `postgres`, `mysql`, and `sqlite` (including derived databases) via `kysely`.
