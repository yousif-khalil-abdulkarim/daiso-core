/**
 * @module Semaphore
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars

import type { TimeSpan } from "@/utilities/_module-exports.js";

/**
 * The event is dispatched when a semaphore slot is aquired.
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/contracts"`
 * @group Events
 */
export type AcquiredSemaphoreEvent = {
    key: string;
    slotId: string;
    limit: number;
    availableSlots: number;
    unavailableSlots: number;
    ttl: TimeSpan | null;
};

/**
 * The event is dispatched when a semaphore slot is released.
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/contracts"`
 * @group Events
 */
export type ReleasedSemaphoreEvent = {
    key: string;
    slotId: string;
    limit: number;
    availableSlots: number;
    unavailableSlots: number;
};

/**
 * The event is dispatched when all slot of semapahore are released.
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/contracts"`
 * @group Events
 */
export type AllReleasedSemaphoreEvent = {
    key: string;
    slotIds: string[];
    limit: number;
    availableSlots: number;
    unavailableSlots: number;
};

/**
 * The error is dispatched when trying to referesh a semaphore slot that is already expired.
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/contracts"`
 * @group Events
 */
export type ExpiredRefreshTrySemaphoreEvent = {
    key: string;
    limit: number;
    availableSlots: number;
    unavailableSlots: number;
};

/**
 * The event is dispatched when trying to acquire a semaphore slot when all slots are unavailable.
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/contracts"`
 * @group Events
 */
export type UnavailableSlotsSemaphoreEvent = {
    key: string;
    limit: number;
    availableSlots: number;
    unavailableSlots: number;
};

/**
 * The event is dispatched when a semaphore slot is refreshed.
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/contracts"`
 * @group Events
 */
export type RefreshedSemaphoreEvent = {
    key: string;
    slotId: string;
    limit: number;
    availableSlots: number;
    unavailableSlots: number;
    ttl: TimeSpan;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/contracts"`
 * @group Events
 */
export type UnexpectedErrorSemaphoreEvent = {
    key: string;
    limit: number;
    availableSlots: number;
    unavailableSlots: number;
    ttl: TimeSpan | null;
    error: unknown;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/contracts"`
 * @group Events
 */
export const SEMAPHORE_EVENTS = {
    ACQUIRED: "ACQUIRED",
    RELEASED: "RELEASED",
    ALL_RELEASED: "ALL_RELEASED",
    EXPIRED_RELEASE_TRY: "EXPIRED_RELEASE_TRY",
    EXPIRED_REFRESH_TRY: "EXPIRED_REFRESH_TRY",
    UNAVAILABLE_SLOTS: "UNAVAILABLE_SLOTS",
    FORCE_RELEASED: "FORCE_RELEASED",
    REFRESHED: "REFRESHED",
    UNEXPECTED_ERROR: "UNEXPECTED_ERROR",
} as const;

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/contracts"`
 * @group Events
 */
export type SemaphoreEventMap = {
    [SEMAPHORE_EVENTS.ACQUIRED]: AcquiredSemaphoreEvent;
    [SEMAPHORE_EVENTS.RELEASED]: ReleasedSemaphoreEvent;
    [SEMAPHORE_EVENTS.ALL_RELEASED]: AllReleasedSemaphoreEvent;
    [SEMAPHORE_EVENTS.EXPIRED_REFRESH_TRY]: ExpiredRefreshTrySemaphoreEvent;
    [SEMAPHORE_EVENTS.UNAVAILABLE_SLOTS]: UnavailableSlotsSemaphoreEvent;
    [SEMAPHORE_EVENTS.REFRESHED]: RefreshedSemaphoreEvent;
    [SEMAPHORE_EVENTS.UNEXPECTED_ERROR]: UnexpectedErrorSemaphoreEvent;
};
