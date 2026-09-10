import { router } from "./http_router_initial_config.js";

router.endpoint({
    url: "/post/:date{[0-9]+}/:title{[a-z]+}",
    method: ["GET"],
    handler: async ({ req, json }) => {
        const { date, title } = req.params();
        return json({ date, title });
    },
});
