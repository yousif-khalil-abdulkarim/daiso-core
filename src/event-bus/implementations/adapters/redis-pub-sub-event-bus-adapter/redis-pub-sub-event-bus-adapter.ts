/**
 * @module EventBus
 */

import { type ISerde } from "@/serde/contracts/_module-exports";
import {
    RedisSerde,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    SuperJsonSerdeAdapter,
} from "@/serde/implementations/adapters/_module-exports";
import type {
    BaseEvent,
    IEventBusAdapter,
    Listener,
} from "@/event-bus/contracts/_module-exports";
import type Redis from "ioredis";
import { EventEmitter } from "node:events";
import { simplifyOneOrMoreStr } from "@/utilities/_module-exports";

/**
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
     * import { RedisPubSubEventBusAdapter, SuperJsonSerde } from "@daiso-tech/core";
     * import Redis from "ioredis";
     *
     * const dispatcherClient = new Redis("YOUR_REDIS_CONNECTION_STRING");
     * const listenerClient = new Redis("YOUR_REDIS_CONNECTION_STRING");
     * const serde = new SuperJsonSerde();
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
            rootGroup: simplifyOneOrMoreStr([this.group, group]),
        });
    }

    private withPrefix(eventName: string): string {
        return simplifyOneOrMoreStr([this.group, eventName]);
    }

    private redisListener = (channel: string, message: string): void => {
        this.eventEmitter.emit(channel, this.redisSerde.deserialize(message));
    };

    async addListener(
        eventName: string,
        listener: Listener<BaseEvent>,
    ): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        this.eventEmitter.on(this.withPrefix(eventName), listener);

        await this.listenerClient.subscribe(this.withPrefix(eventName));

        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        this.listenerClient.on("message", this.redisListener);
    }

    async removeListener(
        eventName: string,
        listener: Listener<BaseEvent>,
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
