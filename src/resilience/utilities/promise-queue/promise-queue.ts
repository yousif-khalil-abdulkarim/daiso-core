/**
 * @module Resilience
 */

import {
    type InvokableFn,
    type Promisable,
    type Result,
} from "@/utilities/_module-exports.js";
import { Task } from "@/task/_module-exports.js";
import { v4 } from "uuid";
import { CapacityFullResilienceError } from "@/resilience/async.errors.js";
import type { ITimeSpan } from "@/time-span/contracts/_module-exports.js";

/**
 * @internal
 */
class Queue<TValue> {
    private readonly array: TValue[] = [];

    size(): number {
        return this.array.length;
    }

    enqueue(value: TValue): void {
        this.array.push(value);
    }

    dequeue(): TValue | null {
        return this.array.shift() ?? null;
    }
}

/**
 * @internal
 */
type PromiseQueueItem<TValue> = {
    id: string;
    func: InvokableFn<[signal: AbortSignal], Promisable<TValue>>;
    signal: AbortSignal;
};

/**
 * @internal
 */
type PromiseQueueListener<TValue> = InvokableFn<[result: Result<TValue>]>;

/**
 * @internal
 */
export type PromiseQueueSettings = {
    maxConcurrency: number;
    maxCapacity: number | null;
    interval: ITimeSpan;
};

/**
 * @internal
 */
export class PromiseQueue {
    private readonly queue = new Queue<PromiseQueueItem<unknown>>();

    private readonly listeners = new Map<string, PromiseQueueListener<any>>();

    constructor(private readonly settings: PromiseQueueSettings) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.start();
    }

    private async start(): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-constant-condition
        while (true) {
            await Promise.all(
                this.getItems().map((item) => this.process(item)),
            );
            await Task.delay(this.settings.interval);
        }
    }

    private getItems<TValue>(): PromiseQueueItem<TValue>[] {
        const values: PromiseQueueItem<TValue>[] = [];
        for (let i = 0; i < this.settings.maxConcurrency; i++) {
            const item =
                this.queue.dequeue() as PromiseQueueItem<TValue> | null;
            if (item === null) {
                continue;
            }
            values.push(item);
        }
        return values;
    }

    private async process<TValue>(
        item: PromiseQueueItem<TValue>,
    ): Promise<void> {
        const listener = this.listeners.get(item.id);

        try {
            if (item.signal.aborted) {
                listener?.({
                    type: "failure",
                    error: item.signal.reason,
                });
                return;
            }
            const value = await item.func(item.signal);
            listener?.({
                type: "success",
                value,
            });
        } catch (error: unknown) {
            listener?.({
                type: "failure",
                error,
            });

            throw error;
        }
    }

    private enqueue<TValue>(
        func: InvokableFn<[signal: AbortSignal], Promisable<TValue>>,
        signal: AbortSignal,
    ): string {
        const id = v4();
        if (this.settings.maxCapacity === null) {
            this.queue.enqueue({
                id,
                func,
                signal,
            });
        } else if (this.queue.size() <= this.settings.maxCapacity) {
            this.queue.enqueue({ id, func, signal });
        } else {
            throw new CapacityFullResilienceError(
                `Max capacity reached, ${String(this.settings.maxCapacity)} items allowed.`,
            );
        }
        return id;
    }

    private listenOnce<TValue>(
        id: string,
        listener: PromiseQueueListener<TValue>,
    ): void {
        this.listeners.set(id, listener);
    }

    private asPromise<TValue>(id: string): Promise<TValue> {
        return new Promise<TValue>((resolve, reject) => {
            this.listenOnce(id, (result) => {
                if (result.type === "failure") {
                    // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
                    reject(result.error);
                    return;
                } else {
                    resolve(result.value as TValue);
                }
            });
        });
    }

    /**
     * @throws {CapacityFullResilienceError} {@link CapacityFullResilienceError}
     */
    add<TValue>(
        func: InvokableFn<[signal: AbortSignal], Promisable<TValue>>,
        signal: AbortSignal,
    ): Promise<TValue> {
        return this.asPromise(this.enqueue(func, signal));
    }
}
