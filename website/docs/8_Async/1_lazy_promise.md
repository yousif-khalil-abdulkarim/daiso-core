---
sidebar_position: 1
---

# LazyPromise

The [`LazyPromise`](/docs/8_Async/1_lazy_promise.md) is `PromiseLike` object that behaves similarly to regular `Promise` but executes only when awaited or when manually defered.

## Usage

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

You can execute a [`LazyPromise`](/docs/8_Async/1_lazy_promise.md) without awaiting it:

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

You can add [`middlewares`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Utilities.Middleware.html) to a [`LazyPromise`](/docs/8_Async/1_lazy_promise.md). Refer to the [Hooks](../7_Utilities/2_hooks.md) documentation for further information.

Through the constructor:

```ts
import { LazyPromise } from "@daiso-tech/core/async";

const promise = new LazyPromise(
    async () => {
        return await fetch("URL");
    },
    {
        middlewares: [
            (args, next) => {
                console.log("Middleware 1");
                return next(...args);
            },
        ],
    },
);

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

### Aborting LazyPromise

You can abort a [`LazyPromise`](/docs/8_Async/1_lazy_promise.md) by using [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal):

```ts
import { LazyPromise } from "@daiso-tech/core/async";

const abortController = new AbortController();
const promise = new LazyPromise(
    async (signal) => {
        return await fetch("URL", {
            signal,
        });
    },
    {
        signal: abortController.signal,
    },
);
abortController.abort(new Error("Aborted early"));

// Will throw the error passed to the abortController.abort method.
await promise;
```

You can abort a [`LazyPromise`](/docs/8_Async/1_lazy_promise.md) from inside a middleware:

```ts
import { LazyPromise } from "@daiso-tech/core/async";

const abortController = new AbortController();
const promise = new LazyPromise(
    async (signal) => {
        return await fetch("URL", {
            signal,
        });
    },
    {
        middlewares: async (args, next, { abort }) => {
            abort(new Error("Aborted early"));
            return await next(...args);
        },
    },
);

// Will throw the error passed to the abort function.
await promise;
```

You can use the [`timeout`](/docs/Async/resilience_middlewares#timeout) middleware to abort after certain time:

```ts
import { LazyPromise, timeout } from "@daiso-tech/core/async";
import { TimeSpan } from "@daiso-tech/core/utilities";

const abortController = new AbortController();
const promise = new LazyPromise(
    async (signal) => {
        return await fetch("URL", {
            signal,
        });
    },
    {
        middlewares: timeout(TimeSpan.fromSeconds(2)),
    },
);

// Will throw the error passed to the abort function.
await promise;
```

### Static methods

[`LazyPromise`](/docs/8_Async/1_lazy_promise.md) provides static helper methods (`all`, `allSettled`, `race`, and `any`) that mirror their `Promise` counterparts, but with lazy execution behavior. Like individual [`LazyPromise`](/docs/8_Async/1_lazy_promise.md) instances, these methods only evaluate when awaited or when their `defer` method is explicitly called.

The are additional static method, `delay` and `fromCallback`.

- The `delay` method creates a [`LazyPromise`](/docs/8_Async/1_lazy_promise.md) that resolves after a given time:

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

- The `fromCallback` is convience method used for wrapping Node js callback functions with a `LazyPromise`.

    ```ts
    import { LazyPromise } from "@daiso-tech/core/async";
    import { readFile } from "node:fs";

    const lazyPromise = LazyPromise.fromCallback<Buffer | string>(
        (resolve, reject) => {
            readFile("FILE_PATH", (err, data) => {
                if (err !== null) {
                    reject(err);
                    return;
                }
                resolve(data);
            });
        },
    );
    const file = await lazyPromise;
    console.log(file);
    ```
