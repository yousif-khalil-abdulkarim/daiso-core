import { cache } from "./cache_initial_config.js";

await cache.getOrAdd("ab", 1);
