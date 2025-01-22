/**
 * @module EventBus
 */

import { type ISerializer } from "@/serializer/contracts/_module";
import { RedisSerializer } from "@/serializer/implementations/_module";
import type {
    IBaseEvent,
    IEventBusAdapter,
    Listener,
} from "@/event-bus/contracts/_module";
import type Redis from "ioredis";
import { EventEmitter } from "node:events";
import type { OneOrMore } from "@/utilities/_module";
import { simplifyGroupName } from "@/utilities/_module";

/**
 * @group Adapters
 */
export type RedisPubSubEventBusAdapterSettings = {
    dispatcherClient: Redis;
    listenerClient: Redis;
    serializer: ISerializer<string>;
    rootGroup: OneOrMore<string>;
};

/**
 * To utilize the <i>RedisPubSubEventBusAdapter</i>, you must install the <i>"ioredis"</i> package and supply a <i>{@link ISerializer | string serializer}</i>, such as <i>{@link SuperJsonSerializer}</i>.
 * @group Adapters
 * @example
 * ```ts
 * import { RedisPubSubEventBusAdapter, SuperJsonSerializer } from "@daiso-tech/core";
 * import Redis from "ioredis";
 *
 * const dispatcherClient = new Redis("YOUR_REDIS_CONNECTION_STRING");
 * const listenerClient = new Redis("YOUR_REDIS_CONNECTION_STRING");
 * const serializer = new SuperJsonSerializer();
 * const eventBusAdapter = new RedisPubSubEventBusAdapter({
 *   dispatcherClient,
 *   listenerClient,
 *   serializer,
 * });
 * ```
 */
export class RedisPubSubEventBusAdapter implements IEventBusAdapter {
    private readonly group: string;
    private readonly serializer: ISerializer<string>;
    private readonly redisSerializer: ISerializer<string>;
    private readonly dispatcherClient: Redis;
    private readonly listenerClient: Redis;
    private readonly eventEmitter = new EventEmitter();

    constructor({
        dispatcherClient,
        listenerClient,
        serializer,
        rootGroup,
    }: RedisPubSubEventBusAdapterSettings) {
        this.group = simplifyGroupName(rootGroup);
        this.dispatcherClient = dispatcherClient;
        this.listenerClient = listenerClient;
        this.serializer = serializer;
        this.redisSerializer = new RedisSerializer(serializer);
    }

    getGroup(): string {
        return this.group;
    }

    withGroup(group: OneOrMore<string>): IEventBusAdapter {
        return new RedisPubSubEventBusAdapter({
            listenerClient: this.listenerClient,
            dispatcherClient: this.dispatcherClient,
            serializer: this.serializer,
            rootGroup: [this.group, simplifyGroupName(group)],
        });
    }

    private withPrefix(eventName: string): string {
        return simplifyGroupName([this.group, eventName]);
    }

    private redisListener = (channel: string, message: string): void => {
        this.eventEmitter.emit(
            channel,
            this.redisSerializer.deserialize(message),
        );
    };

    async addListener(
        eventName: string,
        listener: Listener<IBaseEvent>,
    ): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        this.eventEmitter.on(this.withPrefix(eventName), listener);

        await this.listenerClient.subscribe(this.withPrefix(eventName));

        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        this.listenerClient.on("message", this.redisListener);
    }

    async removeListener(
        eventName: string,
        listener: Listener<IBaseEvent>,
    ): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        this.eventEmitter.off(this.withPrefix(eventName), listener);

        await this.listenerClient.unsubscribe(this.withPrefix(eventName));
    }

    async dispatch(event: IBaseEvent): Promise<void> {
        await this.dispatcherClient.publish(
            this.withPrefix(event.type),
            this.redisSerializer.serialize(event),
        );
    }
}
