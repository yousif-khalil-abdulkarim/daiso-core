import { lockFactoryResolver } from "./lock_factory_resolver_initial_config";
import { TimeSpan } from "eridu-tech/time-span";

await lockFactoryResolver
    .setDefaultTtl(TimeSpan.fromMinutes(5))
    .use("redis")
    .create("shared-resource")
    .runOrFail(async () => {
        // code to run
    });
