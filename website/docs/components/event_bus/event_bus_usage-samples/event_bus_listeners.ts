import { eventBus } from "./event_bus_initial_config.js";

await eventBus.addListener("add", (event) => {
    console.log(event);
});

await eventBus.dispatch("add", {
    a: 5,
    b: 5,
});
