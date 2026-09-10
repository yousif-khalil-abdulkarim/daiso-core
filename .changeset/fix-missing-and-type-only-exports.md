---
"eridu-tech": patch
---

Fixed missing and type-only exports so the following runtime helpers are now available from the package's public API:

- `defineEventMapSchema` — from `eridu-tech/event-bus`
- `defineMiddleware` — from `eridu-tech/middleware/contracts`
- `defineHttpMiddleware` and `defineWinterTcMiddleware` — from `eridu-tech/http-router/contracts`
- `withCacheFactory` and `withInvalidationFactory` — from `eridu-tech/cache/middlewares`
- `withFileStorageInferContentTypeOnRead`, `withFileStorageInferContentTypeOnWrite`, `withFileStorageInferFileTypeOnRead`, and `withFileStorageInferFileTypeOnWrite` — from `eridu-tech/file-storage/plugins`

These were previously either not exported at all or exported only as types, which prevented them from being imported and used at runtime.
