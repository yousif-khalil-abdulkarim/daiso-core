/**
 * @module Storage
 */

import type {
    KeysAddedStorageEvent,
    KeysRemovedStorageEvent,
    KeysUpdatedStorageEvent,
    StorageEvent,
} from "@/storage/contracts/_module";
import {
    STORAGE_EVENTS,
    type IStorageAdapter,
    type AllStorageEvents,
    type KeysFoundStorageEvent,
    type KeysNotFoundStorageEvent,
} from "@/storage/contracts/_module";
import {
    UnexpectedEventBusError,
    type IEventBus,
} from "@/event-bus/contracts/_module";
import type { WithNamespaceStorageAdapter } from "@/storage/implementations/storage/with-namespace-storage-adapter";
import { isArrayEmpty, isObjectEmpty } from "@/_shared/utilities";

/**
 * @internal
 */
export class WithEventStorageAdapter<TType>
    implements Required<Omit<IStorageAdapter<TType>, "clear">>
{
    constructor(
        private readonly withNamespaceStorageAdapter: WithNamespaceStorageAdapter<TType>,
        private readonly eventBus: IEventBus<AllStorageEvents<TType>>,
        private readonly eventAttributes: StorageEvent,
    ) {}

    private async triggerGetManyEvents(
        result: Record<string, TType | null>,
    ): Promise<void> {
        const keysNotFoundEvent: KeysNotFoundStorageEvent = {
            ...this.eventAttributes,
            type: STORAGE_EVENTS.KEYS_NOT_FOUND,
            keys: [],
        };
        const keysFoundEvent: KeysFoundStorageEvent<TType> = {
            ...this.eventAttributes,
            type: STORAGE_EVENTS.KEYS_FOUND,
            values: {},
        };
        for (const key in result) {
            const value = result[key];
            if (value === undefined) {
                throw new UnexpectedEventBusError(
                    `Destructed field "key" is undefined`,
                );
            }
            if (value === null) {
                keysNotFoundEvent.keys.push(key);
            } else {
                keysFoundEvent.values[key] = value;
            }
        }
        const events: AllStorageEvents<TType>[] = [];
        if (!isArrayEmpty(keysNotFoundEvent.keys)) {
            events.push(keysNotFoundEvent);
        }
        if (!isObjectEmpty(keysFoundEvent.values)) {
            events.push(keysFoundEvent);
        }
        await this.eventBus.dispatch(events);
    }

    async getMany<TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, TType | null>> {
        const result = await this.withNamespaceStorageAdapter.getMany(keys);

        await this.triggerGetManyEvents(result);

        return result;
    }

    private async triggerAddManyEvents(
        values: Record<string, TType>,
        result: Record<string, boolean>,
    ): Promise<void> {
        const keysAddedEvent: KeysAddedStorageEvent<TType> = {
            ...this.eventAttributes,
            type: STORAGE_EVENTS.KEYS_ADDED,
            values: {},
        };
        for (const key in result) {
            const value = values[key];
            if (value === undefined) {
                throw new UnexpectedEventBusError(
                    `Destructed field "key" is undefined`,
                );
            }
            const hasAdded = result[key];
            if (hasAdded) {
                keysAddedEvent.values[key] = value;
            }
        }
        if (!isObjectEmpty(keysAddedEvent.values)) {
            await this.eventBus.dispatch([keysAddedEvent]);
        }
    }

    async addMany<TKeys extends string>(
        values: Record<TKeys, TType>,
    ): Promise<Record<TKeys, boolean>> {
        const result = await this.withNamespaceStorageAdapter.addMany(values);
        await this.triggerAddManyEvents(values, result);
        return result;
    }

    private async triggerUpdateManyEvents(
        values: Record<string, TType>,
        result: Record<string, boolean>,
    ): Promise<void> {
        const keysUpdatedEvent: KeysUpdatedStorageEvent<TType> = {
            ...this.eventAttributes,
            type: STORAGE_EVENTS.KEYS_UPDATED,
            values: {},
        };
        const keysNotFoundEvent: KeysNotFoundStorageEvent = {
            ...this.eventAttributes,
            type: STORAGE_EVENTS.KEYS_NOT_FOUND,
            keys: [],
        };
        for (const key in result) {
            const value = values[key];
            if (value === undefined) {
                throw new UnexpectedEventBusError(
                    `Destructed field "key" is undefined`,
                );
            }
            const { [key]: keysExists } = result;
            if (keysExists) {
                keysUpdatedEvent.values[key] = value;
            } else {
                keysNotFoundEvent.keys.push(key);
            }
        }
        const events: AllStorageEvents<TType>[] = [];
        if (!isObjectEmpty(keysUpdatedEvent.values)) {
            events.push(keysUpdatedEvent);
        }
        if (!isArrayEmpty(keysNotFoundEvent.keys)) {
            events.push(keysNotFoundEvent);
        }
        await this.eventBus.dispatch(events);
    }

    async updateMany<TKeys extends string>(
        values: Record<TKeys, TType>,
    ): Promise<Record<TKeys, boolean>> {
        const result =
            await this.withNamespaceStorageAdapter.updateMany(values);

        await this.triggerUpdateManyEvents(values, result);

        return result;
    }

    private async triggerPutManyEvents(
        values: Record<string, TType>,
        result: Record<string, boolean>,
    ): Promise<void> {
        const keysUpdatedEvent: KeysUpdatedStorageEvent<TType> = {
            ...this.eventAttributes,
            type: STORAGE_EVENTS.KEYS_UPDATED,
            values: {},
        };
        const keysAddedEvent: KeysAddedStorageEvent<TType> = {
            ...this.eventAttributes,
            type: STORAGE_EVENTS.KEYS_ADDED,
            values: {},
        };
        for (const key in result) {
            const value = values[key];
            if (value === undefined) {
                throw new UnexpectedEventBusError(
                    `Destructed field "key" is undefined`,
                );
            }
            const keyExists = result[key];
            if (keyExists) {
                keysUpdatedEvent.values[key] = value;
            } else {
                keysAddedEvent.values[key] = value;
            }
        }
        const events: AllStorageEvents<TType>[] = [];
        if (!isObjectEmpty(keysUpdatedEvent.values)) {
            events.push(keysUpdatedEvent);
        }
        if (!isObjectEmpty(keysAddedEvent.values)) {
            events.push(keysAddedEvent);
        }
        await this.eventBus.dispatch(events);
    }

    async putMany<TKeys extends string>(
        values: Record<TKeys, TType>,
    ): Promise<Record<TKeys, boolean>> {
        const result = await this.withNamespaceStorageAdapter.putMany(values);

        await this.triggerPutManyEvents(values, result);

        return result;
    }

    private async triggerRemoveManyEvents(
        result: Record<string, boolean>,
    ): Promise<void> {
        const keysRemovedEvent: KeysRemovedStorageEvent = {
            ...this.eventAttributes,
            type: STORAGE_EVENTS.KEYS_REMOVED,
            keys: [],
        };
        const keysNotFoundEvent: KeysNotFoundStorageEvent = {
            ...this.eventAttributes,
            type: STORAGE_EVENTS.KEYS_NOT_FOUND,
            keys: [],
        };
        for (const key in result) {
            const { [key]: keysExists } = result;
            if (keysExists === undefined) {
                throw new UnexpectedEventBusError(
                    `Destructed field "key" is undefined`,
                );
            }
            if (keysExists) {
                keysRemovedEvent.keys.push(key);
            } else {
                keysNotFoundEvent.keys.push(key);
            }
        }
        const events: AllStorageEvents<TType>[] = [];
        if (!isArrayEmpty(keysRemovedEvent.keys)) {
            events.push(keysRemovedEvent);
        }
        if (!isArrayEmpty(keysNotFoundEvent.keys)) {
            events.push(keysNotFoundEvent);
        }
        await this.eventBus.dispatch(events);
    }

    async removeMany<TKeys extends string>(
        keys: TKeys[],
    ): Promise<Record<TKeys, boolean>> {
        const result = await this.withNamespaceStorageAdapter.removeMany(keys);

        await this.triggerRemoveManyEvents(result);

        return result;
    }

    private async triggerIncrementEvents(
        key: string,
        value: number,
        keyExists: boolean,
    ): Promise<void> {
        if (keyExists) {
            await this.eventBus.dispatch([
                {
                    ...this.eventAttributes,
                    type: STORAGE_EVENTS.KEY_INCREMENTED,
                    key,
                    value,
                },
            ]);
        } else {
            await this.eventBus.dispatch([
                {
                    ...this.eventAttributes,
                    type: STORAGE_EVENTS.KEYS_NOT_FOUND,
                    keys: [key],
                },
            ]);
        }
    }

    private async triggerDecrementEvents(
        key: string,
        value: number,
        keyExists: boolean,
    ): Promise<void> {
        if (keyExists) {
            await this.eventBus.dispatch([
                {
                    ...this.eventAttributes,
                    type: STORAGE_EVENTS.KEY_DECREMENTED,
                    key,
                    value,
                },
            ]);
        } else {
            await this.eventBus.dispatch([
                {
                    ...this.eventAttributes,
                    type: STORAGE_EVENTS.KEYS_NOT_FOUND,
                    keys: [key],
                },
            ]);
        }
    }

    async increment(key: string, value: number): Promise<boolean> {
        const keyExists = await this.withNamespaceStorageAdapter.increment(
            key,
            value,
        );

        if (value > 0) {
            await this.triggerIncrementEvents(key, value, keyExists);
        } else if (value < 0) {
            await this.triggerDecrementEvents(key, value, keyExists);
        }

        return keyExists;
    }

    private async triggerClearEvents(): Promise<void> {
        await this.eventBus.dispatch({
            ...this.eventAttributes,
            type: STORAGE_EVENTS.KEYS_CLEARED,
        });
    }

    async clear(): Promise<void> {
        await this.withNamespaceStorageAdapter.clear();
        await this.triggerClearEvents();
    }
}
