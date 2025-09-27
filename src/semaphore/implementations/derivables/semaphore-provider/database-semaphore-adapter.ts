/**
 * @module Semaphore
 */

import type {
    SemaphoreAcquireSettings,
    IDatabaseSemaphoreAdapter,
    ISemaphoreAdapter,
    ISemaphoreAdapterState,
} from "@/semaphore/contracts/_module-exports.js";
import type { TimeSpan } from "@/time-span/implementations/_module-exports.js";

/**
 * @internal
 */
export class DatabaseSemaphoreAdapter implements ISemaphoreAdapter {
    constructor(private readonly adapter: IDatabaseSemaphoreAdapter) {}

    async acquire(settings: SemaphoreAcquireSettings): Promise<boolean> {
        return await this.adapter.transaction(async (methods) => {
            const expiration = settings.ttl?.toEndDate() ?? null;

            const semaphoreData = await methods.findSemaphore(settings.key);

            let limit = semaphoreData?.limit;
            if (limit === undefined) {
                limit = settings.limit;
                await methods.upsertSemaphore(settings.key, limit);
            }

            const slots = await methods.findSlots(settings.key);
            const unexpiredSlots = slots.filter(
                (slot) =>
                    slot.expiration === null || slot.expiration > new Date(),
            );

            if (unexpiredSlots.length === 0) {
                await methods.upsertSemaphore(settings.key, settings.limit);
            }

            if (unexpiredSlots.length >= limit) {
                return false;
            }

            const hasNotSlot = unexpiredSlots.every(
                (slot) => slot.id !== settings.slotId,
            );
            if (hasNotSlot) {
                await methods.upsertSlot(
                    settings.key,
                    settings.slotId,
                    expiration,
                );
            }

            return true;
        });
    }

    async release(key: string, slotId: string): Promise<boolean> {
        const semapahoreSlotData = await this.adapter.removeSlot(key, slotId);
        if (semapahoreSlotData === null) {
            return false;
        }
        return (
            semapahoreSlotData.expiration === null ||
            semapahoreSlotData.expiration > new Date()
        );
    }

    async forceReleaseAll(key: string): Promise<boolean> {
        const semapahoreSlotDataArray = await this.adapter.removeAllSlots(key);
        return semapahoreSlotDataArray.some((semapahoreSlotData) => {
            return (
                semapahoreSlotData.expiration === null ||
                semapahoreSlotData.expiration > new Date()
            );
        });
    }

    async refresh(
        key: string,
        slotId: string,
        ttl: TimeSpan,
    ): Promise<boolean> {
        const updateCount = await this.adapter.updateExpiration(
            key,
            slotId,
            ttl.toEndDate(),
        );
        return Number(updateCount) > 0;
    }

    async getState(key: string): Promise<ISemaphoreAdapterState | null> {
        return await this.adapter.transaction(async (trx) => {
            const semaphore = await trx.findSemaphore(key);
            if (semaphore === null) {
                return null;
            }
            const slots = await trx.findSlots(key);
            const unexpiredSlots = slots.filter(
                (slot) =>
                    slot.expiration === null || slot.expiration > new Date(),
            );
            if (unexpiredSlots.length === 0) {
                return null;
            }
            const unexpiredSlotsAsMap = new Map(
                unexpiredSlots.map(
                    (slot) => [slot.id, slot.expiration] as const,
                ),
            );
            return {
                limit: semaphore.limit,
                acquiredSlots: unexpiredSlotsAsMap,
            };
        });
    }
}
