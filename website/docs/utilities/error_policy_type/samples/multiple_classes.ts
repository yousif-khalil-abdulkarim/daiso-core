import { fallback } from "eridu-tech/resilience";
import { use } from "eridu-tech/middleware";
import { UnexpectedError } from "eridu-tech/utilities";

class CustomErrorB extends Error {
    constructor(message: string, cause?: unknown) {
        super(message, { cause });
        this.name = CustomErrorB.name;
    }
}

const func = use(
    () => Promise.resolve("DATA"),
    [
        fallback({
            fallbackValue: "DEFAULT_VALUE",
            errorPolicy: [UnexpectedError, CustomErrorB],
        }),
    ],
);

await func();
