import { router } from "./http_router_initial_config.js";

router.endpoint({
    url: "/users/:id",
    method: ["GET"],
    handler: async ({ req, json }) => {
        const params = req.params();
        return json({ userId: params.id });
    },
});
