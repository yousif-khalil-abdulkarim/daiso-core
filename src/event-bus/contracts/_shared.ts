/**
 * @module EventBus
 */

import type { Promisable } from "@/_shared/types";

export type IBaseEvent = {
    type: string;
};
export type Listener<TEvent extends IBaseEvent> = (
    event: TEvent,
) => Promisable<void>;
