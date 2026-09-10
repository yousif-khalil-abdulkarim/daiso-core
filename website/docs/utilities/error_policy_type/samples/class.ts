import { fallback } from "eridu-tech/resilience";
import { use } from "eridu-tech/middleware";
import { UnexpectedError } from "eridu-tech/utilities";

const func = use(
    () => Promise.resolve("DATA"),
    [
        fallback({
            fallbackValue: "DEFAULT_VALUE",
            errorPolicy: UnexpectedError,
        }),
    ],
);

await func();
