---
"@daiso-tech/core": minor
---

The constructor arguments for `Hooks` and `AsyncHooks` have been updated to use a more consistent settings pattern.

Before:

```ts
import { Hooks, AsyncHooks } from "@dais-tech/core/utilities";

// Synchronous hooks
new Hooks(
    fn,
    [middleware1(), middleware2()], // Middlewares as second argument
    {
        // Optional settings (third argument)
    },
);

// Asynchronous hooks
new AsyncHooks(
    fn,
    [asyncMiddleware1(), asyncMiddleware2()], // Middlewares as second argument
    {
        // Optional settings (third argument)
    },
);
```

After:

```ts
import { Hooks, AsyncHooks } from "@dais-tech/core/utilities";

// Synchronous hooks
new Hooks(fn, {
    middlewares: [middleware1(), middleware2()], // Middlewares moved into settings and are optional
    // Other optional settings
});

// Asynchronous hooks
new AsyncHooks(fn, {
    middlewares: [asyncMiddleware1(), asyncMiddleware2()], // Middlewares moved into settings and are optional
    // Other optional settings
});
```

Migration Guide

1. Move your middleware array into the options object under the middlewares property

2. Combine any additional settings with the middlewares in a single options object

3. Remove the third argument if you were using it