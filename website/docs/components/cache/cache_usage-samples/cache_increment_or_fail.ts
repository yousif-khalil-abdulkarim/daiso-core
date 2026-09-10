import { cache } from "./cache_initial_config";

await cache.incrementOrFail("ab", 1);
