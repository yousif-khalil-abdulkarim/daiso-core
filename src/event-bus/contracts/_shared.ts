/**
 * @module EventBus
 */

import type { Promisable } from "@/utilities/_module-exports.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/contracts"```
 * @group Contracts
 */
export type EventListenerFn<TEvent> = (event: TEvent) => Promisable<void>;

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/contracts"```
 * @group Contracts
 */
export abstract class BaseEvent<
    TFields extends Record<string, unknown> = Record<string, unknown>,
> {
    constructor(readonly fields: TFields) {}
}
