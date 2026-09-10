import { cache } from "./cache_initial_config";

await cache.getOrAdd("ab", 1);
