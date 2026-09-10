import { cache } from "./cache_initial_config.js";
import { TimeSpan } from "eridu-tech/time-span";

await cache.add("a", "value", TimeSpan.fromSeconds(1));
