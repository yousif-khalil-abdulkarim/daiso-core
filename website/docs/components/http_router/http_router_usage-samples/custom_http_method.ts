import { router } from "./http_router_initial_config";

router.endpoint({
    url: "/cache",
    method: ["PURGE"],
    handler: async ({ text }) => text("PURGE Method /cache"),
});
