import { z } from "zod";
import { router } from "./http_router_initial_config.js";

const jsonSchema = z.object({
    name: z.string(),
    age: z.number(),
});

router.endpoint({
    url: "/users",
    method: ["POST"],
    handler: async ({ req, json }) => {
        const body = await req.json(jsonSchema);

        return json({ name: body.name, age: body.age });
    },
});
