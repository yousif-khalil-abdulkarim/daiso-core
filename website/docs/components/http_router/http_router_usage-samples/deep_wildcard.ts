import { router } from "./http_router_initial_config.js";

// Matches /static/js/app.js, /static/css/style.css, etc.
router.endpoint({
    url: "/static/*",
    method: ["GET"],
    handler: async ({ text }) => text("Static file"),
});
