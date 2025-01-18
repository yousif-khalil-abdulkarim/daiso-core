/**
 * @module EventBus
 */

import type { Promisable } from "@/utilities/_module";

export type Listener<TEvent> = (event: TEvent) => Promisable<void>;
