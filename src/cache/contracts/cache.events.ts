/**
 * @module Cache
 */

import { BaseEvent } from "@/event-bus/contracts/_module";
import type { IFlexibleSerde } from "@/serde/contracts/serde.contract";
import type { TimeSpan } from "@/utilities/_module";

/**
 * @group Events
 */
export type KeyFoundCacheEventFields<TType> = {
    group: string;
    key: string;
    value: TType;
};

/**
 * @group Events
 */
export class KeyFoundCacheEvent<TType = unknown> extends BaseEvent<
    KeyFoundCacheEventFields<TType>
> {
    group!: string;
    key!: string;
    value!: TType;

    static override deserialize<TType>(
        serializedEvent: KeyFoundCacheEventFields<TType>,
    ): KeyFoundCacheEvent<TType> {
        return new KeyFoundCacheEvent(serializedEvent);
    }

    constructor(fields: KeyFoundCacheEventFields<TType>) {
        super();
        Object.assign(this, fields);
    }

    override serialize(): KeyFoundCacheEventFields<TType> {
        return {
            group: this.group,
            key: this.key,
            value: this.value,
        };
    }
}

/**
 * @group Events
 */
export type KeyNotFoundCacheEventFields = {
    group: string;
    key: string;
};

/**
 * @group Events
 */
export class KeyNotFoundCacheEvent extends BaseEvent<KeyNotFoundCacheEventFields> {
    group!: string;
    key!: string;

    static override deserialize(
        serializedEvent: KeyNotFoundCacheEventFields,
    ): KeyNotFoundCacheEvent {
        return new KeyNotFoundCacheEvent(serializedEvent);
    }

    constructor(fields: KeyNotFoundCacheEventFields) {
        super();
        Object.assign(this, fields);
    }

    override serialize(): KeyNotFoundCacheEventFields {
        return {
            group: this.group,
            key: this.key,
        };
    }
}

/**
 * @group Events
 */
export type KeyAddedCacheEventFields<TType = unknown> = {
    group: string;
    key: string;
    value: TType;
    ttl: TimeSpan | null;
};

/**
 * @group Events
 */
export class KeyAddedCacheEvent<TType = unknown> extends BaseEvent<
    KeyAddedCacheEventFields<TType>
> {
    group!: string;
    key!: string;
    value!: TType;
    ttl!: TimeSpan | null;

    static override deserialize<TType>(
        serializedEvent: KeyAddedCacheEventFields<TType>,
    ): KeyAddedCacheEvent<TType> {
        return new KeyAddedCacheEvent(serializedEvent);
    }
    constructor(fields: KeyAddedCacheEventFields<TType>) {
        super();
        Object.assign(this, fields);
    }

    override serialize(): KeyAddedCacheEventFields<TType> {
        return {
            group: this.group,
            key: this.key,
            ttl: this.ttl,
            value: this.value,
        };
    }
}

/**
 * @group Events
 */
export type KeyUpdatedCacheEventFields<TType = unknown> = {
    group: string;
    key: string;
    value: TType;
};

/**
 * @group Events
 */
export class KeyUpdatedCacheEvent<TType = unknown> extends BaseEvent<
    KeyUpdatedCacheEventFields<TType>
> {
    group!: string;
    key!: string;
    value!: TType;

    static override deserialize<TType>(
        serializedEvent: KeyUpdatedCacheEventFields<TType>,
    ): KeyUpdatedCacheEvent<TType> {
        return new KeyUpdatedCacheEvent(serializedEvent);
    }
    constructor(fields: KeyUpdatedCacheEventFields<TType>) {
        super();
        Object.assign(this, fields);
    }

    override serialize(): KeyUpdatedCacheEventFields<TType> {
        return {
            group: this.group,
            key: this.key,
            value: this.value,
        };
    }
}

/**
 * @group Events
 */
export type KeyRemovedCacheEventFields = {
    group: string;
    key: string;
};

/**
 * @group Events
 */
export class KeyRemovedCacheEvent extends BaseEvent<KeyRemovedCacheEventFields> {
    group!: string;
    key!: string;

    static override deserialize(
        serializedEvent: KeyRemovedCacheEventFields,
    ): KeyRemovedCacheEvent {
        return new KeyRemovedCacheEvent(serializedEvent);
    }
    constructor(fields: KeyRemovedCacheEventFields) {
        super();
        Object.assign(this, fields);
    }

    override serialize(): KeyRemovedCacheEventFields {
        return {
            group: this.group,
            key: this.key,
        };
    }
}

/**
 * @group Events
 */
export type KeyIncrementedCacheEventFields = {
    group: string;
    key: string;
    value: number;
};

/**
 * @group Events
 */
export class KeyIncrementedCacheEvent extends BaseEvent<KeyIncrementedCacheEventFields> {
    group!: string;
    key!: string;
    value!: number;

    static override deserialize(
        serializedEvent: KeyIncrementedCacheEventFields,
    ): KeyIncrementedCacheEvent {
        return new KeyIncrementedCacheEvent(serializedEvent);
    }
    constructor(fields: KeyIncrementedCacheEventFields) {
        super();
        Object.assign(this, fields);
    }

    override serialize(): KeyIncrementedCacheEventFields {
        return {
            group: this.group,
            key: this.key,
            value: this.value,
        };
    }
}

/**
 * @group Events
 */
export type KeyDecrementedCacheEventFields = {
    group: string;
    key: string;
    value: number;
};

/**
 * @group Events
 */
export class KeyDecrementedCacheEvent extends BaseEvent<KeyDecrementedCacheEventFields> {
    group!: string;
    key!: string;
    value!: number;

    static override deserialize(
        serializedEvent: KeyDecrementedCacheEventFields,
    ): KeyDecrementedCacheEvent {
        return new KeyDecrementedCacheEvent(serializedEvent);
    }
    constructor(fields: KeyDecrementedCacheEventFields) {
        super();
        Object.assign(this, fields);
    }

    override serialize(): KeyDecrementedCacheEventFields {
        return {
            group: this.group,
            key: this.key,
            value: this.value,
        };
    }
}

/**
 * @group Events
 */
export type KeysClearedCacheEventFields = {
    group: string;
};

/**
 * @group Events
 */
export class KeysClearedCacheEvent extends BaseEvent<KeysClearedCacheEventFields> {
    group!: string;

    static override deserialize(
        serializedEvent: KeysClearedCacheEventFields,
    ): KeysClearedCacheEvent {
        return new KeysClearedCacheEvent(serializedEvent);
    }
    constructor(fields: KeysClearedCacheEventFields) {
        super();
        Object.assign(this, fields);
    }

    override serialize(): KeysClearedCacheEventFields {
        return {
            group: this.group,
        };
    }
}

/**
 * @group Events
 */
export type CacheEvents<TType = unknown> =
    | KeyFoundCacheEvent<TType>
    | KeyNotFoundCacheEvent
    | KeyAddedCacheEvent<TType>
    | KeyUpdatedCacheEvent<TType>
    | KeyRemovedCacheEvent
    | KeyIncrementedCacheEvent
    | KeyDecrementedCacheEvent
    | KeysClearedCacheEvent;

/**
 * @group Events
 */
export function registerCacheEvents<TSerializedValue>(
    serde: IFlexibleSerde<TSerializedValue>,
): void {
    serde.registerClass(KeyFoundCacheEvent);
    serde.registerClass(KeyNotFoundCacheEvent);
    serde.registerClass(KeyAddedCacheEvent);
    serde.registerClass(KeyUpdatedCacheEvent);
    serde.registerClass(KeyRemovedCacheEvent);
    serde.registerClass(KeyIncrementedCacheEvent);
    serde.registerClass(KeyDecrementedCacheEvent);
    serde.registerClass(KeysClearedCacheEvent);
}
