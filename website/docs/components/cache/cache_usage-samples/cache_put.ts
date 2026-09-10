import { cache } from "./cache_initial_config.js";
import { TimeSpan } from "eridu-tech/time-span";

await cache.put("a", 2);
await cache.put("a", 4, TimeSpan.fromSeconds(3));
