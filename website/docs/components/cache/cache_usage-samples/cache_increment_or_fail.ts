import { cache } from "./cache_initial_config.js";

await cache.incrementOrFail("ab", 1);
