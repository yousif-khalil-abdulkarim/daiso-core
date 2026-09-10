import { MemoryEventBusAdapter } from "eridu-tech/event-bus/memory-event-bus-adapter";

const adapter = new MemoryEventBusAdapter();

// Event data to dispatch and listener to register
const data = { userId: "123" };
const listener = (event) => {
    console.log("Received event:", event);
};

adapter.dispatch("user.created", data);
// -> dispatches "user.created"
adapter.addListener("user.created", listener);
// -> listens to "user.created"
