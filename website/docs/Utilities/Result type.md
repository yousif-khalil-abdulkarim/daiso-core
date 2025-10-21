# Result type

The `Result` type is a powerful utility that elegantly handles operations that may either succeed or fail. This pattern is particularly useful for error handling in a type-safe manner, avoiding the pitfalls of traditional exception-based approaches.

To create a failed result, use the `resultFailure` function:

```ts
import { Result, resultFailure } from "@daio-tech/core/utilities";

const failedResult: Result<string, Error> = resultFailure(
    new Error("Error occured"),
);
```

For successful outcomes, the `resultSuccess` function provides a clean way to wrap your successful value:

```ts
import { Result, resultSuccess } from "@daio-tech/core/utilities";

const failedResult: Result<string, Error> = resultSuccess("Was successful");
```

You can easily check the outcome of a `Result` using the `type` field, which clearly indicates whether the operation succeeded or failed:

```ts
import {
    Result,
    resultFailure,
    resultSuccess,
    RESULT,
} from "@daiso-tech/core/utilities";

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

The `Result` type promotes explicit error handling, making your code more robust and maintainable by forcing developers to consciously handle both success and failure cases. The `RESULT` enum (`SUCCESS` and `FAILURE`) provides a clear, readable way to distinguish between outcomes.

## Further information

For further information refer to [`@daiso-tech/core/utilities`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Utilities.Result.html) API docs.
