/**
 * @module EventBus
 */

import { type ISerde } from "@/serde/contracts/_module-exports.js";
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    SuperJsonSerdeAdapter,
} from "@/serde/implementations/adapters/_module.js";
import type {
    BaseEvent,
    EventListenerFn,
    IEventBusAdapter,
} from "@/event-bus/contracts/_module-exports.js";
import type { Redis } from "ioredis";
import { EventEmitter } from "node:events";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/event-bus/adapters"`
 * @group Adapters
 */
export type RedisPubSubEventBusAdapterSettings = {
    client: Redis;
    serde: ISerde<string>;
};

/**
 * To utilize the `RedisPubSubEventBusAdapter`, you must install the [`"ioredis"`](https://www.npmjs.com/package/ioredis) package and supply a {@link ISerde | `ISerde<string>`}, with a {@link SuperJsonSerdeAdapter | `SuperJsonSerdeAdapter `}.
 *
 * IMPORT_PATH: `"@daiso-tech/core/event-bus/adapters"`
 * @group Adapters
 */
export class RedisPubSubEventBusAdapter implements IEventBusAdapter {
    private readonly serde: ISerde<string>;
    private readonly dispatcherClient: Redis;
    private readonly listenerClient: Redis;
    private readonly eventEmitter = new EventEmitter();

    /**
     *  @example
     * ```ts
     * import { RedisPubSubEventBusAdapter } from "@daiso-tech/core/event-bus/adapters";
     * import { Serde } from "@daiso-tech/core/serde";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/super-json-serde-adapter"
     * import Redis from "ioredis";
     *
     * const client = new Redis("YOUR_REDIS_CONNECTION_STRING");
     * const serde = new Serde(new SuperJsonSerdeAdapter());
     * const eventBusAdapter = new RedisPubSubEventBusAdapter({
     *   client,
     *   serde,
     * });
     * ```
     */
    constructor(settings: RedisPubSubEventBusAdapterSettings) {
        const { client, serde } = settings;
        this.dispatcherClient = client;
        this.listenerClient = client.duplicate();
        this.serde = serde;
    }

    private redisListener = (channel: string, message: string): void => {
        this.eventEmitter.emit(channel, this.serde.deserialize(message));
    };

    async addListener(
        eventName: string,
        listener: EventListenerFn<BaseEvent>,
    ): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        this.eventEmitter.on(eventName, listener);

        await this.listenerClient.subscribe(eventName);

        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        this.listenerClient.on("message", this.redisListener);
    }

    async removeListener(
        eventName: string,
        listener: EventListenerFn<BaseEvent>,
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
