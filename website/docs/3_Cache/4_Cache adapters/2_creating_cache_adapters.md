---
sidebar_position: 1
---

# Creating cache adapters

## Implementing your custom ICacheAdapter

In order to create an adapter you need to implement the [`ICacheAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Cache.ICacheAdapter.html) contract.

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

We provide an additional contract [`IDatabaseCacheAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Cache.IDatabaseCacheAdapter.html) for building custom cache adapters tailored to databases.

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
