---
sidebar_position: 2
sidebar_label: Configuring adapters
pagination_label: Configuring transaction adapters
tags:
    - TransactionContext
    - Configuring adapters
    - NoOp
    - Mongodb
    - Kysely
    - Sqlite
    - Mysql
keywords:
    - TransactionContext
    - Configuring adapters
    - NoOp
    - Mongodb
    - Kysely
    - Sqlite
    - Mysql
---

# Configuring TransactionContext adapters

A transaction adapter implements the `ITransactionAdapter` contract and is responsible for starting transactions for
an underlying client. The `TransactionContext` derivable is built on top of one of these adapters.

## NoOpTransactionAdapter

The `NoOpTransactionAdapter` provides no real transactional behaviour. Its `start()` method returns a transaction
whose `client` is `null`, and both `commit()` and `abort()` resolve immediately.

It is ideal for testing or mocking a TransactionContext without a real database:

```ts
import { NoOpTransactionAdapter } from "eridu-tech/transaction-context/no-op-transaction-adapter";

const noOpTransactionAdapter = new NoOpTransactionAdapter(client);
```

:::info
Because the started transaction has no client, `run(TRANSACTION_PROPAGATION.REQUIRED)` simply executes the invocable
without committing or aborting anything.
:::

## MongodbTransactionAdapter

To use the `MongodbTransactionAdapter`, you'll need to:

1. Install the required dependency: [`mongodb`](https://www.npmjs.com/package/mongodb) package.
2. Provide a `MongoClient` and a `Db` instance.

```ts
import { MongodbTransactionAdapter } from "eridu-tech/transaction-context/mongodb-transaction-adapter";
import { MongoClient } from "mongodb";
import { TimeSpan } from "eridu-tech/time-span";

const client = await MongoClient.connect("YOUR_MONGODB_CONNECTION_STRING");
const database = client.db("database");

const mongodbTransactionAdapter = new MongodbTransactionAdapter({
    client,
    database,

    // Optional: timeouts applied when committing or aborting a transaction.
    commitTimeout: TimeSpan.fromSeconds(30),
    abortTimeout: TimeSpan.fromSeconds(30),

    // Optional: settings forwarded to the underlying MongoDB driver.
    startSessionSettings: {},
    startTransactionSettings: {},
    endSessionSettings: {},
});
```

:::warning
MongoDB transactions require a replica set deployment. The `MongodbTransactionAdapter` starts a transaction on a new
session of the configured `MongoClient`.
:::

## KyselyTransactionAdapter

To use the `KyselyTransactionAdapter`, you'll need to:

1. Install the required dependency: [`kysely`](https://www.npmjs.com/package/kysely) package plus a driver for your
   database (`better-sqlite3`, `mysql2`, `pg`, ...).

The adapter applies an optional `accessMode` (default `"read write"`) and `isolationLevel` (default `"serializable"`)
to every transaction it starts.

### Usage with Sqlite

```ts
import { KyselyTransactionAdapter } from "eridu-tech/transaction-context/kysely-transaction-adapter";
import Sqlite from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";

const database = new Sqlite("DATABASE_NAME.db");
const kysely = new Kysely({
    dialect: new SqliteDialect({
        database,
    }),
});

const kyselyTransactionAdapter = new KyselyTransactionAdapter({
    database: kysely,
});
```

### Usage with Mysql

```ts
import { KyselyTransactionAdapter } from "eridu-tech/transaction-context/kysely-transaction-adapter";
import { Kysely, MysqlDialect } from "kysely";
import { createPool } from "mysql2";
import type { Pool } from "mysql2";

const database: Pool = createPool({
    host: "YOUR_HOST",
    port: 3306,
    database: "YOUR_DATABASE",
    user: "YOUR_USER",
    password: "YOUR_PASSWORD",
});

const kysely = new Kysely({
    dialect: new MysqlDialect({
        pool: database,
    }),
});

const kyselyTransactionAdapter = new KyselyTransactionAdapter({
    database: kysely,
    accessMode: "read only",
    isolationLevel: "read committed",
});
```

## Using the adapter with TransactionContext

The configured adapter is passed to the `TransactionContext` derivable together with an `IExecutionContext` and a token:

```ts
import { contextToken, ExecutionContext } from "eridu-tech/execution-context";
import { AlsExecutionContextAdapter } from "eridu-tech/execution-context/als-execution-context-adapter";
import { TransactionContext } from "eridu-tech/transaction-context";
import { KyselyTransactionAdapter } from "eridu-tech/transaction-context/kysely-transaction-adapter";
import type { Kysely } from "kysely";

const transactionContext = new TransactionContext<Kysely<any>, Kysely<any>>({
    token: contextToken("active-transaction"),
    adapter: kyselyTransactionAdapter,
    executionContext: new ExecutionContext(new AlsExecutionContextAdapter()),
});
```

## Further information

For further information refer to
[`eridu-tech/transaction-context`](https://eridu-tech.github.io/eridu-tech-core/modules/TransactionContext.html) API
docs.
