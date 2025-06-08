---
sidebar_position: 5
---

# Result and ErrorPolicy types

## Result type

The [`Result`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Utilities.Result.html) type is a powerful utility that elegantly handles operations that may either succeed or fail. This pattern is particularly useful for error handling in a type-safe manner, avoiding the pitfalls of traditional exception-based approaches.

To create a failed result, use the `resultFailure` function:

```ts
import { Result, resultFailure } from "@daio-tech/core/utilities";

const failedResult: Result<string, Error> = resultFailure(new Error("Error occured"));
```

For successful outcomes, the `resultSuccess` function provides a clean way to wrap your successful value:

```ts
import { Result, resultSuccess } from "@daio-tech/core/utilities";

const failedResult: Result<string, Error> = resultSuccess("Was successful");
```

You can easily check the outcome of a [`Result`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Utilities.Result.html) using the `type` field, which clearly indicates whether the operation succeeded or failed:

```ts
import { Result, resultFailure, resultSuccess, RESULT } from "@daiso-tech/core/utilities";

function random(): Result<string, Error> {
    if (Math.round(Math.random()) === 0) {
        // The resultFailure function return a failed result
        return resultFailure(new Error("Unexpected error occured"));
    }
    // The resultSuccess function return a success result
    return resultSuccess("Function succeded");
}

const result = random();

if (result.type === RESULT.FAILURE) {
    console.log("Failed:");
}
if (result.type === RESULT.SUCCESS) {
    console.log("Succeded");
}
```

The [`Result`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Utilities.Result.html) type promotes explicit error handling, making your code more robust and maintainable by forcing developers to consciously handle both success and failure cases. The `RESULT` enum (`SUCCESS` and `FAILURE`) provides a clear, readable way to distinguish between outcomes.

## ErrorPolicy types

The `ErrorPolicy` type determines which errors should be handled for example in resilience middlewares like [`retry`](/docs/8_Async/2_resilience_middlewares.md) or [`fallback`](/docs/8_Async/2_resilience_middlewares.md).

:::info

The `ErrorPolicy` will also apply when a function returns a failed [`Result`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Utilities.Result.html).
:::

### Predicate as ErrorPolicy

A predicate function can be used to dynamically determine if an error should be handled:

```ts
import { fallback } from "@daiso-tech/core/async";
import { AsyncHooks } from "@daiso-tech/core/utilities";

class CustomError extends Error {
    constructor(readonly errorCode: string, message: string, cause?: unknown) {
        super(message, { cause });
        this.name = CustomError.name;
    }
}
const func = new AsyncHooks((): string => {
    return "asd"
}, [
    fallback({
        fallbackValue: "DEFAULT_VALUE",
        errorPolicy: error => error instanceof CustomError,
    })
])
.toFunc();
```

### Classes as ErrorPolicy:

You can directly pass an class to match if errors are instance of the class:

```ts
const func = new AsyncHooks((): string => {
    return "asd"
}, [
    fallback({
        fallbackValue: "DEFAULT_VALUE",
        errorPolicy: CustomError,
    })
])
.toFunc();
```

### Standard Schema as ErrorPolicy

You can use any [standard schema](https://standardschema.dev/) compliant object as error policy:

```ts
import { z } from "zod"

const func = new AsyncHooks((): string => {
    return "asd"
}, [
    fallback({
        fallbackValue: "DEFAULT_VALUE",
        errorPolicy: z.object({
            code: z.liter("e20"),
            message: z.string(),
        }),
    })
])
.toFunc();
```
    
### False return values as error

You can treat false return values as errors. This useful when you want to retry functions that return boolean.

```ts
import { AsyncHooks } from "@daiso-tech/core/utillities";
import { retry } from "@daiso-tech/async";

await new AsyncHooks((): Promise<boolean> => {
    // Will be 
    console.log("EXECUTING");
    return false;
}, [
    retry({
        maxAttempts: 4,
        errorPolicy: {
            treatFalseAsError: true
        }
    })
])
.invoke();
```

