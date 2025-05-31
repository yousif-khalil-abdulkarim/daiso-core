---
sidebar_position: 2
---

# Event bus usage

## Initial configuration

To begin using the [`EventBus`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/EventBus.EventBus.html) class, you'll need to create and configure an instance:

```ts
import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/adapters";
import type { IEventBus } from "@daiso-tech/core/event-bus/contracts";
import { EventBus } from "@daiso-tech/core/event-bus";
import { Namespace } from "@daiso-tech/core/utilities";

const eventBus: IEventBus = new EventBus({
    // You can group events with a namespace class for automatic prefixing.
    namespace: new Namespace("event-bus"),

    // You can choose the adapter to use
    adapter: new MemoryEventBusAdapter(),
});
```

:::info
Here is a complete list of configuration settings for the [EventBus](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/EventBus.EventBusSettingsBase.html) class.
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
Note [`eventBus`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/EventBus.IEventBus.html) class instance uses [`LazyPromise`](/docs/8_Async/1_lazy_promise.md) instead of a regular `Promise`. This means you must either await the [`LazyPromise`](/docs/8_Async/1_lazy_promise.md) or call its `defer` method to run it. Refer to the [`LazyPromise`](/docs/8_Async/1_lazy_promise.md) documentation for further information.
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

### Typed events

An event map can be used to strictly type the events:

```ts
import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/adapters";
import type { IEventBus } from "@daiso-tech/core/event-bus/contracts";
import { EventBus } from "@daiso-tech/core/event-bus";
import { Namespace } from "@daiso-tech/core/utilities";

type AddEvent = {
    a: number;
    b: number;
};

type EventMap = {
    add: AddEvent;
};

const eventBus: IEventBus<EventMap> = new EventBus<EventMap>({
    namespace: new Namespace("event-bus"),
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
import { LazyPromise } from "@daiso-tech/core/async";
import { TimeSpan } from "@daiso-tech/core/utilities";

// This code block will run concurrently
(async () => {
    // We wait on second and thereafter dispatch the event.
    await LazyPromise.delay(TimeSpan.fromSeconds(1));
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

-   [`IEventDispatcher`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/EventBus.IEventDispatcher.html) – Allows only event dispatching.

-   [`IEventListenable`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/EventBus.IEventListenable.html) – Allows only event listening.

This seperation makes it easy to visually distinguish the two contracts, making it immediately obvious that they serve different purposes.

```ts
import type {
    IEventBus,
    IEventListenable,
    IEventDispatcher,
} from "@daiso-tech/core/event-bus/contracts";
import { MemoryEventBusAdapter } from "@daiso-tech/core/event-bus/adapters";
import { EventBus } from "@daiso-tech/core/event-bus";
import { Namespace } from "@daiso-tech/core/utilities";

const eventBus: IEventBus = new EventBus({
    // You can group events with a namespace class for automatic prefixing.
    namespace: new Namespace("event-bus"),

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

An event listener are [`Invokable`](../7_Utilities/3_invokable.md) meaning you can also pass in an object (class instance or object literal) as listener:

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

:::info
For further information refer the [`Invokable`](../7_Utilities/3_invokable.md) docs.
:::
