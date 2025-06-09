---
sidebar_position: 2
---

# Resilience middlewares

## Fallback

The [`fallback`](https://yousif-khalil-abdulkarim.github.io/daiso-core/functions/Async.fallback-1.html) middleware adds fallback value when an error occurs:

### Usage

```ts
import { fallback } from "@daiso-tech/core/async";
import { AsyncHooks } from "@daiso-tech/core/utilities";

function unstableFn(): number {
    // We simulate a function that can throw unexpected errors
    if (Math.round(Math.random() * 1.5) === 0) {
        throw new Error("Unexpected error occured");
    }
    return Math.round((Math.random() + 1) * 99);
}
const fn = new AsyncHooks(unstableFn, [
    fallback({
        fallbackValue: 1,
    }),
]);

// Will never throw and when error occurs the fallback value will be returned.
console.log(await fn.invoke());
```

:::info
You can provide [`LazyPromise`](/docs/8_Async/1_lazy_promise.md), synchronous and asynchronous [`Invokable`](../7_Utilities/3_invokable.md) as fallback value.
:::

### Custom ErrorPolicy

You can define an [`ErrorPolicy`](/docs/7_Utilities/5_result_and_error_policy.md) to specify fallback values for specific error cases:

```ts
const fn = new AsyncHooks(unstableFn, [
    fallback({
        fallbackValue: 1,
        // Will only fallback errors that are not a TypeError
        errorPolicy: (error) => !(error instanceof TypeError),
    }),
]);
```

### Callbacks

You can add callback [`Invokable`](../7_Utilities/3_invokable.md) that will be called before the fallback value is returned.

```ts
const fn = new AsyncHooks(unstableFn, [
    fallback({
        fallbackValue: 1,
        onFallback: (fallbackData) => console.log(fallbackData),
    }),
]);
```

:::info
For more details about `onFallback` callback data, see the [OnFallbackData](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Async.OnFallbackData.html) type.
:::

## Hedging

The hedging middlewares allow you to send request to multiple redundant services and use the first successful response. The library offers one strategy:

- [`sequentialHedging`](https://yousif-khalil-abdulkarim.github.io/daiso-core/functions/Async.sequentialHedging.html)

    The [`sequentialHedging`](https://yousif-khalil-abdulkarim.github.io/daiso-core/functions/Async.sequentialHedging.html) middleware executes the primary function followed by fallback [`Invokable:s`](../7_Utilities/3_invokable.md) in sequence. It:

    - Returns immediately with the first successful result.

    - Throws an error only if all [`Invokable:s`](../7_Utilities/3_invokable.md) fail.

### Usage

```ts
import { sequentialHedging } from "@daiso-tech/core/async";
import { AsyncHooks } from "@daiso-tech/core/utilities";

async function fetchData(url: string, signal?: AbortSignal): Promise<Response> {
    return await fetch(url, {
        signal,
    });
}
async function fetchDataFallback1(
    url: string,
    signal?: AbortSignal,
): Promise<Response> {
    return await fetch(`ENDPOINT_1/${url}`, {
        signal,
    });
}
async function fetchDataFallback2(
    url: string,
    signal?: AbortSignal,
): Promise<Response> {
    return await fetch(`ENDPOINT_2/${url}`, {
        signal,
    });
}
async function fetchDataFallback3(
    url: string,
    signal?: AbortSignal,
): Promise<Response> {
    return await fetch(`ENDPOINT_3/${url}`, {
        signal,
    });
}

const fetchDataEnhanced = new AsyncHooks(fetchData, [
    sequentialHedging({
        fallbacks: [fetchDataFallback1, fetchDataFallback2, fetchDataFallback3],
    }),
]);

const response = await fetchDataEnhanced.invoke("ENDPOINT");
console.log(await response.json());
```

:::warning
Note when abortion occurs, it will not abort the hedging middleware fallbacks executions. To ensure correct abortion behavior, provide an [`AbortSignalBinder`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Utilities.AbortSignalBinder.html) to [`AsyncHooks`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Utilities.AsyncHooks.html).

For further information about [`AbortSignalBinder`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Utilities.AbortSignalBinder.html) and [`AsyncHooks`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Utilities.AsyncHooks.html) refer to [Hooks](../7_Utilities/2_hooks.md) documentation.

```ts
const fetchDataEnhanced = new AsyncHooks(
    fetchData,
    [
        sequentialHedging({
            fallbacks: [
                fetchDataFallback1,
                fetchDataFallback2,
                fetchDataFallback3,
            ],
        }),
    ],
    {
        signalBinder: {
            getSignal: (args) => args[1],
            forwardSignal: (args, signal) => {
                args[1] = signal;
            },
        },
    },
);

const response = await fetchDataEnhanced.invoke("ENDPOINT");
console.log(await response.json());
```

:::

### Providing timeout and retry

You can abort the hedging calls after a specified time period:

```ts
import { TimeSpan } from "@daiso-tech/core/utilities";
import { retry, timeout } from "@daiso-tech/core/async";

const fetchDataEnhanced = new AsyncHooks(
    fetchData,
    [
        sequentialHedging({
            fallbacks: [
                fetchDataFallback1,
                fetchDataFallback2,
                fetchDataFallback3,
            ],
            // You can add middlewares that will apply to both the primary function and all fallback functions.
            middlewares: [
                timeout({
                    waitTime: TimeSpan.fromSeconds(2),
                }),
                retry({
                    maxAttempts: 4,
                }),
            ],
        }),
    ],
    {
        signalBinder: {
            getSignal: (args) => args[1],
            forwardSignal: (args, signal) => {
                args[1] = signal;
            },
        },
    },
);
```

### Named fallbacks

You can provide named fallbacks which is useful when debugging:

```ts
const fetchDataEnhanced = new AsyncHooks(
    fetchData,
    [
        sequentialHedging({
            fallbacks: [
                {
                    name: "fallback-a",
                    invokable: fetchDataFallback1,
                },
                {
                    name: "fallback-b",
                    invokable: fetchDataFallback2,
                },
                {
                    name: "fallback-c",
                    invokable: fetchDataFallback3,
                },
            ],
        }),
    ],
    {
        signalBinder: {
            getSignal: (args) => args[1],
            forwardSignal: (args, signal) => {
                args[1] = signal;
            },
        },
    },
);
```

### Callbacks

You can add callback [`Invokable`](../7_Utilities/3_invokable.md) that will be called before execution attempt:

```ts
const fetchDataEnhanced = new AsyncHooks(
    fetchData,
    [
        sequentialHedging({
            fallbacks: [
                fetchDataFallback1,
                fetchDataFallback2,
                fetchDataFallback3,
            ],
            onHedgeAttempt: (data) => console.log(data),
        }),
    ],
    {
        signalBinder: {
            getSignal: (args) => args[1],
            forwardSignal: (args, signal) => {
                args[1] = signal;
            },
        },
    },
);
```

:::info
For more details about `onHedgingAttempt` callback data, see the [OnHedgeAttemptData](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Async.OnHedgeAttemptData.html) type.
:::

You can add callback [`Invokable`](../7_Utilities/3_invokable.md) that will be called when a error occurs:

```ts
const fetchDataEnhanced = new AsyncHooks(
    fetchData,
    [
        sequentialHedging({
            fallbacks: [
                fetchDataFallback1,
                fetchDataFallback2,
                fetchDataFallback3,
            ],
            onHedgeError: (data) => console.log(data),
        }),
    ],
    {
        signalBinder: {
            getSignal: (args) => args[1],
            forwardSignal: (args, signal) => {
                args[1] = signal;
            },
        },
    },
);
```

:::info
For more details about `OnHedgeError` callback data, see the [OnHedgeErrorData](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Async.OnHedgeErrorData.html) type.
:::

## Retry

The [`retry`](https://yousif-khalil-abdulkarim.github.io/daiso-core/functions/Async.retry.html) middleware enables automatic retries for all errors or specific errors, with configurable backoff policies. An error will be thrown when all retry attempts fail.

### Usage

```ts
import { retry } from "@daiso-tech/core/async";
import { AsyncHooks } from "@daiso-tech/core/utilities";

function unstableFn(): number {
    // We simulate a function that can throw unexpected errors
    if (Math.round(Math.random() * 1.5) === 0) {
        throw new Error("Unexpected error occured");
    }
    return Math.round((Math.random() + 1) * 99);
}
const fn = new AsyncHooks(unstableFn, [
    retry({
        // Will retry 4 times
        maxAttemps: 4,
    }),
]);

await fn.invoke();
```

### Custom ErrorPolicy

You can define an [`ErrorPolicy`](/docs/7_Utilities/5_result_and_error_policy.md) to retry specific error cases:

```ts
const fn = new AsyncHooks(unstableFn, [
    retry({
        maxAttemps: 4,
        // Will only retry errors that are not TypeError
        errorPolicy: (error) => !(error instanceof TypeError),
    }),
]);
```

### Custom BackoffPolicy

You can use custom [`BackoffPolicy`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Async.BackoffPolicy.html):

```ts
import { TimeSpan } from "@daiso-tech/core/utilities";

const fn = new AsyncHooks(unstableFn, [
    retry({
        maxAttemps: 4,
        // By default a exponential policy is used
        backoffPolicy: (attempt: number, _error: unknown) =>
            TimeSpan.fromMilliseconds(attempt * 100),
    }),
]);
```

### Predefined backoff policies

There are predefined backoff policies that can be used:

- [`constantBackoffPolicy`](https://yousif-khalil-abdulkarim.github.io/daiso-core/functions/Async.constantBackoffPolicy.html)

- [`exponentialBackoffPolicy`](https://yousif-khalil-abdulkarim.github.io/daiso-core/functions/Async.exponentialBackoffPolicy.html)

- [`linearBackoffPolicy`](https://yousif-khalil-abdulkarim.github.io/daiso-core/functions/Async.linearBackoffPolicy.html)

- [`polynomialBackoffPolicy`](https://yousif-khalil-abdulkarim.github.io/daiso-core/functions/Async.polynomialBackoffPolicy.html)

Usage example:

```ts
import { polynomialBackoffPolicy } from "@daiso-tech/core/async";

const fn = new AsyncHooks(unstableFn, [
    retry({
        maxAttemps: 4,
        // By default a exponential policy is used
        backoffPolicy: polynomialBackoffPolicy(),
    }),
]);
```

Dynamically adjusting the settings based on the error:

```ts
import { polynomialBackoffPolicy } from "@daiso-tech/core/async";
import { TimeSpan } from "@daiso-tech/core/utilities";

const fn = new AsyncHooks(unstableFn, [
    retry({
        maxAttemps: 4,
        // You can dynamicalyy adapt the setting depending on the error
        backoffPolicy: polynomialBackoffPolicy((error) => {
            if (isImportant(error)) {
                return {
                    maxDelay: TimeSpan.fromSeconds(30),
                    degree: 3,
                };
            }
            // If you dont return settings object then default settings will be used.
        }),
    }),
]);
```

:::info
All predefined backoff policies can be dynamically adjusted based on the error.
:::

### Callbacks

You can add callback [`Invokable`](../7_Utilities/3_invokable.md) that will be called before execution attempt:

```ts
const fn = new AsyncHooks(unstableFn, [
    retry({
        maxAttemps: 4,
        onExecutionAttempt: (data) => console.log(data),
    }),
]);
```

You can add callback [`Invokable`](../7_Utilities/3_invokable.md) that will be called before the retry delay starts:

:::info
For more details about `onExecutionAttempt` callback data, see the [OnRetryAttemptData](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Async.OnRetryAttemptData.html) type.
:::

```ts
const fn = new AsyncHooks(unstableFn, [
    retry({
        maxAttemps: 4,
        onRetryDelay: (data) => console.log(data),
    }),
]);
```

:::info
For more details about `onRetryDelay` callback data, see the [OnRetryDelayData](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Async.OnRetryDelayData.html) type.
:::

## Timeout

The [`timeout`](https://yousif-khalil-abdulkarim.github.io/daiso-core/functions/Async.timeout.html) middleware automatically aborts functions after a specified time period, throwing an error when aborted.

### Usage

```ts
import { timeout } from "@daiso-tech/core/async";
import { AsyncHooks, TimeSpan } from "@daiso-tech/core/utilities";

function fetchData(): Promise<Response> {
    const response = await fetch("ENDPOINT");
    console.log("DONE");
    return response;
}
const fn = new AsyncHooks(fetchData, [
    timeout({
        waitTime: TimeSpan.fromSeconds(2),
    }),
]);

await fn.invoke();
```

:::warning
Note when a timeout occurs, the function call continues executing in the background and only the `Promise` will be aborted.
To ensure correct abortion behavior, provide an [`AbortSignalBinder`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Utilities.AbortSignalBinder.html) to [`AsyncHooks`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Utilities.AsyncHooks.html).

For further information about [`AbortSignalBinder`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Utilities.AbortSignalBinder.html) and [`AsyncHooks`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Utilities.AsyncHooks.html) refer to [Hooks](../7_Utilities/2_hooks.md) documentation.

```ts
import { timeout } from "@daiso-tech/core/async";
import { AsyncHooks, TimeSpan } from "@daiso-tech/core/utilities";

function fetchData(signal?: AbortSginal): Promise<Response> {
    const response = await fetch("ENDPOINT", {
        signal,
    });
    console.log("DONE");
    return response;
}
const fn = new AsyncHooks(
    fetchData,
    [
        timeout({
            waitTime: TimeSpan.fromSeconds(2),
        }),
    ],
    {
        signalBinder: {
            getSignal: (args) => args[0],
            forwardSignal: (args, signal) => {
                args[0] = signal;
            },
        },
    },
);

await fn.invoke();
```

:::

### Callbacks

You can add callback [`Invokable`](../7_Utilities/3_invokable.md) that will be called before the timeout occurs.

```ts
const fn = new AsyncHooks(
    fetchData,
    [
        timeout({
            waitTime: TimeSpan.fromSeconds(2),
            onTimeout: (data) => console.log(data),
        }),
    ],
    {
        signalBinder: {
            getSignal: (args) => args[0],
            forwardSignal: (args, signal) => {
                args[0] = signal;
            },
        },
    },
);
```

:::info
For more details about `onTimeout` callback data, see the [OnTimeoutData](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Async.OnTimeoutData.html) type.
:::

## Observe

The [`observe`](https://yousif-khalil-abdulkarim.github.io/daiso-core/functions/Async.observe.html) middleware tracks an async function's state and runs callbacks when it fails with an error or succeeds:

### Usage

```ts
import { observe } from "@daiso-tech/core/async";
import { AsyncHooks } from "@daiso-tech/core/utilities";

function unstableFn(): Promise<number> {
    // We simulate a function that can throw unexpected errors
    if (Math.round(Math.random() * 1.5) === 0) {
        throw new Error("Unexpected error occured");
    }
    return Math.round((Math.random() + 1) * 99);
}
const fn = new AsyncHooks(unstableFn, [
    observe({
        onStart: (data) => console.log("START:", data),
        onSuccess: (data) => console.log("SUCCESS:", data),
        onError: (data) => console.error("ERROR:", data),
        onFinally: (data) => console.log("END:", data),
    }),
]);

await fn.invoke();
```

:::info

- For more details about `onStart` callback data, see the [OnObserveStartData](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Async.OnObserveStartData.html) type.

- For more details about `onSuccess` callback data, see the [OnObserveSuccessData](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Async.OnObserveSuccessData.html) type.

- For more details about `onError` callback data, see the [OnObserveErrorData](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Async.OnObserveErrorData.html) type.

- For more details about `onFinally` callback data, see the [OnObserveFinallyData](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Async.OnObserveFinallyData.html) type.

:::
