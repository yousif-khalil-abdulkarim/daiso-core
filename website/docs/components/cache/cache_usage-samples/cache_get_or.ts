import { cache } from "./cache_initial_config.js";

await cache.getOr("ab", 1);
