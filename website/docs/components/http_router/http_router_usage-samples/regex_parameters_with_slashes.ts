import { router } from "./http_router_initial_config.js";

router.endpoint({
    url: "/posts/:filename{.+\\.png}",
    method: ["GET"],
    handler: async ({ req, json }) => {
        const { filename } = req.params();
        return json({ filename });
    },
});
