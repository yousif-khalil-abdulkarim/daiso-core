/**
 * @module Semaphore
 */

import type { ISemaphoreAdapter } from "@/contracts/semaphore/semaphore-adapter.contract";

export type ISemaphoreProviderAdapter = {
    semaphore(name: string, maxCount: number): Promise<ISemaphoreAdapter>;
};
