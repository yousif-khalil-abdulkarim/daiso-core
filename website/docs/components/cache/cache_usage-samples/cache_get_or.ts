import { cache } from "./cache_initial_config";

await cache.getOr("ab", 1);
