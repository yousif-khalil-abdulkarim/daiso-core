---
sidebar_position: 4
sidebar_label: Middlewares
pagination_label: TransactionContext middlewares
tags:
    - TransactionContext
    - Middlewares
    - AOP
keywords:
    - TransactionContext
    - Middlewares
    - AOP
    - withTransactionFactory
---

# TransactionContext middlewares

## withTransactionFactory middleware

The `withTransactionFactory` middleware lets you wrap a function so that it runs inside a transaction scope. When the
wrapped function is invoked, the middleware calls `transactionContext.run()` with the requested propagation mode and
`next` as the invocable, so the function executes within a transaction.

By default the middleware uses `TRANSACTION_PROPAGATION.REQUIRED`, meaning it joins an existing transaction when one is
active and starts a new one otherwise.

### Usage

```ts
import { use } from "eridu-tech/middleware";
import { withTransactionFactory } from "eridu-tech/transaction-context/middlewares";
import { TransactionContext } from "eridu-tech/transaction-context";
import { TRANSACTION_PROPAGATION } from "eridu-tech/transaction-context/contracts";
import { contextToken, ExecutionContext } from "eridu-tech/execution-context";
import { AlsExecutionContextAdapter } from "eridu-tech/execution-context/als-execution-context-adapter";
import { MongodbTransactionAdapter } from "eridu-tech/transaction-context/mongodb-transaction-adapter";
import { MongoClient } from "mongodb";

const client = await MongoClient.connect("YOUR_MONGODB_CONNECTION_STRING");
const database = client.db("database");

const transactionContext = new TransactionContext({
    token: contextToken("MongodbTransactionAdapter"),
    adapter: new MongodbTransactionAdapter({ client, database }),
    executionContext: new ExecutionContext(new AlsExecutionContextAdapter()),
});

const withTransaction = withTransactionFactory(transactionContext);

const createUser = async (name: string): Promise<void> => {
    // The transaction-scoped client is available here.
    const session = transactionContext.getTransactionOrFail();
    await database.collection("users").insertOne({ name }, { session });
};

// Wrap with a transaction (defaults to REQUIRED propagation)
const createUserInTransaction = use(createUser, withTransaction());

await createUserInTransaction("Alice"); // Runs and commits inside a transaction
```

### Configuring the propagation mode

You can pass a specific propagation mode to the middleware factory. For example, to require an already active
transaction:

```ts
const createUserInTransaction = use(
    createUser,
    withTransaction(TRANSACTION_PROPAGATION.MANDATORY),
);

// Throws PropagationTransactionError when no transaction is currently active.
await createUserInTransaction("Alice");
```

### Nested middleware runs

When the wrapped function calls other transaction-wrapped functions, nested `REQUIRED` runs reuse the active
transaction instead of starting a new one:

```ts
const updateProfile = use(
    async (name: string): Promise<void> => {
        await createUserInTransaction(name); // Reuses the active transaction
    },
    withTransaction(), // REQUIRED by default
);

await updateProfile("Alice");
```

:::info
For more information about the `use` function and composing middlewares, see the
[Middleware](/docs/components/middleware) documentation.
:::

## Further information

For further information refer to
[`eridu-tech/transaction-context`](https://eridu-tech.github.io/eridu-tech-core/modules/TransactionContext.html) API
docs.
