import { router } from "./http_router_initial_config";

// Matches /wild/anything/card
router.endpoint({
    url: "/wild/*/card",
    method: ["GET"],
    handler: async ({ text }) => text("GET /wild/*/card"),
});
