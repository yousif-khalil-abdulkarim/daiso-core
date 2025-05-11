---
sidebar_position: 1
---

# LazyPromise

The [`LazyPromise`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Async.LazyPromise.html) is `PromiseLike` object that behaves similarly to regular `Promise` but executes only when awaited or when manually defered.

## Basic usage

### Creating and executing

```ts
import { LazyPromise } from "@daiso-tech/core/async";

const promise = new LazyPromise(async () => {
    // This will log when awaited
    console.log("2.");
    return await fetch("URL");
});

console.log("1.");
await promise;
console.log("3.");
```

You can execute a [`LazyPromise`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Async.LazyPromise.html) without awaiting it:

```ts
import { LazyPromise } from "@daiso-tech/core/async";
import { TimeSpan } from "@daiso-tech/core/utilities";

const promise = new LazyPromise(async () => {
    LazyPromise.delay(TimeSpan.fromSeconds(1));
    console.log("3.");
    return await fetch("URL");
});

console.log("1.");
promise.defer();
console.log("2.");
```

### Adding middlewares

You can add [`middlewares`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Utilities.Middleware.html) to a [`LazyPromise`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Async.LazyPromise.html). Refer to the [Hooks](../7_Utilities/2_hooks.md) documentation for further information.

Through the constructor:

```ts
import { LazyPromise } from "@daiso-tech/core/async";

const promise = new LazyPromise(async () => {
    return await fetch("URL");
}, [
    (args, next) => {
        console.log("Middleware 1");
        return next(...args);
    },
]);

await promise;
```

Through the `pipe` method:

```ts
import { LazyPromise } from "@daiso-tech/core/async";

const promise = new LazyPromise(async () => {
    return await fetch("URL");
}).pipe((args, next) => {
    console.log("Middleware 1");
    return next(...args);
});

await promise;
```

Through the `pipeWhen` method:

```ts
import { LazyPromise } from "@daiso-tech/core/async";

const promise = new LazyPromise(async () => {
    return await fetch("URL");
}).pipeWhen(true, (args, next) => {
    console.log("Middleware 1");
    return next(...args);
});

await promise;
```

### Static methods

[`LazyPromise`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Async.LazyPromise.html) provides static helper methods (`all`, `allSettled`, `race`, and `any`) that mirror their `Promise` counterparts, but with lazy execution behavior. Like individual [`LazyPromise`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Async.LazyPromise.html) instances, these methods only evaluate when awaited or when their `defer` method is explicitly called.

The are additional static method, `delay` and `fromCallback`.

-   The `delay` method creates a [`LazyPromise`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Async.LazyPromise.html) that resolves after a given time:

```ts
import { LazyPromise } from "@daiso-tech/core/async";
import { TimeSpan } from "@daiso-tech/core/utilities";

// Will wait 1 second
await LazyPromise.delay(TimeSpan.fromSeconds(1));
console.log("DONE");
```

You can provide an `AbortSignal` to aborat the delay:

```ts
import { LazyPromise } from "@daiso-tech/core/async";
import { TimeSpan } from "@daiso-tech/core/utilities";

const abortController = new AbortController();
abortController.abort("No need to wait");

// Will not wait for the delay
await LazyPromise.delay(TimeSpan.fromSeconds(1, abortController.signal));
console.log("DONE");
```

-   The `fromCallback` is convience method used for wrapping Node js callback functions with a `LazyPromise`.

```ts
import { LazyPromise } from "@daiso-tech/core/async";
import { readFile } from "node:fs";

const lazyPromise = LazyPromise.fromCallback<Buffer | string>((resolve, reject) => {
    readFile("FILE_PATH", (err, data) => {
        if (err !== null) {
            reject(err);
            return;
        }
        resolve(data);
    });
});
const file = await lazyPromise;
console.log(file);
```
