---
sidebar_position: 4
sidebar_label: Creating adapters
---

# Creating EventBus adapters

## Implementing your custom IEventBusAdapter

In order to create an adapter you need to implement the [`IEventBusAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/EventBus.IEventBusAdapter.html) contract.

## Testing your custom IEventBusAdapter

We provide a complete test suite to verify your event bus adapter implementation. Simply use the [`eventBusAdapterTestSuite`](https://yousif-khalil-abdulkarim.github.io/daiso-core/functions/EventBus.eventBusAdapterTestSuite.html) function:

- Preconfigured Vitest test cases
- Standardized event bus behavior validation
- Common edge case coverage

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

In some cases, you may need to implement a custom [`EventBus`](https://yousif-khalil-abdulkarim.github.io/daiso-core/modules/EventBus.html) class to optimize performance for your specific technology stack. You can then directly implement the [`IEventBus`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/EventBus.IEventBus.html) contract.

## Testing your custom IEventBus class

We provide a complete test suite to verify your custom event bus class implementation. Simply use the [`eventBusTestSuite`](https://yousif-khalil-abdulkarim.github.io/daiso-core/functions/EventBus.eventBusTestSuite.html) function:

- Preconfigured Vitest test cases
- Standardized event bus behavior validation
- Common edge case coverage

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
        createEventBus: () => new MyEventBus(),
    });
});
```

## Further information

For further information refer to [`@daiso-tech/core/event-bus`](https://yousif-khalil-abdulkarim.github.io/daiso-core/modules/EventBus.html) API docs.
