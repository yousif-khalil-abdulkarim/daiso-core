import { z } from "zod";
import { fallback } from "eridu-tech/resilience";
import { use } from "eridu-tech/middleware";

const func = use(
    () => Promise.resolve("DATA"),
    [
        fallback({
            fallbackValue: "DEFAULT_VALUE",
            errorPolicy: z.object({
                code: z.literal("e20"),
                message: z.string(),
            }),
        }),
    ],
);

await func();
