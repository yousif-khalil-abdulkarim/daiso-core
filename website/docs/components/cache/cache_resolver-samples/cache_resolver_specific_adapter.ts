import { cacheResolver } from "./cache_resolver_initial_config";

await cacheResolver.use("redis").add("user/jose@gmail.com", {
    name: "Jose",
    age: 20,
});
