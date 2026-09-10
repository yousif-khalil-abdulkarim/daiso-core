import { cache } from "./cache_initial_config.js";

await cache.decrement("a", 1);
