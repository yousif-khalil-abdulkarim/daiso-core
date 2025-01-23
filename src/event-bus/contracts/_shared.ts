/**
 * @module EventBus
 */

import type { ISerializable } from "@/serde/contracts/_module";
import type { Promisable } from "@/utilities/_module";

/**
 * @group Contracts
 */
export type Listener<TEvent> = (event: TEvent) => Promisable<void>;

/**
 * @group Contracts
 */
export abstract class BaseEvent<
    TData extends Record<string, unknown> = Record<string, unknown>,
> implements ISerializable<TData>
{
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    static deserialize(_serializedEvent: any): BaseEvent {
        throw new Error("Method must be implemented!");
    }

    abstract serialize(): TData;
}
