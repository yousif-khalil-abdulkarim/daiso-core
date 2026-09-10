import { eventBusResolver } from "./event_bus_resolver_initial_config.js";

await eventBusResolver.use().dispatch("add", { a: 1, b: 2 });
