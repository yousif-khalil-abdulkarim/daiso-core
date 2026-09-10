import { eventBus } from "./event_bus_initial_config";

const unsubscribe = await eventBus.subscribeOnce("add", (event) => {
    console.log(event);
});

await unsubscribe();

await eventBus.dispatch("add", {
    a: 5,
    b: 5,
});
