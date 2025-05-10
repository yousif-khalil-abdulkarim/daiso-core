---
sidebar_position: 2
---

# Creating event bus adapters

## Implementing your custom IEventBusAdapter

In order to create an adapter you need to implement the [`IEventBusAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/EventBus.IEventBusAdapter.html) contract:

```ts
// filename: MyEventBusAdapter.ts

import type {
    IEventBusAdapter,
    EventListenerFn,
    BaseEvent,
} from "@daiso-tech/core/event-bus/contracts";

export class MyEventBusAdapter implements IEventBusAdapter {
    addListener(
        eventName: string,
        listener: EventListenerFn<BaseEvent>,
    ): PromiseLike<void> {
        throw new Error("Method not implemented.");
    }

    removeListener(
        eventName: string,
        listener: EventListenerFn<BaseEvent>,
    ): PromiseLike<void> {
        throw new Error("Method not implemented.");
    }

    dispatch(eventName: string, eventData: BaseEvent): PromiseLike<void> {
        throw new Error("Method not implemented.");
    }
}
```

The [`IEventBusAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/EventBus.IEventBusAdapter.html) contract uses `PromiseLike` instead of `Promise` to maintain compatibility with:

-   Native JavaScript Promises
-   Alternative promise libraries (e.g., [Bluebird](http://bluebirdjs.com/docs/getting-started.html))
-   Any [Promise/A+](https://promisesaplus.com/) compliant implementation

This provides flexibility while ensuring standard promise behavior is maintained.

Key benefits:

-   Works across different promise implementations (good for integrating legacy code)
-   Maintains type safety while being less restrictive

:::info
In order to use async function you need to replace `PromiseLike` with `Promise`:

```ts
// filename: MyEventBusAdapter.ts

export class MyEventBusAdapter implements IEventBusAdapter {
    async addListener(
        eventName: string,
        listener: EventListenerFn<BaseEvent>,
    ): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async removeListener(
        eventName: string,
        listener: EventListenerFn<BaseEvent>,
    ): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async dispatch(eventName: string, eventData: BaseEvent): Promise<void> {
        throw new Error("Method not implemented.");
    }
}
```

:::

## Testing your custom IEventBusAdapter

We provide a complete test suite to verify your event bus adapter implementation. Simply use the [eventBusAdapterTestSuite](https://yousif-khalil-abdulkarim.github.io/daiso-core/functions/EventBus.eventBusAdapterTestSuite.html) function:

-   Preconfigured Vitest test cases
-   Standardized event bus behavior validation
-   Common edge case coverage

Usage example:

```ts
// filename: MyEventBusAdapter.test.ts

import { describe, test, beforeEach, expect } from "vitest";
import { eventBusAdapterTestSuite } from "@daiso-tech/core/event-bus/test-utilities";
import { MyEventBusAdapter } from "./MyEventBusAdapter.js";

describe("class: MyEventBusAdapter", () => {
    eventBusAdapterTestSuite({
        createAdapter: () => new MyEventBusAdapter(),
        test,
        beforeEach,
        expect,
        describe,
    });
});
```

## Implementing your custom IEventBus class

In some cases, you may need to implement a custom [`EventBus`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/EventBus.EventBus.html) class to optimize performance for your specific technology stack. You can then directly implement the [`IEventBus`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/EventBus.IEventBus.html) contract.

## Testing your custom IEventBus class

We provide a complete test suite to verify your custom event bus class implementation. Simply use the [eventBusTestSuite](https://yousif-khalil-abdulkarim.github.io/daiso-core/functions/EventBus.eventBusTestSuite.html) function:

-   Preconfigured Vitest test cases
-   Standardized event bus behavior validation
-   Common edge case coverage

Usage example:

```ts
// filename: MyEventBus.test.ts

import { describe, test, beforeEach, expect } from "vitest";
import { eventBusTestSuite } from "@daiso-tech/core/event-bus/test-utilities";
import { MyEventBus } from "./MyEventBus.js";

describe("class: EventBus", () => {
    eventBusTestSuite({
        test,
        expect,
        describe,
        beforeEach,
        createEventBus: () =>
            new MyEventBus(),
    });
});

```