import { withPlugin } from "eridu-tech/middleware";
import { MemoryEventBusAdapter } from "eridu-tech/event-bus/memory-event-bus-adapter";
import { withListenerTracking } from "eridu-tech/event-bus/plugins";

const adapter = new MemoryEventBusAdapter();

// Plugin A: wraps listeners, e.g. to add logging
const pluginA = (instance, enhance) => {
    enhance(
        instance,
        "addListener",
        ({ args: [eventName, listener], next }) => {
            return next([
                eventName,
                (event) => {
                    console.log(`[A] Received "${eventName}"`);
                    return listener(event);
                },
            ]);
        },
    );
};

// Plugin B: another plugin that wraps listeners, e.g. to add validation
const pluginB = (instance, enhance) => {
    enhance(
        instance,
        "addListener",
        ({ args: [eventName, listener], next }) => {
            return next([
                eventName,
                (event) => {
                    console.log(`[B] Received "${eventName}"`);
                    return listener(event);
                },
            ]);
        },
    );
};

// Compose multiple tracking-wrapped plugins
const enhancedAdapter = withPlugin(adapter, [
    withListenerTracking(pluginA),
    withListenerTracking(pluginB),
]);
