# SharedLock adapters

## Using shared-lock adapters

### MemorySharedLockAdapter

To use the `MemorySharedLockAdapter` you only need to create instance of it:

```ts
import { MemorySharedLockAdapter } from "@daiso-tech/core/shared-lock/adapters";

const memorySharedLockAdapter = new MemorySharedLockAdapter();
```

You can also provide an `Map` that will be used for storing the data in memory:

```ts
import { MemorySharedLockAdapter } from "@daiso-tech/core/shared-lock/adapters";

const map = new Map<any, any>();
const memorySharedLockAdapter = new MemorySharedLockAdapter(map);
```

:::info
`MemorySharedLockAdapter` lets you test your app without external dependencies like `Redis`, ideal for local development, unit tests, integration tests and fast E2E test for the backend application.
:::

:::danger
Note the `MemorySharedLockAdapter` is limited to single process usage and cannot be shared across multiple servers or processes.
:::

### MongodbSharedLockAdapter

To use the `MongodbSharedLockAdapter`, you'll need to:

1. Install the required dependency: [`mongodb`](https://www.npmjs.com/package/mongodb) package

```ts
import { MongodbSharedLockAdapter } from "@daiso-tech/core/shared-lock/adapters";
import { MongoClient } from "mongodb";

const client = await MongoClient.connect("YOUR_MONGODB_CONNECTION_STRING");
const database = client.db("database");
const mongodbSharedLockAdapter = new MongodbSharedLockAdapter({
    database,
});

// You need initialize the adapter once before using it.
// During the initialization the indexes will be created
await mongodbSharedLockAdapter.init();
```

You can change the collection name:

```ts
const mongodbSharedLockAdapter = new MongodbSharedLockAdapter({
    database,
    // By default "shared-lock" is used as collection name
    collectionName: "my-shared-lock",
});

await mongodbSharedLockAdapter.init();
```

You can change the collection settings:

```ts
const mongodbSharedLockAdapter = new MongodbSharedLockAdapter({
    database,
    // You configure additional collection settings
    collectionSettings: {},
});

await mongodbSharedLockAdapter.init();
```

:::info
To remove the shared-lock collection and all stored shared-lock data, use `deInit` method:

```ts
await mongodbSharedLockAdapter.deInit();
```

:::

:::danger
Note in order to use `MongodbSharedLockAdapter` correctly, ensure you use a single, consistent database across all server instances or processes.
:::

### RedisSharedLockAdapter

To use the `RedisSharedLockAdapter`, you'll need to:

1. Install the required dependency: [`ioredis`](https://www.npmjs.com/package/ioredis) package

```ts
import { RedisSharedLockAdapter } from "@daiso-tech/core/shared-lock/adapters";
import Redis from "ioredis";

const database = new Redis("YOUR_REDIS_CONNECTION_STRING");
const redisSharedLockAdapter = new RedisSharedLockAdapter(database);
```

:::danger
Note in order to use `RedisSharedLockAdapter` correctly, ensure you use a single, consistent database across all server instances or processes.
:::

### KyselySharedLockAdapter

To use the `KyselySharedLockAdapter`, you'll need to:

1. Install the required dependency: [`kysely`](https://www.npmjs.com/package/kysely) package

#### Usage with Sqlite

You will need to install [`better-sqlite3`](https://www.npmjs.com/package/better-sqlite3) package:

```ts
import { TimeSpan } from "@daiso-tech/core/utilities";
import { KyselySharedLockAdapter } from "@daiso-tech/core/shared-lock/adapters";
import Sqlite from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";

const database = new Sqlite("DATABASE_NAME.db");
const kysely = new Kysely({
    dialect: new SqliteDialect({
        database,
    }),
});
const kyselySharedLockAdapter = new KyselySharedLockAdapter({
    kysely,
});

// You need initialize the adapter once before using it.
// During the initialization the schema will be created
await kyselySharedLockAdapter.init();
```

:::danger
Note using `KyselySharedLockAdapter` with `sqlite` is limited to single server usage and cannot be shared across multiple servers but it can be shared between different processes. To use it correctly, ensure all process instances access the same persisted database.
:::

#### Usage with Postgres

You will need to install [`pg`](https://www.npmjs.com/package/pg) package:

```ts
import { TimeSpan } from "@daiso-tech/core/utilities";
import { KyselySharedLockAdapter } from "@daiso-tech/core/shared-lock/adapters";
import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";

const database = new Pool({
    database: "DATABASE_NAME",
    host: "DATABASE_HOST",
    user: "DATABASE_USER",
    // DATABASE port
    port: 5432,
    password: "DATABASE_PASSWORD",
    max: 10,
});
const kysely = new Kysely({
    dialect: new PostgresDialect({
        pool: database,
    }),
});
const kyselySharedLockAdapter = new KyselySharedLockAdapter({
    kysely,
});

// You need initialize the adapter once before using it.
// During the initialization the schema will be created
await kyselySharedLockAdapter.init();
```

:::danger
Note in order to use `KyselySharedLockAdapter` with `postgres` correctly, ensure you use a single, consistent database across all server instances. This means you can't use replication.
:::

#### Usage with Mysql

You will need to install [`mysql2`](https://www.npmjs.com/package/mysql2) package:

```ts
import { TimeSpan } from "@daiso-tech/core/utilities";
import { KyselySharedLockAdapter } from "@daiso-tech/core/shared-lock/adapters";
import { createPool } from "mysql2";
import { Kysely, MysqlDialect } from "kysely";

const database = createPool({
    host: "DATABASE_HOST",
    // Database port
    port: 3306,
    database: "DATABASE_NAME",
    user: "DATABASE_USER",
    password: "DATABASE_PASSWORD",
    connectionLimit: 10,
});
const kysely = new Kysely({
    dialect: new MysqlDialect({
        pool: database,
    }),
});
const kyselySharedLockAdapter = new KyselySharedLockAdapter({
    kysely,
});

// You need initialize the adapter once before using it.
// During the initialization the schema will be created
await kyselySharedLockAdapter.init();
```

:::danger
Note in order to use `KyselySharedLockAdapter` with `mysql` correctly, ensure you use a single, consistent database across all server instances. This means you can't use replication.
:::

#### Usage with Libsql

You will need to install `@libsql/kysely-libsql` package:

```ts
import { TimeSpan } from "@daiso-tech/core/utilities";
import { KyselySharedLockAdapter } from "@daiso-tech/core/shared-lock/adapters";
import { LibsqlDialect } from "@libsql/kysely-libsql";
import { Kysely } from "kysely";

const kysely = new Kysely({
    dialect: new LibsqlDialect({
        url: "DATABASE_URL",
    }),
});
const kyselySharedLockAdapter = new KyselySharedLockAdapter({
    kysely,
});

// You need initialize the adapter once before using it.
// During the initialization the schema will be created
await kyselySharedLockAdapter.init();
```

:::danger
Note in order to use `KyselySharedLockAdapter` with `libsql` correctly, ensure you use a single, consistent database across all server instances. This means you can't use libsql embedded replicas.
:::

#### Settings

Expired keys are cleared at regular intervals and you can change the interval time:

```ts
import { TimeSpan } from "@daiso-tech/core/utilities";

const kyselySharedLockAdapter = new KyselySharedLockAdapter({
    database,
    // By default, the interval is 1 minute
    expiredKeysRemovalInterval: TimeSpan.fromSeconds(10),
});

await kyselySharedLockAdapter.init();
```

Disabling scheduled interval cleanup of expired keys:

```ts
import { TimeSpan } from "@daiso-tech/core/utilities";

const kyselySharedLockAdapter = new KyselySharedLockAdapter({
    database,
    shouldRemoveExpiredKeys: false,
});

await kyselySharedLockAdapter.init();

// You can remove all expired keys manually.
await kyselySharedLockAdapter.removeAllExpired();
```

:::info
To remove the shared-lock table and all stored shared-lock data, use `deInit` method:

```ts
await kyselySharedLockAdapter.deInit();
```
:::

### NoOpSharedLockAdapter

The `NoOpSharedLockAdapter` is a no-operation implementation, it performs no actions when called:

```ts
import { NoOpSharedLockAdapter } from "@daiso-tech/core/shared-lock/adapters";

const noOpSharedLockAdapter = new NoOpSharedLockAdapter();
```

:::info
The `NoOpSharedLockAdapter` is useful when you want to mock out or disable your `SharedLockProvider` instance.
:::

## Creating shared-lock adapters

### Implementing your custom ISharedLockAdapter

In order to create an adapter you need to implement the [`ISharedLockAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/SharedLock.ISharedLockAdapter.html) contract.

### Testing your custom ISharedLockAdapter

We provide a complete test suite to verify your event bus adapter implementation. Simply use the [`sharedLockAdapterTestSuite`](https://yousif-khalil-abdulkarim.github.io/daiso-core/functions/Lock.lockAdapterTestSuite.html) function:

- Preconfigured Vitest test cases
- Standardized event bus behavior validation
- Common edge case coverage

Usage example:

```ts
// filename: MySharedLockAdapter.test.ts

import { beforeEach, describe, expect, test } from "vitest";
import { sharedLockAdapterTestSuite } from "@daiso-tech/core/shared-lock/test-utilities";
import { MemorySharedLockAdapter } from "./MemorySharedLockAdapter.js";

describe("class: MySharedLockAdapter", () => {
    sharedLockAdapterTestSuite({
        createAdapter: () => new MemorySharedLockAdapter(),
        test,
        beforeEach,
        expect,
        describe,
    });
});
```

### Implementing your custom IDatabaseSharedLockAdapter

We provide an additional contract [`IDatabaseSharedLockAdapter`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/SharedLock.IDatabaseSharedLockAdapter.html) for building custom shared-lock adapters tailored to databases.

### Testing your custom IDatabaseSharedLockAdapter

We provide a complete test suite to verify your event bus adapter implementation. Simply use the [`databaseSharedLockAdapterTestSuite`](https://yousif-khalil-abdulkarim.github.io/daiso-core/functions/SharedLock.databaseSharedLockAdapterTestSuite.html) function:

- Preconfigured Vitest test cases
- Standardized event bus behavior validation
- Common edge case coverage

Usage example:

```ts
import { beforeEach, describe, expect, test } from "vitest";
import { databaseSharedLockAdapterTestSuite } from "@daiso-tech/core/shared-lock/test-utilities";
import { MyDatabaseSharedLockAdapter } from "./MyDatabaseSharedLockAdapter.js";

describe("class: MyDatabaseSharedLockAdapter", () => {
    databaseSharedLockAdapterTestSuite({
        createAdapter: async () => {
            return new MyDatabaseSharedLockAdapter(),
        },
        test,
        beforeEach,
        expect,
        describe,
    });
});
```

### Implementing your custom ISharedLockProvider class

In some cases, you may need to implement a custom [`SharedLockProvider`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/SharedLock.SharedLockProvider.html) class to optimize performance for your specific technology stack. You can then directly implement the [`ISharedLockProvider`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/SharedLock.ISharedLockProvider.html) contract.

### Testing your custom ISharedLockProvider class

We provide a complete test suite to verify your custom event bus class implementation. Simply use the [`sharedLockProviderTestSuite`](https://yousif-khalil-abdulkarim.github.io/daiso-core/functions/SharedLock.sharedLockProviderTestSuite.html) function:

- Preconfigured Vitest test cases
- Standardized event bus behavior validation
- Common edge case coverage

Usage example:

```ts
// filename: MySharedLockProvider.test.ts

import { beforeEach, describe, expect, test } from "vitest";
import { sharedLockProviderTestSuite } from "@daiso-tech/core/shared-lock/test-utilities";
import { MySharedLockProvider } from "./MySharedLockProvider.js";

describe("class: MySharedLockProvider", () => {
    sharedLockProviderTestSuite({
        createSharedLockProvider: () => new MySharedLockProvider(),
        test,
        beforeEach,
        expect,
        describe,
    });
});
```

## Further information

For further information refer to [`@daiso-tech/core/shared-lock`](https://yousif-khalil-abdulkarim.github.io/daiso-core/modules/SharedLock.html) API docs.
