/**
 * @module EventBus
 */

import { type ISerde } from "@/serde/contracts/_module";
import {
    RedisSerde,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    SuperJsonSerde,
} from "@/serde/implementations/_module";
import type {
    BaseEvent,
    IEventBusAdapter,
    Listener,
} from "@/event-bus/contracts/_module";
import type Redis from "ioredis";
import { EventEmitter } from "node:events";
import type { OneOrMore } from "@/utilities/_module";
import { simplifyGroupName } from "@/utilities/_module";
import type { RedisPubSubEventBusAdapterSettings } from "@/event-bus/implementations/adapters/redis-pub-sub-event-bus-adapter/redis-pub-sub-event-bus-adapter-settings";
import { RedisPubSubEventBusAdapterSettingsBuilder } from "@/event-bus/implementations/adapters/redis-pub-sub-event-bus-adapter/redis-pub-sub-event-bus-adapter-settings";

/**
 * To utilize the <i>RedisPubSubEventBusAdapter</i>, you must install the <i>"ioredis"</i> package and supply a <i>{@link ISerde | ISerde<string> }</i>, such as <i>{@link SuperJsonSerde}</i>.
 * @group Adapters
 */
export class RedisPubSubEventBusAdapter implements IEventBusAdapter {
    /**
     * @example
     * ```ts
     * import { RedisPubSubEventBusAdapter, SuperJsonSerde } from "@daiso-tech/core";
     * import Redis from "ioredis";
     *
     * const cacheAdapter = new RedisPubSubEventBusAdapter(
     *   RedisPubSubEventBusAdapter
     *     .settings()
     *     .setDispatcherClient(new Redis("YOUR REDIS CONNECTION"))
     *     .setListenerClient(new Redis("YOUR REDIS CONNECTION"))
     *     .setSerde(new SuperJsonSerde())
     *     .setRootGroup("@global")
     *     .build()
     * );
     * ```
     */
    static settings<
        TSettings extends Partial<RedisPubSubEventBusAdapterSettings>,
    >(): RedisPubSubEventBusAdapterSettingsBuilder<TSettings> {
        return new RedisPubSubEventBusAdapterSettingsBuilder();
    }

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
        this.group = simplifyGroupName(rootGroup);
        this.dispatcherClient = dispatcherClient;
        this.listenerClient = listenerClient;
        this.baseSerde = serde;
        this.redisSerde = new RedisSerde(serde);
    }

    getGroup(): string {
        return this.group;
    }

    withGroup(group: OneOrMore<string>): IEventBusAdapter {
        return new RedisPubSubEventBusAdapter({
            listenerClient: this.listenerClient,
            dispatcherClient: this.dispatcherClient,
            serde: this.baseSerde,
            rootGroup: [this.group, simplifyGroupName(group)],
        });
    }

    private withPrefix(eventName: string): string {
        return simplifyGroupName([this.group, eventName]);
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
