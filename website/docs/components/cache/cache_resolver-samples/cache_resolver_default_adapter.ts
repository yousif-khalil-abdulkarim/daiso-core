import { cacheResolver } from "./cache_resolver_initial_config.js";

await cacheResolver.use().add("user/jose@gmail.com", {
    name: "Jose",
    age: 20,
});
