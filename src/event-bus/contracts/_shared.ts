/**
 * @module EventBus
 */

import type { Promisable } from "@/utilities/_module-exports";

/**
 * @group Contracts
 */
export type Listener<TEvent> = (event: TEvent) => Promisable<void>;

/**
 * @group Contracts
 */
export abstract class BaseEvent<
    TFields extends Record<string, unknown> = Record<string, unknown>,
> {
    constructor(readonly fields: TFields) {}
}
