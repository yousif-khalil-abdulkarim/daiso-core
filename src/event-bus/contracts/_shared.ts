/**
 * @module EventBus
 */

import type { InvokableFn } from "@/utilities/_module-exports.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/contracts"```
 * @group Contracts
 */
export type EventListenerFn<TEvent> = InvokableFn<TEvent, void>;

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
