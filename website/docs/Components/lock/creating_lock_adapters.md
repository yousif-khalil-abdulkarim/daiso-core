---
sidebar_position: 4
sidebar_label: Creating adapters
---

# Creating lock adapters

## Implementing your custom ILockAdapter

In order to create an adapter you need to implement the [`ILockAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Lock.ILockAdapter.html) contract.

## Testing your custom ILockAdapter

We provide a complete test suite to verify your event bus adapter implementation. Simply use the [`lockAdapterTestSuite`](https://yousif-khalil-abdulkarim.github.io/daiso-core/functions/Lock.lockAdapterTestSuite.html) function:

- Preconfigured Vitest test cases
- Standardized event bus behavior validation
- Common edge case coverage

Usage example:

```ts
// filename: MyLockAdapter.test.ts

import { beforeEach, describe, expect, test } from "vitest";
import { lockAdapterTestSuite } from "@daiso-tech/core/lock/test-utilities";
import { MemoryLockAdapter } from "./MemoryLockAdapter.js";

describe("class: MyLockAdapter", () => {
    lockAdapterTestSuite({
        createAdapter: () => new MemoryLockAdapter(),
        test,
        beforeEach,
        expect,
        describe,
    });
});
```

## Implementing your custom IDatabaseLockAdapter

We provide an additional contract [`IDatabaseLockAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Lock.IDatabaseLockAdapter.html) for building custom lock adapters tailored to databases.

## Testing your custom IDatabaseLockAdapter

We provide a complete test suite to verify your event bus adapter implementation. Simply use the [`databaseLockAdapterTestSuite`](https://yousif-khalil-abdulkarim.github.io/daiso-core/functions/Lock.databaseLockAdapterTestSuite.html) function:

- Preconfigured Vitest test cases
- Standardized event bus behavior validation
- Common edge case coverage

Usage example:

```ts
import { beforeEach, describe, expect, test } from "vitest";
import { databaseLockAdapterTestSuite } from "@daiso-tech/core/lock/test-utilities";
import { MyDatabaseLockAdapter } from "./MyDatabaseLockAdapter.js";

describe("class: MyDatabaseLockAdapter", () => {
    databaseLockAdapterTestSuite({
        createAdapter: async () => {
            return new MyDatabaseLockAdapter(),
        },
        test,
        beforeEach,
        expect,
        describe,
    });
});
```

## Implementing your custom ILockProvider class

In some cases, you may need to implement a custom [`LockProvider`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Lock.LockProvider.html) class to optimize performance for your specific technology stack. You can then directly implement the [`ILockProvider`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Lock.ILockProvider.html) contract.

## Testing your custom ILockProvider class

We provide a complete test suite to verify your custom event bus class implementation. Simply use the [`lockProviderTestSuite`](https://yousif-khalil-abdulkarim.github.io/daiso-core/functions/Lock.lockProviderTestSuite.html) function:

- Preconfigured Vitest test cases
- Standardized event bus behavior validation
- Common edge case coverage

Usage example:

```ts
// filename: MyLockProvider.test.ts

import { beforeEach, describe, expect, test } from "vitest";
import { lockProviderTestSuite } from "@daiso-tech/core/lock/test-utilities";
import { MyLockProvider } from "./MyLockProvider.js";

describe("class: MyLockProvider", () => {
    lockProviderTestSuite({
        createLockProvider: () => new MyLockProvider(),
        test,
        beforeEach,
        expect,
        describe,
    });
});
```

## Further information

For further information refer to [`@daiso-tech/core/lock`](https://yousif-khalil-abdulkarim.github.io/daiso-core/modules/Lock.html) API docs.
