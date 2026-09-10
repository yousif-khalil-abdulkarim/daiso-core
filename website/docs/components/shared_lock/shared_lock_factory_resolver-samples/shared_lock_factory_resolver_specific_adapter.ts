import { sharedLockFactoryResolver } from "./shared_lock_factory_resolver_initial_config";

await sharedLockFactoryResolver
    .use("redis")
    .create("shared-resource", {
        limit: 4,
    })
    .runWriterOrFail(async () => {
        // code to run
    });
