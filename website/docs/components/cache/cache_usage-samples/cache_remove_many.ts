import { cache } from "./cache_initial_config.js";

await cache.removeMany(["a", "b"]);
