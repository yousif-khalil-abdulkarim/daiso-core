import { eventBus } from "./event_bus_initial_config.js";

const unsubscribe = await eventBus.subscribe("add", (event) => {
    console.log(event);
});
await eventBus.dispatch("add", {
    a: 20,
    b: 5,
});
await unsubscribe();
