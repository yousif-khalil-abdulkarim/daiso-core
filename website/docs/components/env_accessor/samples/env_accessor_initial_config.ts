import { EnvAccessor } from "eridu-tech/env-accessor";
import { z } from "zod";

// Combine multiple sources as env variables
// Note: The order matters—later sources override previous ones for overlapping keys.
const sources = [
    process.env,
    async () => {
        // Load secrets from a remote store (e.g. AWS Secrets Manager) and return
        // them as a plain object, mirroring what a secret-store SDK call would do.
        return {
            PORT: "3000",
        };
    },
];

// Define a schema for your environment variables
const schema = z.object({
    NODE_ENV: z.string().optional(),
    PORT: z.string().default("3000").pipe(z.coerce.number()),
});

// Initialize the accessor
export const accessor = new EnvAccessor({ schema, sources });
await accessor.init();
