import { lockFactoryResolver } from "./lock_factory_resolver_initial_config.js";

await lockFactoryResolver
    .use()
    .create("shared-resource")
    .runOrFail(async () => {
        // code to run
    });
