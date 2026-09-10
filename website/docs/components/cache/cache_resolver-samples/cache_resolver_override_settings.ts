import { TimeSpan } from "eridu-tech/time-span";
import { cacheResolver } from "./cache_resolver_initial_config.js";

await cacheResolver
    .setDefaultTtl(TimeSpan.fromMinutes(5))
    .use("redis")
    .add("user/jose@gmail.com", {
        name: "Jose",
        age: 20,
    });
