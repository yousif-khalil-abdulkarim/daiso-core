---
sidebar_position: 1
---

# Creating lock adapters

## Implementing your custom ILockAdapter

In order to create an adapter you need to implement the [`ILockAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Lock.ILockAdapter.html) contract:

```ts
// filename: MyLockAdapter.ts
import type { ILockAdapter } from "@daiso-tech/core/lock/contracts";
import type { TimeSpan } from "@daiso-tech/core/utilities";

export class MyLockAdapter implements ILockAdapter {
    acquire(
        key: string,
        owner: string,
        ttl: TimeSpan | null,
    ): PromiseLike<boolean> {
        throw new Error("Method not implemented.");
    }

    release(key: string, owner: string): PromiseLike<boolean> {
        throw new Error("Method not implemented.");
    }

    forceRelease(key: string): PromiseLike<void> {
        throw new Error("Method not implemented.");
    }

    refresh(key: string, owner: string, ttl: TimeSpan): PromiseLike<boolean> {
        throw new Error("Method not implemented.");
    }
}
```

The [`ILockAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Lock.ILockAdapter.html) contract uses `PromiseLike` instead of `Promise` to maintain compatibility with:

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
// filename: MyLockAdapter.ts
import type { ILockAdapter } from "@daiso-tech/core/lock/contracts";
import type { TimeSpan } from "@daiso-tech/core/utilities";

export class MyLockAdapter implements ILockAdapter {
    async acquire(
        key: string,
        owner: string,
        ttl: TimeSpan | null,
    ): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    async release(key: string, owner: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    async forceRelease(key: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async refresh(key: string, owner: string, ttl: TimeSpan): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
}
```

:::

## Testing your custom ILockAdapter

We provide a complete test suite to verify your event bus adapter implementation. Simply use the [`lockAdapterTestSuite`](https://yousif-khalil-abdulkarim.github.io/daiso-core/functions/Lock.lockAdapterTestSuite.html) function:

-   Preconfigured Vitest test cases
-   Standardized event bus behavior validation
-   Common edge case coverage

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

We provide an additional contract [`IDatabaseLockAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Lock.IDatabaseLockAdapter.html) for building custom lock adapters tailored to databases:

```ts
// MyDatabaseLockAdapter.ts
import type {
    ILockData,
    IDatabaseLockAdapter,
} from "@daiso-tech/core/lock/contracts";

export class MyDatabaseLockAdapter implements IDatabaseLockAdapter {
    insert(
        key: string,
        owner: string,
        expiration: Date | null,
    ): PromiseLike<void> {
        throw new Error("Method not implemented.");
    }

    update(
        key: string,
        owner: string,
        expiration: Date | null,
    ): PromiseLike<number> {
        throw new Error("Method not implemented.");
    }

    remove(key: string, owner: string | null): PromiseLike<void> {
        throw new Error("Method not implemented.");
    }

    refresh(key: string, owner: string, expiration: Date): PromiseLike<number> {
        throw new Error("Method not implemented.");
    }

    find(key: string): PromiseLike<ILockData | null> {
        throw new Error("Method not implemented.");
    }
}
```

The [`IDatabaseLockAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Lock.IDatabaseLockAdapter.html) contract uses `PromiseLike` instead of `Promise` to maintain compatibility with:

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
// MyDatabaseLockAdapter.ts
import type {
    ILockData,
    IDatabaseLockAdapter,
} from "@daiso-tech/core/lock/contracts";

export class MyDatabaseLockAdapter implements IDatabaseLockAdapter {
    async insert(
        key: string,
        owner: string,
        expiration: Date | null,
    ): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async update(
        key: string,
        owner: string,
        expiration: Date | null,
    ): Promise<number> {
        throw new Error("Method not implemented.");
    }

    async remove(key: string, owner: string | null): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async refresh(
        key: string,
        owner: string,
        expiration: Date,
    ): Promise<number> {
        throw new Error("Method not implemented.");
    }

    async find(key: string): Promise<ILockData | null> {
        throw new Error("Method not implemented.");
    }
}
```

:::

## Testing your custom IDatabaseLockAdapter

We provide a complete test suite to verify your event bus adapter implementation. Simply use the [`databaseLockAdapterTestSuite`](https://yousif-khalil-abdulkarim.github.io/daiso-core/functions/Lock.databaseLockAdapterTestSuite.html) function:

-   Preconfigured Vitest test cases
-   Standardized event bus behavior validation
-   Common edge case coverage

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

-   Preconfigured Vitest test cases
-   Standardized event bus behavior validation
-   Common edge case coverage

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
