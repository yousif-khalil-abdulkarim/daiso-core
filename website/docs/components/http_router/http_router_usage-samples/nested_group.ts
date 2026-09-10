import { router } from "./http_router_initial_config.js";

router.group((sub) => {
    sub.endpoint({
        url: "/nested",
        method: ["GET"],
        handler: async ({ text }) => text("Nested route"),
    });
});
