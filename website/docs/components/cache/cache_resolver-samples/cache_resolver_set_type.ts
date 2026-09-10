import { cacheResolver } from "./cache_resolver_initial_config.js";

await cacheResolver
    .setType<string>()
    .use("redis")
    .add("user/jose@gmail.com", "some-string-value");
