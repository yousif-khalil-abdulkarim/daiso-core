import { semaphoreFactoryResolver } from "./semaphore_factory_resolver_initial_config";

await semaphoreFactoryResolver
    .use("redis")
    .create("shared-resource", {
        limit: 2,
    })
    .runOrFail(async () => {
        // code to run
    });
