/**
 * @module EventBus
 */

import type { Promisable } from "@/_shared/types";

export type Listener<TEvent> = (event: TEvent) => Promisable<void>;
