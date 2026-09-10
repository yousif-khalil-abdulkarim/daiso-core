import { EventBus } from "eridu-tech/event-bus";
import { MemoryEventBusAdapter } from "eridu-tech/event-bus/memory-event-bus-adapter";
import { z } from "zod";

type UserCreatedEvent = {
    userId: string;
    name: string;
};
type EventMap = {
    "user.created": UserCreatedEvent;
};

const eventBus = new EventBus<EventMap>({
    adapter: new MemoryEventBusAdapter(),
    eventMapSchema: {
        "user.created": z.object({
            userId: z.string(),
            name: z.string(),
        }),
    },
    shouldValidateListeners: false,
});
