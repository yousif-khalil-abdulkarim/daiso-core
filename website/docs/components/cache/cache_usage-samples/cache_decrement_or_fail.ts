import { cache } from "./cache_initial_config.js"

await cache.decrementOrFail("ab", 1);
