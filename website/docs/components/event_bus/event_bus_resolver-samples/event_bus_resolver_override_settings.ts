import { z } from "zod";
import { eventBusResolver } from "./event_bus_resolver_initial_config";

await eventBusResolver
    // You can overide the event type by calling setEventMapType or setEventMapSchema method again
    .setEventMapType<{
        add: {
            a: 1;
            b: 2;
        };
    }>()
    .setEventMapSchema({
        sub: z.object({
            c: z.number(),
            d: z.number(),
        }),
    })
    .use("redis")
    .dispatch("sub", {
        c: 1,
        d: 2,
    });
