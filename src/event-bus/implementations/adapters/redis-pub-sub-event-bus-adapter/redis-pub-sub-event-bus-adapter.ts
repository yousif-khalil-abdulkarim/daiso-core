/**
 * @module EventBus
 */

import { type ISerde } from "@/serde/contracts/_module-exports.js";
import {
    RedisSerde,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    SuperJsonSerdeAdapter,
} from "@/serde/implementations/adapters/_module-exports.js";
import type {
    BaseEvent,
    IEventBusAdapter,
} from "@/event-bus/contracts/_module-exports.js";
import type { Redis } from "ioredis";
import { EventEmitter } from "node:events";
import { type InvokableFn } from "@/utilities/_module-exports.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/implementations/adapters"```
 * @group Adapters
 */
export type RedisPubSubEventBusAdapterSettings = {
    dispatcherClient: Redis;
    listenerClient: Redis;
    serde: ISerde<string>;
};

/**
 * To utilize the <i>RedisPubSubEventBusAdapter</i>, you must install the <i>"ioredis"</i> package and supply a <i>{@link ISerde | ISerde<string> }</i>, with a <i>{@link SuperJsonSerdeAdapter}</i>.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/implementations/adapters"```
 * @group Adapters
 */
export class RedisPubSubEventBusAdapter implements IEventBusAdapter {
    private readonly serde: ISerde<string>;
    private readonly dispatcherClient: Redis;
    private readonly listenerClient: Redis;
    private readonly eventEmitter = new EventEmitter();

    constructor({
        dispatcherClient,
        listenerClient,
        serde,
    }: RedisPubSubEventBusAdapterSettings) {
        this.dispatcherClient = dispatcherClient;
        this.listenerClient = listenerClient;
        this.serde = new RedisSerde(serde);
    }

    private redisListener = (channel: string, message: string): void => {
        this.eventEmitter.emit(channel, this.serde.deserialize(message));
    };

    async addListener(
        eventName: string,
        listener: InvokableFn<BaseEvent>,
    ): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        this.eventEmitter.on(eventName, listener);

        await this.listenerClient.subscribe(eventName);

        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        this.listenerClient.on("message", this.redisListener);
    }

    async removeListener(
        eventName: string,
        listener: InvokableFn<BaseEvent>,
    ): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        this.eventEmitter.off(eventName, listener);

        await this.listenerClient.unsubscribe(eventName);
    }

    async dispatch(eventName: string, eventData: BaseEvent): Promise<void> {
        await this.dispatcherClient.publish(
            eventName,
            this.serde.serialize(eventData),
        );
    }
}
