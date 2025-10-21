# EventBus

The `@daiso-tech/core/event-bus` component provides a way for dispatching and listening to events independent of underlying technology.

## Initial configuration

To begin using the `EventBus` class, you'll need to create and configure an instance:

```ts
import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/adapters";
import type { IEventBus } from "@daiso-tech/core/event-bus/contracts";
import { EventBus } from "@daiso-tech/core/event-bus";

const eventBus: IEventBus = new EventBus({
    // You can choose the adapter to use
    adapter: new MemoryEventBusAdapter(),
});
```

:::info
Here is a complete list of settings for the [`EventBus`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/EventBus.EventBusSettingsBase.html) class.
:::

## Event handling basics

### Registering Listeners and Dispatching Events

Event listeners can be added to respond to specific events:

```ts
await eventBus.addListener("add", (event) => {
    console.log(event);
});

await eventBus.dispatch("add", {
    a: 5,
    b: 5,
});
```

:::danger
Note `EventBus` class instance uses `Task` instead of a regular `Promise`. This means you must either await the `Task` or call its `defer` method to run it.
Refer to the [`@daiso-tech/core/task`](../Task.md) documentation for further information.
:::

### Listener management

To properly remove a listener, you must use a named function:

```ts
import type { BaseEvent } from "@daiso-tech/core/event-bus/contracts";

const listener = (event: BaseEvent) => {
    console.log(event);
};

await eventBus.addListener("add", listener);

await eventBus.removeListener("add", listener);

// The listener is removed before dispatch and won't be triggered.
await eventBus.dispatch("add", {
    a: 5,
    b: 5,
});
```

## Patterns

### Compile time type safety

An event map can be used to strictly type the events:

```ts
import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/adapters";
import type { IEventBus } from "@daiso-tech/core/event-bus/contracts";
import { EventBus } from "@daiso-tech/core/event-bus";

type AddEvent = {
    a: number;
    b: number;
};

type EventMap = {
    add: AddEvent;
};

const eventBus = new EventBus<EventMap>({
    adapter: new MemoryEventBusAdapter(),
});

// A typescript error will show up because the event name doesnt exist.
await eventBus.dispatch("addd", {
    a: 2,
    b: 2,
});

// A typescript error will show up because the event fields doesnt match
await eventBus.dispatch("add", {
    nbr1: 1,
    nbr2: 2,
});

// A typescript error will show up because the event name doesnt exist.
await eventBus.addListener("addd", (event) => {
    console.log(event);
});
```

### Runtime type safety

You can enforce runtime and compiletime type safety by passing [standard schema](https://standardschema.dev/) to the cache:

```ts
import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/adapters";
import { EventBus } from "@daiso-tech/core/event-bus";
import { z } from "zod";

const eventMapSchema = {
    add: z.object({
        a: z.number(),
        b: z.number(),
    }),
};

// The event type will be infered
const eventBus = new EventBus({
    adapter: new MemoryEventBusAdapter(),
    eventMapSchema,
});

// A typescript and runtime error will show up because the event fields doesnt match
await eventBus.dispatch("add", {
    nbr1: 1,
    nbr2: 2,
});
```

### Subscribe method

The subscription pattern provides automatic cleanup through an unsubscribe function:

```ts
const unsubscribe = await eventBus.subscribe("add", (event) => {
    console.log(event);
});
await eventBus.dispatch("add", {
    a: 20,
    b: 5,
});
await unsubscribe();
```

### One-Time event handling

For listeners that should only trigger once:

```ts
await eventBus.listenOnce("add", (event) => {
    console.log(event);
});

// Listener will be only triggered here
await eventBus.dispatch("add", {
    a: 5,
    b: 5,
});

// Listener will not be triggered because it removed after the first dispatch.
await eventBus.dispatch("add", {
    a: 3,
    b: 3,
});
```

You can also cancel one-time listeners before they trigger:

```ts
import type { BaseEvent } from "@daiso-tech/core/event-bus/contracts";

const listener = (event: BaseEvent) => {
    console.log(event);
};

await eventBus.listenOnce("add", listener);

await eventBus.removeListener("add", listener);

// The listener is removed before dispatch and won't be triggered.
await eventBus.dispatch("add", {
    a: 5,
    b: 5,
});
```

The `subscribeOnce` method creates a one-time listener and returns an unsubscribe function:

```ts
const unsubscribe = await eventBus.subscribeOnce("add", (event) => {
    console.log(event);
});

await unsubscribe();

await eventBus.dispatch("add", {
    a: 5,
    b: 5,
});
```

### Promise-based event handling

Wait for events using promises:

```ts
import { Task } from "@daiso-tech/core/task";
import { TimeSpan } from "@daiso-tech/core/time-span";

// This code block will run concurrently
(async () => {
    // We wait on second and thereafter dispatch the event.
    await Task.delay(TimeSpan.fromSeconds(1));
    await eventBus.dispatch("add", {
        a: 30,
        b: 20,
    });
})();

// The promise will resolve after one second, when the event is dispatched.
const event = await eventBus.asPromise("add");
console.log(event);
```

### Seperating dispatching and listening

The library includes two additional contracts:

- `IEventDispatcher` – Allows only event dispatching.

- `IEventListenable` – Allows only event listening.

This seperation makes it easy to visually distinguish the two contracts, making it immediately obvious that they serve different purposes.

```ts
import type {
    IEventBus,
    IEventListenable,
    IEventDispatcher,
} from "@daiso-tech/core/event-bus/contracts";
import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/adapters";
import { EventBus } from "@daiso-tech/core/event-bus";

const eventBus: IEventBus = new EventBus({
    // You can choose the adapter to use
    adapter: new MemoryEventBusAdapter(),
});

type AddEvent = {
    a: number;
    b: number;
};
type EventMap = {
    add: AddEvent;
};

async function listenerFunc(
    eventListenable: IEventListenable<EventMap>,
): Promise<void> {
    // You cannot access the dispatch method
    // You will get typescript error if you try

    await eventListenable.addListener("add", (event) => {
        console.log("EVENT:", event);
    });
}

async function dispatchingFunc(
    eventDispatcher: IEventDispatcher<EventMap>,
): Promise<void> {
    // You cannot access the listener methods
    // You will get typescript error if you try

    await eventDispatcher.dispatch("add", {
        a: 20,
        b: 5,
    });
}

await listenerFunc(eventBus);
await dispatchingFunc(eventBus);
```

### Invokable listeners

An event listener are `Invokable` meaning you can also pass in an object (class instance or object literal) as listener:

:::info
For further information refer the [`Invokable`](../../Utilities/Invokable.md) docs.
:::

```ts
type AddEvent = {
    a: number;
    b: number;
};
class Listener implements IEventListenerObject<AddEvent> {
    private count = 0;

    invoke(event: AddEvent): void {
        console.log("EVENT:", event);
        console.log("COUNT:", count);
        this.count++;
    }
}

await eventBus.addListener("add", new Listener());
await eventBus.dispatch("add", {
    a: 1,
    b: 2,
});
await eventBus.dispatch("add", {
    a: 3,
    b: -1,
});
```

### Namespacing

You can use the `Namespace` class to group related without conflicts.

:::info
For further information about namespacing refer to [`@daiso-tech/core/namespace`](../Namespace.md) documentation.
:::

```ts
import { Namespace } from "@daiso-tech/core/namespace";
import { RedisPubSubEventBus } from "@daiso-tech/core/event-bus/adapters";
import { EventBus } from "@daiso-tech/core/event-bus";
import { Serde } from "@daiso-tech/core/serde";
import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";
import Redis from "ioredis";

const client = new Redis("YOUR_REDIS_CONNECTION_STRING");
const serde = new Serde(new SuperJsonSerdeAdapter());

const eventBusA = new EventBus({
    namespace: new Namespace("@eventBus-a"),
    adapter: new RedisPubSubEventBus({
        client,
        serde,
    }),
});
const eventBusB = new EventBus({
    namespace: new Namespace("@eventBus-b"),
    adapter: new RedisPubSubEventBus({
        client,
        serde,
    }),
});

await eventBusA.addListener("test", (event) => {
    console.log("TEST_A:", event);
});
await eventBusB.addListener("test", () => {
    console.log("TEST_B", event);
});

// Will only log "TEST_A" { testA: true }
await eventBusA.dispatch("test", {
    testA: true,
});

// Will only log "TEST_B" { testB: true }
await eventBusB.dispatch("test", {
    testB: true,
});
```

## Further information

For further information refer to [`@daiso-tech/core/event-bus`](https://yousif-khalil-abdulkarim.github.io/daiso-core/modules/EventBus.html) API docs.
