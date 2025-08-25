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
 * Note this event is only dispatched when the semaphore slot is released and not when the semaphore slot expired.
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/contracts"`
 * @group Events
 */
export type ReleasedSemaphoreEvent = {
    key: string;
    slotId: string;
    limit?: number;
    availableSlots?: number;
    unavailableSlots?: number;
};

/**
 * The event is dispatched when all slot of semapahore are released.
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/contracts"`
 * @group Events
 */
export type AllForceReleasedSemaphoreEvent = {
    key: string;
    slotIds?: string[];
    limit?: number;
    availableSlots?: number;
    unavailableSlots?: number;
};

/**
 * The error is dispatched when trying to referesh a semaphore slot that is already expired.
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/contracts"`
 * @group Events
 */
export type UnsuccessfulRefreshSemaphoreEvent = {
    key: string;
    limit?: number;
    availableSlots?: number;
    unavailableSlots?: number;
};

/**
 * The error is dispatched when trying to release a semaphore slot that is already expired.
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/contracts"`
 * @group Events
 */
export type UnsuccessfulReleaseSemaphoreEvent = {
    key: string;
    limit?: number;
    availableSlots?: number;
    unavailableSlots?: number;
};

/**
 * The event is dispatched when trying to acquire a semaphore slot when all slots are unavailable.
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/contracts"`
 * @group Events
 */
export type LimitReachedSemaphoreEvent = {
    key: string;
    limit?: number;
    availableSlots?: number;
    unavailableSlots?: number;
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
    limit?: number;
    availableSlots?: number;
    unavailableSlots?: number;
    ttl: TimeSpan;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/contracts"`
 * @group Events
 */
export type UnexpectedErrorSemaphoreEvent = {
    key: string;
    limit?: number;
    availableSlots?: number;
    unavailableSlots?: number;
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
    ALL_FORCE_RELEASED: "ALL_FORCE_RELEASED",
    UNSUCCESSFUL_RELEASE: "UNSUCCESSFUL_RELEASE",
    UNSUCCESSFUL_REFRESH: "UNSUCCESSFUL_REFRESH",
    LIMIT_REACHED: "LIMIT_REACHED",
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
    [SEMAPHORE_EVENTS.ALL_FORCE_RELEASED]: AllForceReleasedSemaphoreEvent;
    [SEMAPHORE_EVENTS.UNSUCCESSFUL_RELEASE]: UnsuccessfulReleaseSemaphoreEvent;
    [SEMAPHORE_EVENTS.UNSUCCESSFUL_REFRESH]: UnsuccessfulRefreshSemaphoreEvent;
    [SEMAPHORE_EVENTS.LIMIT_REACHED]: LimitReachedSemaphoreEvent;
    [SEMAPHORE_EVENTS.REFRESHED]: RefreshedSemaphoreEvent;
    [SEMAPHORE_EVENTS.UNEXPECTED_ERROR]: UnexpectedErrorSemaphoreEvent;
};
