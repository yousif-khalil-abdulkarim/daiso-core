import { cache } from "./cache_initial_config.js"

await cache.addOrFail("ab", 1);
