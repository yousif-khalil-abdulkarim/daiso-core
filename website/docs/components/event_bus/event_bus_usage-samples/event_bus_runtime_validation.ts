import { MemoryEventBusAdapter } from "eridu-tech/event-bus/memory-event-bus-adapter";
import { EventBus } from "eridu-tech/event-bus";
import { z } from "zod";

type UserCreatedEvent = {
    userId: string;
    name: string;
};
// The value type stays permissive so schema validation is what enforces the
// full shape at runtime (compile-time safety is shown in event_bus_type_safety).
type EventMap = {
    "user.created": Partial<UserCreatedEvent>;
};

const eventBus = new EventBus<EventMap>({
    adapter: new MemoryEventBusAdapter(),
    eventMapSchema: {
        "user.created": z.object({
            userId: z.string(),
            name: z.string(),
        }),
    },
});

await eventBus.dispatch("user.created", {
    userId: "123",
    name: "John",
});

// Throws a ValidationError because userId is missing
await eventBus.dispatch("user.created", {
    name: "Jane",
});
