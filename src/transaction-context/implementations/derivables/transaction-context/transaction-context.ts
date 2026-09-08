/**
 * @module TransactionContext
 */

import {
    PropagationTransactionError,
    TRANSACTION_PROPAGATION,
} from "@/transaction-context/contracts/_module.js";
import { callInvocable, UnexpectedError } from "@/utilities/_module.js";

import type {
    ContextToken,
    IExecutionContext,
} from "@/execution-context/contracts/_module.js";
import type {
    ITransactionAdapter,
    ITransactionContext,
    TransactionPropagation,
} from "@/transaction-context/contracts/_module.js";
import type { AsyncLazy } from "@/utilities/_module.js";

/**
 * Configuration for the `TransactionContext` derivable.
 *
 * @typeParam TClient - The type of the base (non-transactional) client.
 * @typeParam TTransactionClient - The type of the transaction-scoped client.
 *
 * IMPORT_PATH: `"eridu-tech/transaction-context"`
 * @group Derivables
 */
export type ITransactionContextSettings<
    TClient = unknown,
    TTransactionClient = TClient,
> = {
    /**
     * The context token under which the active transaction-scoped client is
     * stored in the execution context.
     */
    token: ContextToken<TTransactionClient>;

    /**
     * The adapter used to start transactions for the underlying client.
     */
    adapter: ITransactionAdapter<TClient, TTransactionClient>;

    /**
     * The execution context used to track the active transaction across scopes.
     */
    executionContext: IExecutionContext;
};

/**
 * A derivable {@link ITransactionContext} that runs invocables inside transaction scopes.
 *
 * When `run()` is invoked while no transaction is active, a new transaction is started
 * through the configured {@link ITransactionContextSettings.adapter | adapter}, its
 * transaction-scoped client is stored in the execution context under the configured
 * token, and the transaction is committed after the invocable succeeds. Nested `run()`
 * calls reuse the already active transaction instead of starting a new one.
 *
 * @typeParam TClient - The type of the base (non-transactional) client.
 * @typeParam TTransactionClient - The type of the transaction-scoped client.
 *
 * IMPORT_PATH: `"eridu-tech/transaction-context"`
 * @group Derivables
 */
export class TransactionContext<
    TClient = unknown,
    TTransactionClient = TClient,
> implements ITransactionContext<TClient, TTransactionClient> {
    private readonly token: ContextToken<TTransactionClient>;
    private readonly adapter: ITransactionAdapter<TClient, TTransactionClient>;
    private readonly executionContext: IExecutionContext;

    constructor(
        settings: ITransactionContextSettings<TClient, TTransactionClient>,
    ) {
        const { token, adapter, executionContext } = settings;
        this.token = token;
        this.adapter = adapter;
        this.executionContext = executionContext;
    }

    get client(): TClient {
        return this.adapter.client;
    }

    get isInTransaction(): boolean {
        return this.transaction !== null;
    }

    get transaction(): TTransactionClient | null {
        return this.executionContext.get(this.token);
    }

    get current(): TClient | TTransactionClient {
        const trx = this.transaction;
        if (trx === null) {
            return this.client;
        }
        return trx;
    }

    getTransactionOrFail(): TTransactionClient {
        const trx = this.transaction;
        if (trx === null) {
            throw PropagationTransactionError.create(
                TRANSACTION_PROPAGATION.MANDATORY,
            );
        }
        return trx;
    }

    private runWithRequiredPropagation<TValue = void>(
        asyncInvocable: AsyncLazy<TValue>,
    ): Promise<TValue> {
        return this.executionContext.run(async () => {
            if (this.isInTransaction) {
                return await callInvocable(asyncInvocable);
            }
            const trx = await this.adapter.start();
            if (trx.client === null) {
                return await callInvocable(asyncInvocable);
            }

            let hasCommitFailed = false;

            try {
                this.executionContext.add(this.token, trx.client);
                const result = await callInvocable(asyncInvocable);
                try {
                    await trx.commit();
                } catch (error) {
                    hasCommitFailed = true;
                    throw error;
                }
                return result;
            } catch (error: unknown) {
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                if (hasCommitFailed) {
                    throw error;
                }
                try {
                    await trx.abort();
                } catch (abortError: unknown) {
                    throw new AggregateError(
                        [error, abortError],
                        "Transaction callback and abort both failed",
                    );
                }
                throw error;
            }
        });
    }

    private async runWithSupportsPropagation<TValue = void>(
        asyncInvocable: AsyncLazy<TValue>,
    ): Promise<TValue> {
        return callInvocable(asyncInvocable);
    }

    private runWithMandatoryPropagation<TValue = void>(
        asyncInvocable: AsyncLazy<TValue>,
    ): Promise<TValue> {
        return this.executionContext.run(async () => {
            this.getTransactionOrFail();
            return callInvocable(asyncInvocable);
        });
    }

    private runWithNeverPropagation<TValue = void>(
        asyncInvocable: AsyncLazy<TValue>,
    ): Promise<TValue> {
        return this.executionContext.run(async () => {
            if (this.isInTransaction) {
                throw PropagationTransactionError.create(
                    TRANSACTION_PROPAGATION.NEVER,
                );
            }
            return callInvocable(asyncInvocable);
        });
    }
    private internalRun<TValue = void>(
        propagation: TransactionPropagation,
        asyncInvocable: AsyncLazy<TValue>,
    ): Promise<TValue> {
        if (propagation === TRANSACTION_PROPAGATION.MANDATORY) {
            return this.runWithMandatoryPropagation(asyncInvocable);
        } else if (propagation === TRANSACTION_PROPAGATION.NEVER) {
            return this.runWithNeverPropagation(asyncInvocable);
        } else if (propagation === TRANSACTION_PROPAGATION.REQUIRED) {
            return this.runWithRequiredPropagation(asyncInvocable);
        }
        return this.runWithSupportsPropagation(asyncInvocable);
    }

    run<TValue = void>(asyncInvocable: AsyncLazy<TValue>): Promise<TValue>;
    run<TValue = void>(
        propagation: TransactionPropagation,
        asyncInvocable: AsyncLazy<TValue>,
    ): Promise<TValue>;
    run<TValue = void>(
        propagation: TransactionPropagation | AsyncLazy<TValue>,
        asyncInvocable?: AsyncLazy<TValue>,
    ): Promise<TValue> {
        if (typeof propagation === "string" && asyncInvocable !== undefined) {
            return this.internalRun(propagation, asyncInvocable);
        } else if (typeof propagation !== "string") {
            return this.internalRun(
                TRANSACTION_PROPAGATION.REQUIRED,
                propagation,
            );
        }
        throw new UnexpectedError(
            "run() was called with a propagation mode but no asyncInvocable",
        );
    }
}
