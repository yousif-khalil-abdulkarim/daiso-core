---
"@daiso-tech/core": minor
---

The method for listening to events dispatched by various components, such as the cache, has changed.

Before update:

```ts
import { ICache, CACHE_EVENTS.FOUND } from "@daiso-tech/core/cache/contracts";

declare const cache: ICache

await cache.addListener(CACHE_EVENTS.FOUND, event => {
    console.log(event);
})
```

After update:

```ts
import { ICache, CACHE_EVENTS.FOUND } from "@daiso-tech/core/cache/contracts";

declare const cache: ICache

await cache.events.addListener(CACHE_EVENTS.FOUND, event => {
    console.log(event);
})
```