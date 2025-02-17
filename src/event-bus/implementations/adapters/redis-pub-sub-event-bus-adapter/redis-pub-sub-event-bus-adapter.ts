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
    EventListener,
} from "@/event-bus/contracts/_module-exports.js";
import type { Redis } from "ioredis";
import { EventEmitter } from "node:events";
import { resolveOneOrMoreStr } from "@/utilities/_module-exports.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/implementations/adapters"```
 * @group Adapters
 */
export type RedisPubSubEventBusAdapterSettings = {
    dispatcherClient: Redis;
    listenerClient: Redis;
    serde: ISerde<string>;
    rootGroup: string;
};

/**
 * To utilize the <i>RedisPubSubEventBusAdapter</i>, you must install the <i>"ioredis"</i> package and supply a <i>{@link ISerde | ISerde<string> }</i>, with a <i>{@link SuperJsonSerdeAdapter}</i>.
 *
 * IMPORT_PATH: ```"@daiso-tech/core/event-bus/implementations/adapters"```
 * @group Adapters
 */
export class RedisPubSubEventBusAdapter implements IEventBusAdapter {
    private readonly group: string;
    private readonly baseSerde: ISerde<string>;
    private readonly redisSerde: ISerde<string>;
    private readonly dispatcherClient: Redis;
    private readonly listenerClient: Redis;
    private readonly eventEmitter = new EventEmitter();

    /**
     * @example
     * ```ts
     * import { RedisPubSubEventBusAdapter } from "@daiso-tech/core/event-bus/implementations/adapters";
     * import { Serde } from "@daiso-tech/core/serde/implementations/derivables";
     * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/implementations/adapters";
     * import Redis from "ioredis";
     *
     * const dispatcherClient = new Redis("YOUR_REDIS_CONNECTION_STRING");
     * const listenerClient = new Redis("YOUR_REDIS_CONNECTION_STRING");
     * const serde = new Serde(new SuperJsonSerdeAdapter());
     * const eventBusAdapter = new RedisPubSubEventBusAdapter({
     *   dispatcherClient,
     *   listenerClient,
     *   serde,
     *   rootGroup: "@global"
     * });
     * ```
     */
    constructor({
        dispatcherClient,
        listenerClient,
        serde,
        rootGroup,
    }: RedisPubSubEventBusAdapterSettings) {
        this.group = rootGroup;
        this.dispatcherClient = dispatcherClient;
        this.listenerClient = listenerClient;
        this.baseSerde = serde;
        this.redisSerde = new RedisSerde(serde);
    }

    getGroup(): string {
        return this.group;
    }

    withGroup(group: string): IEventBusAdapter {
        return new RedisPubSubEventBusAdapter({
            listenerClient: this.listenerClient,
            dispatcherClient: this.dispatcherClient,
            serde: this.baseSerde,
            rootGroup: resolveOneOrMoreStr([this.group, group]),
        });
    }

    private withPrefix(eventName: string): string {
        return resolveOneOrMoreStr([this.group, eventName]);
    }

    private redisListener = (channel: string, message: string): void => {
        this.eventEmitter.emit(channel, this.redisSerde.deserialize(message));
    };

    async addListener(
        eventName: string,
        listener: EventListener<BaseEvent>,
    ): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        this.eventEmitter.on(this.withPrefix(eventName), listener);

        await this.listenerClient.subscribe(this.withPrefix(eventName));

        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        this.listenerClient.on("message", this.redisListener);
    }

    async removeListener(
        eventName: string,
        listener: EventListener<BaseEvent>,
    ): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        this.eventEmitter.off(this.withPrefix(eventName), listener);

        await this.listenerClient.unsubscribe(this.withPrefix(eventName));
    }

    async dispatch(eventName: string, eventData: BaseEvent): Promise<void> {
        await this.dispatcherClient.publish(
            this.withPrefix(eventName),
            this.redisSerde.serialize(eventData),
        );
    }
}
