---
sidebar_position: 1
---

# Creating cache adapters

## Implementing your custom ICacheAdapter

In order to create an adapter you need to implement the [`ICacheAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Cache.ICacheAdapter.html) contract:

```ts
// filename: MyCacheAdapter.ts

import type { TimeSpan } from "@daiso-tech/core/utilities";
import type { ICacheAdapter } from "@daiso-tech/core/cache/contracts";

export class MyCacheAdapter<TType = unknown> implements ICacheAdapter<TType> {
    get(key: string): PromiseLike<TType | null> {
        throw new Error("Method not implemented.");
    }

    getAndRemove(key: string): PromiseLike<TType | null> {
        throw new Error("Method not implemented.");
    }

    add(key: string, value: TType, ttl: TimeSpan | null): PromiseLike<boolean> {
        throw new Error("Method not implemented.");
    }

    put(key: string, value: TType, ttl: TimeSpan | null): PromiseLike<boolean> {
        throw new Error("Method not implemented.");
    }

    update(key: string, value: TType): PromiseLike<boolean> {
        throw new Error("Method not implemented.");
    }

    increment(key: string, value: number): PromiseLike<boolean> {
        throw new Error("Method not implemented.");
    }

    removeMany(keys: string[]): PromiseLike<boolean> {
        throw new Error("Method not implemented.");
    }

    removeAll(): PromiseLike<void> {
        throw new Error("Method not implemented.");
    }

    removeByKeyPrefix(prefix: string): PromiseLike<void> {
        throw new Error("Method not implemented.");
    }
}
```

The [`ICacheAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Cache.ICacheAdapter.html) contract uses `PromiseLike` instead of `Promise` to maintain compatibility with:

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
// filename: MyCacheAdapter.ts

import type { TimeSpan } from "@daiso-tech/core/utilities";
import type { ICacheAdapter } from "@daiso-tech/core/cache/contracts";

export class MyCacheAdapter<TType = unknown> implements ICacheAdapter<TType> {
    async get(key: string): Promise<TType | null> {
        throw new Error("Method not implemented.");
    }

    async getAndRemove(key: string): Promise<TType | null> {
        throw new Error("Method not implemented.");
    }

    async add(
        key: string,
        value: TType,
        ttl: TimeSpan | null,
    ): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    async put(
        key: string,
        value: TType,
        ttl: TimeSpan | null,
    ): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    async update(key: string, value: TType): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    async increment(key: string, value: number): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    async removeMany(keys: string[]): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    async removeAll(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async removeByKeyPrefix(prefix: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
}
```

:::

## Testing your custom ICacheAdapter

We provide a complete test suite to verify your event bus adapter implementation. Simply use the [cacheAdapterTestSuite](https://yousif-khalil-abdulkarim.github.io/daiso-core/functions/Cache.cacheAdapterTestSuite.html) function:

-   Preconfigured Vitest test cases
-   Standardized event bus behavior validation
-   Common edge case coverage

Usage example:

```ts
// filename: MyCacheAdapter.test.ts

import { beforeEach, describe, expect, test } from "vitest";
import { cacheAdapterTestSuite } from "@daiso-tech/core/cache/test-utilities";
import { MemoryCacheAdapter } from "./MemoryCacheAdapter.js";

describe("class: MyCacheAdapter", () => {
    cacheAdapterTestSuite({
        createAdapter: () => new MemoryCacheAdapter(),
        test,
        beforeEach,
        expect,
        describe,
    });
});
```

## Implementing your custom IDatabaseCacheAdapter

We provide an additional contract [`IDatabaseCacheAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Cache.IDatabaseCacheAdapter.html) for building custom cache adapters tailored to databases:

```ts
// MyDatabaseCacheAdapter.ts
import type {
    IDatabaseCacheAdapter,
    ICacheData,
    ICacheInsert,
    ICacheUpdate,
} from "@daiso-tech/core/cache/contracts";

export class MyDatabaseCacheAdapter<TType = unknown>
    implements IDatabaseCacheAdapter<TType>
{
    find(key: string): PromiseLike<ICacheData<TType> | null> {
        throw new Error("Method not implemented.");
    }

    insert(data: ICacheInsert<TType>): PromiseLike<void> {
        throw new Error("Method not implemented.");
    }

    upsert(
        data: ICacheInsert<TType>,
    ): PromiseLike<ICacheDataExpiration | null> {
        throw new Error("Method not implemented.");
    }

    updateExpired(data: ICacheInsert<TType>): PromiseLike<number> {
        throw new Error("Method not implemented.");
    }

    updateUnexpired(data: ICacheUpdate<TType>): PromiseLike<number> {
        throw new Error("Method not implemented.");
    }

    incrementUnexpired(data: ICacheUpdate<number>): PromiseLike<number> {
        throw new Error("Method not implemented.");
    }

    removeExpiredMany(keys: string[]): PromiseLike<number> {
        throw new Error("Method not implemented.");
    }

    removeUnexpiredMany(keys: string[]): PromiseLike<number> {
        throw new Error("Method not implemented.");
    }

    removeAll(): PromiseLike<void> {
        throw new Error("Method not implemented.");
    }

    removeByKeyPrefix(prefix: string): PromiseLike<void> {
        throw new Error("Method not implemented.");
    }
}
```

The [`IDatabaseCacheAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Cache.IDatabaseCacheAdapter.html) contract uses `PromiseLike` instead of `Promise` to maintain compatibility with:

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
// MyDatabaseCacheAdapter.ts
import type {
    IDatabaseCacheAdapter,
    ICacheData,
    ICacheInsert,
    ICacheUpdate,
} from "@daiso-tech/core/cache/contracts";

export class MyDatabaseCacheAdapter implements IDatabaseCacheAdapter {
    async find(key: string): Promise<ICacheData<TType> | null> {
        throw new Error("Method not implemented.");
    }

    async insert(data: ICacheInsert<TType>): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async upsert(
        data: ICacheInsert<TType>,
    ): Promise<ICacheDataExpiration | null> {
        throw new Error("Method not implemented.");
    }

    async updateExpired(data: ICacheInsert<TType>): Promise<number> {
        throw new Error("Method not implemented.");
    }

    async updateUnexpired(data: ICacheUpdate<TType>): Promise<number> {
        throw new Error("Method not implemented.");
    }

    async incrementUnexpired(data: ICacheUpdate<number>): Promise<number> {
        throw new Error("Method not implemented.");
    }

    async removeExpiredMany(keys: string[]): Promise<number> {
        throw new Error("Method not implemented.");
    }

    async removeUnexpiredMany(keys: string[]): Promise<number> {
        throw new Error("Method not implemented.");
    }

    async removeAll(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async removeByKeyPrefix(prefix: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
}
```

:::

## Testing your custom IDatabaseCacheAdapter

We provide a complete test suite to verify your event bus adapter implementation. Simply use the [databaseCacheAdapterTestSuite](https://yousif-khalil-abdulkarim.github.io/daiso-core/functions/Cache.databaseCacheAdapterTestSuite.html) function:

-   Preconfigured Vitest test cases
-   Standardized event bus behavior validation
-   Common edge case coverage

Usage example:

```ts
import { beforeEach, describe, expect, test } from "vitest";
import { databaseCacheAdapterTestSuite } from "@daiso-tech/core/cache/test-utilities";
import { MyDatabaseCacheAdapter } from "./MyDatabaseCacheAdapter.js";

describe("class: MyDatabaseCacheAdapter", () => {
    databaseCacheAdapterTestSuite({
        createAdapter: async () => {
            return new MyDatabaseCacheAdapter(),
        },
        test,
        beforeEach,
        expect,
        describe,
    });
});
```

## Implementing your custom ICache class

In some cases, you may need to implement a custom [`Cache`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Cache.Cache.html) class to optimize performance for your specific technology stack. You can then directly implement the [`ICache`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Cache.ICache.html) contract.

## Testing your custom ICache class

We provide a complete test suite to verify your custom event bus class implementation. Simply use the [cacheTestSuite](https://yousif-khalil-abdulkarim.github.io/daiso-core/functions/Cache.cacheTestSuite.html) function:

-   Preconfigured Vitest test cases
-   Standardized event bus behavior validation
-   Common edge case coverage

Usage example:

```ts
// filename: MyCache.test.ts

import { beforeEach, describe, expect, test } from "vitest";
import { cacheTestSuite } from "@daiso-tech/core/cache/test-utilities";
import { MyCache } from "./MyCache.js";

describe("class: MyCache", () => {
    cacheTestSuite({
        createCache: () => new MyCache(),
        test,
        beforeEach,
        expect,
        describe,
    });
});
```
