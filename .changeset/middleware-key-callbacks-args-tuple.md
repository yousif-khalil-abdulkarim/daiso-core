---
"eridu-tech": minor
---

Middleware settings callbacks that derive a key from the wrapped function's arguments now receive those arguments as a single tuple instead of as spread positional arguments.

This affects the `key` setting of `withCacheFactory`, `withInvalidationFactory`, `withCircuitBreakerFactory`, `withLockFactory`, `withRateLimiterFactory`, `withSemaphoreFactory`, and `withSharedLockFactory`, as well as the `lockId` setting of `withLockFactory` / `withSharedLockFactory` and the `slotId` setting of `withSemaphoreFactory`.

These settings are now typed as `Invocable<[args: TParameters], string>` and are invoked with the argument tuple (`callInvocable(key, args)`) instead of with the arguments spread.

This change was made so that type inference works correctly: because the callbacks previously received the parameters spread out, TypeScript could not infer the wrapped function's parameter tuple from the callback (it fell back to the `unknown[]` default, causing the middleware to lose the exact parameter types and produce type errors). Passing the arguments as a single tuple lets TypeScript infer the exact tuple type of the wrapped function's parameters.

### Migration

Destructure the arguments tuple in the callback instead of declaring one parameter per argument:

```ts
// Before
withCache({
    key: (userId: string) => `user:${userId}`,
});

withLock({
    key: (userId: string, postId: string) => `user:${userId}:post:${postId}`,
});

// After
withCache({
    key: ([userId]) => `user:${userId}`,
});

withLock({
    key: ([userId, postId]) => `user:${userId}:post:${postId}`,
});
```
