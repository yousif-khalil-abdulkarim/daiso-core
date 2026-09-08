---
sidebar_position: 3
sidebar_label: Creating adapters
pagination_label: Creating transaction adapters
tags:
    - TransactionContext
    - Creating adapters
keywords:
    - TransactionContext
    - Creating adapters
    - ITransactionAdapter
    - ITransaction
---

# Creating TransactionContext adapters

## Implementing your custom ITransactionAdapter

In order to create an adapter you need to implement the
[`ITransactionAdapter`](https://eridu-tech.github.io/eridu-tech-core/modules/TransactionContext.html) contract. An
adapter exposes the base client and starts new transactions:

```ts
import type {
    ITransaction,
    ITransactionAdapter,
} from "eridu-tech/transaction-context/contracts";

type Client = {
    // Your database client methods...
    run(sql: string): Promise<unknown>;
};

export class MyTransactionAdapter implements ITransactionAdapter<Client> {
    constructor(readonly client: Client) {}

    start(): Promise<ITransaction<Client>> {
        // Start a transaction and return an ITransaction wrapping it.
        throw new Error("Not implemented");
    }
}
```

## Implementing your custom ITransaction

A started transaction is represented by an
[`ITransaction`](https://eridu-tech.github.io/eridu-tech-core/modules/TransactionContext.html). It provides the
transaction-scoped client together with `commit()` and `abort()` used to finalize the transaction:

```ts
import type { ITransaction } from "eridu-tech/transaction-context/contracts";

type Client = {
    begin(): Promise<void>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
    run(sql: string): Promise<unknown>;
};

export class MyTransaction implements ITransaction<Client> {
    constructor(readonly client: Client) {}

    async commit(): Promise<void> {
        await this.client.commit();
    }

    async abort(): Promise<void> {
        await this.client.rollback();
    }
}
```

## A complete custom adapter example

The following adapter assumes an underlying client that manages a transaction-bound connection. `start()` begins a new
transaction and returns an `ITransaction` that commits or aborts it:

```ts
import type {
    ITransaction,
    ITransactionAdapter,
} from "eridu-tech/transaction-context/contracts";

type Client = {
    // The base (non-transactional) client.
    beginTransaction(): Promise<{
        commit: () => Promise<void>;
        rollback: () => Promise<void>;
    }>;
    query(sql: string, client?: unknown): Promise<unknown>;
};

export class MyDatabaseTransactionAdapter implements ITransactionAdapter<Client> {
    constructor(readonly client: Client) {}

    async start(): Promise<ITransaction<Client>> {
        const transaction = await this.client.beginTransaction();

        return {
            // The transaction-scoped client to use for queries inside the transaction.
            client: this.client,

            commit: () => transaction.commit(),
            abort: () => transaction.rollback(),
        };
    }
}
```

:::info
When your technology cannot support real transactions (for example in mocked scenarios), return a transaction whose
`client` is `null`. `TransactionContext` will then run the invocable without committing or aborting anything, exactly
like the built-in `NoOpTransactionAdapter`.
:::

## Further information

For further information refer to
[`eridu-tech/transaction-context`](https://eridu-tech.github.io/eridu-tech-core/modules/TransactionContext.html) API
docs.
