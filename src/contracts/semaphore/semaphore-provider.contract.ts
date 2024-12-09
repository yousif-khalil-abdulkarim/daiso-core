/**
 * @module Semaphore
 */

import type { ISemaphore } from "@/contracts/semaphore/semaphore.contract";

export type SemaphoreSettings = {
    maxCount: number;
    timeoutInMs?: number | null;
};

export type ISemaphoreProvider = {
    semaphore(name: string, settings?: SemaphoreSettings): Promise<ISemaphore>;
};
