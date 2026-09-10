import { cache } from "./cache_initial_config"

await cache.decrementOrFail("ab", 1);
