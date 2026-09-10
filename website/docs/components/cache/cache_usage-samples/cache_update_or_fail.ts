import { cache } from "./cache_initial_config";

await cache.updateOrFail("ab", 1);
