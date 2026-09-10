import { EventBus } from "eridu-tech/event-bus";
import { MemoryEventBusAdapter } from "eridu-tech/event-bus/memory-event-bus-adapter";
import type { IEventListenerObject } from "eridu-tech/event-bus/contracts";

type AddEvent = {
    a: number;
    b: number;
};
type EventMap = {
    add: AddEvent;
};

class Listener implements IEventListenerObject<AddEvent> {
    private count = 0;

    invoke(event: AddEvent): void {
        console.log("EVENT:", event);
        console.log("COUNT:", this.count);
        this.count++;
    }
}

const eventBus = new EventBus<EventMap>({
    adapter: new MemoryEventBusAdapter(),
});

await eventBus.addListener("add", new Listener());
await eventBus.dispatch("add", {
    a: 1,
    b: 2,
});
await eventBus.dispatch("add", {
    a: 3,
    b: -1,
});
