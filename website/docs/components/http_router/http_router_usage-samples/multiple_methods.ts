import { router } from "./http_router_initial_config.js";

router.endpoint({
    url: "/post",
    method: ["PUT", "DELETE"],
    handler: async ({ req, text }) => {
        return text(`${req.method} /post`);
    },
});
