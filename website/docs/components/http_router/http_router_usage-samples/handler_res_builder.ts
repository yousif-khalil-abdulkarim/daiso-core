import { router } from "./http_router_initial_config.js";

router.endpoint({
    url: "/response",
    method: ["GET"],
    handler: async ({ res }) => {
        return res
            .setStatus(201)
            .setHeader("X-Custom", "value")
            .setBody("Created");
    },
});
