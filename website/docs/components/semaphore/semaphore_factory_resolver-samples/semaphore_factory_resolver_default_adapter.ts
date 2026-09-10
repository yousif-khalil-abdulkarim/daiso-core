import { semaphoreFactoryResolver } from "./semaphore_factory_resolver_initial_config.js";

await semaphoreFactoryResolver
    .use()
    .create("shared-resource", {
        limit: 2,
    })
    .runOrFail(async () => {
        // code to run
    });
