/**
 * @module Semaphore
 */

import { UnexpectedError, type TimeSpan } from "@/utilities/_module-exports.js";
import type {
    SemaphoreAcquireSettings,
    IDatabaseSemaphoreAdapter,
    ISemaphoreAdapter,
} from "@/semaphore/contracts/_module-exports.js";

/**
 * @internal
 */
export class DatabaseSemaphoreAdapter implements ISemaphoreAdapter {
    constructor(private readonly adapter: IDatabaseSemaphoreAdapter) {}

    async acquire(settings: SemaphoreAcquireSettings): Promise<boolean> {
        const { key, slotId, ttl } = settings;
        let { limit } = settings;

        // If an error is thrown it means the semaphore already exists
        try {
            await this.adapter.insertSemaphore(key, limit);
        } catch (error: unknown) {
            if (error instanceof UnexpectedError) {
                throw error;
            }

            // If the semaphore already exists we need to retrieve the limit from the database
            // If null is returned it means the semaphore does not exists because of cleanup or manually removed
            const limit_ = await this.adapter.findLimit(key);
            if (limit_ === null) {
                return false;
            }
            limit = limit_;
        }

        // If an error is thrown it means the semaphore does not exists because of cleanup or manually removed
        try {
            const insertedRows = await this.adapter.insertSlotIfLimitNotReached(
                {
                    key,
                    slotId,
                    limit,
                    expiration: ttl?.toEndDate() ?? null,
                },
            );
            return insertedRows > 0;
        } catch (error: unknown) {
            if (error instanceof UnexpectedError) {
                throw error;
            }

            return false;
        }
    }

    async release(key: string, slotId: string): Promise<void> {
        await this.adapter.removeSlot(key, slotId);
    }

    async forceReleaseAll(key: string): Promise<void> {
        await this.adapter.removeSemaphore(key);
    }

    async refresh(
        key: string,
        slotId: string,
        ttl: TimeSpan,
    ): Promise<boolean> {
        const updatedRows = await this.adapter.updateSlotIfUnexpired(
            key,
            slotId,
            ttl.toEndDate(),
        );
        return updatedRows > 0;
    }
}
