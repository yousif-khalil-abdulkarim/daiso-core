/**
 * @module Semaphore
 */

import type { IInitizable } from "@/_shared/types";

export type ISemaphoreAdapter = IInitizable & {
    getMaxCount(): Promise<number>;
    getName(): Promise<string>;
    acquire(timeInMs: number | null): Promise<boolean>;
    release(): Promise<void>;
};
