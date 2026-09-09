---
sidebar_position: 1
sidebar_label: Usage
pagination_label: TransactionContext usage
tags:
    - TransactionContext
    - Usage
    - Transactions
    - Propagation
keywords:
    - TransactionContext
    - Usage
    - Transactions
    - Propagation
    - REQUIRED
    - MANDATORY
    - SUPPORTS
    - NEVER
---

# TransactionContext usage

The `eridu-tech/transaction-context` component lets you run code inside a database transaction and access the
transaction-scoped client from anywhere in the async call stack. It is database-agnostic thanks to its
`ITransactionAdapter` abstraction and relies on the `IExecutionContext` to propagate the active transaction across
async boundaries.

## Initial configuration

To begin using the `TransactionContext` class you need three things:

1. An [`ITransactionAdapter`](/docs/components/transaction-context/configuring_transaction_context_adapters) that
   knows how to start transactions for your database (Kysely, MongoDB, ...).
2. An `IExecutionContext` instance used to propagate the active transaction. The
   `AlsExecutionContextAdapter` is recommended for real async applications.
3. A `contextToken` identifying where the transaction-scoped client is stored.

```ts
import { contextToken, ExecutionContext } from "eridu-tech/execution-context";
import { AlsExecutionContextAdapter } from "eridu-tech/execution-context/als-execution-context-adapter";
import { TransactionContext } from "eridu-tech/transaction-context";
import { KyselyTransactionAdapter } from "eridu-tech/transaction-context/kysely-transaction-adapter";
import Sqlite from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";

type Database = {
    user: {
        id: number;
        name: string;
    };
};

// An in-memory SQLite database, ideal for local development and tests.
const sqlite = new Sqlite(":memory:");
const kysely = new Kysely<Database>({
    dialect: new SqliteDialect({
        database: sqlite,
    }),
});

await kysely.schema
    .createTable("user")
    .addColumn("id", "integer", (column) => column.primaryKey())
    .addColumn("name", "varchar(255)")
    .execute();

const transactionContext = new TransactionContext<Kysely<Database>>({
    // The token under which the transaction-scoped client is stored.
    token: contextToken<Kysely<Database>>("KyselyTransactionAdapter"),

    // The adapter that starts transactions for the underlying client.
    adapter: new KyselyTransactionAdapter({ database: kysely }),

    // The execution context used to track the active transaction across scopes.
    executionContext: new ExecutionContext(new AlsExecutionContextAdapter()),
});
```

:::info
`TransactionContext` depends on the `IExecutionContext` to propagate the active transaction across async scopes. See
the [Execution Context](/docs/components/execution_context) docs for more information.
:::

## Running code inside a transaction

Use the `run` method with a propagation mode and an async invocable. The invocable runs inside the transaction scope
and the transaction is committed when it succeeds:

```ts
import { TRANSACTION_PROPAGATION } from "eridu-tech/transaction-context/contracts";

await transactionContext.run(TRANSACTION_PROPAGATION.REQUIRED, async () => {
    await transactionContext.current
        .insertInto("user")
        .values({ id: 1, name: "Alice" })
        .execute();

    // Every query started on `trx` is part of the same transaction.
});

// The transaction is committed once run() resolves.
```

If the invocable throws, the transaction is aborted and the error is propagated.

## Propagation modes

The `run` method accepts one of the following propagation modes:

| ----------- | ------------------------------------------------------------------------------ |
| Mode        | Behaviour                                                                      |
| ----------- | ------------------------------------------------------------------------------ |
| `REQUIRED`  | Uses the existing transaction if available, otherwise starts a new one         |
| `SUPPORTS`  | Uses the existing transaction if available, otherwise runs non-transactionally |
| `MANDATORY` | Requires an existing transaction, throwing an error if none exists             |
| `NEVER`     | Must run without a transaction, throwing an error if one exists                |

## Nested runs

When a `REQUIRED` run is nested inside another transaction, the existing transaction is reused instead of starting a
new one. Only the outermost run commits:

```ts
await transactionContext.run(TRANSACTION_PROPAGATION.REQUIRED, async () => {
    await transactionContext.run(TRANSACTION_PROPAGATION.REQUIRED, async () => {
        // Still inside the same transaction - no new transaction is started.
        const session = transactionContext.getTransactionOrFail();
    });
});
```

## Reading the current transaction state

The context exposes the connection state through the following members:

```ts
transactionContext.client; // The base (non-transactional) client
transactionContext.isInTransaction; // Whether a transaction is currently active
transactionContext.transaction; // The transaction-scoped client or null
transactionContext.current; // The transaction client when active, otherwise the base client
```

Inside a transaction you can fail fast on the active client:

```ts
await transactionContext.run(TRANSACTION_PROPAGATION.REQUIRED, async () => {
    const session = transactionContext.getTransactionOrFail();
});
```

:::danger
`getTransactionOrFail` throws a `MandatoryPropagationError` when no transaction is currently active. This is
equivalent to opting the surrounding code into `MANDATORY` propagation.
:::

## Errors

When a propagation mode cannot be honoured a dedicated error is thrown:

- `MandatoryPropagationError` when `MANDATORY` (or `getTransactionOrFail`) is used without an active transaction.
- `NeverPropagationError` when `NEVER` is used while a transaction is active.

Both errors can be imported from `eridu-tech/transaction-context/contracts`.

## Further information

For further information refer to
[`eridu-tech/transaction-context`](https://eridu-tech.github.io/eridu-tech-core/modules/TransactionContext.html) API
docs.
