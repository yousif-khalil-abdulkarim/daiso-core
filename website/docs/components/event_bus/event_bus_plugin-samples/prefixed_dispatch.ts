import { withPlugin } from "eridu-tech/middleware";
import { MemoryEventBusAdapter } from "eridu-tech/event-bus/memory-event-bus-adapter";
import { withEventBusPrefix } from "eridu-tech/event-bus/plugins";

const adapter = new MemoryEventBusAdapter();

// Apply the prefix plugin to the adapter
const prefixedAdapter = withPlugin(adapter, withEventBusPrefix("tenant-42:"));

// Event data to dispatch and listener to register
const data = { userId: "123" };
const listener = (event) => {
    console.log("Received event:", event);
};

prefixedAdapter.dispatch("user.created", data);
// -> dispatches "tenant-42:user.created"
prefixedAdapter.addListener("user.created", listener);
// -> listens to "tenant-42:user.created"
