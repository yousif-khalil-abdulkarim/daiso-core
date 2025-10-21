# ErrorPolicy type

The `ErrorPolicy` type determines which errors should be handled for example in resilience middlewares like [`retry`](../Components/Resilience.md) 6or [`fallback`](../Components/Resilience.md).

:::info

The `ErrorPolicy` will also apply when a function returns a failed [`Result`](./Result%20type.md).
:::

## Predicate as ErrorPolicy

A predicate function can be used to dynamically determine if an error should be handled:

```ts
import { fallback } from "@daiso-tech/core/async";
import { AsyncHooks } from "@daiso-tech/core/utilities";

class CustomError extends Error {
    constructor(
        readonly errorCode: string,
        message: string,
        cause?: unknown,
    ) {
        super(message, { cause });
        this.name = CustomError.name;
    }
}
const func = new AsyncHooks((): string => {
    return "asd";
}, [
    fallback({
        fallbackValue: "DEFAULT_VALUE",
        errorPolicy: (error) => error instanceof CustomError,
    }),
]).toFunc();
```

## Classes as ErrorPolicy:

You can directly pass an class to match if errors are instance of the class:

```ts
const func = new AsyncHooks((): string => {
    return "asd";
}, [
    fallback({
        fallbackValue: "DEFAULT_VALUE",
        errorPolicy: CustomError,
    }),
]).toFunc();
```

## Standard Schema as ErrorPolicy

You can use any [standard schema](https://standardschema.dev/) as error policy:

```ts
import { z } from "zod";

const func = new AsyncHooks((): string => {
    return "asd";
}, [
    fallback({
        fallbackValue: "DEFAULT_VALUE",
        errorPolicy: z.object({
            code: z.liter("e20"),
            message: z.string(),
        }),
    }),
]).toFunc();
```

## False return values as error

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
            treatFalseAsError: true,
        },
    }),
]).invoke();
```

## Further information

For further information refer to [`@daiso-tech/core/utilities`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Utilities.ErrorPolicy.html) API docs.
