import { MemoryCacheAdapter } from "eridu-tech/cache/memory-cache-adapter";
import { Cache } from "eridu-tech/cache";
import { z } from "zod";

const userSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    age: z.number(),
});

const cache = new Cache({
    adapter: new MemoryCacheAdapter(),
    schema: userSchema,
    shouldValidateOutput: false,
});
