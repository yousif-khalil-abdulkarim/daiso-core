import { container } from "./container.js";
import { CONFIG } from "./app_config.js";

container.registerValue({
    token: CONFIG,
    value: {
        apiUrl: "https://api.example.com",
        timeout: 5000,
    },
});
