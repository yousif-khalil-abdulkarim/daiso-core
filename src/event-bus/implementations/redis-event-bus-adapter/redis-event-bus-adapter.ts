/**
 * @module EventBus
 */

import { type ISerializer } from "@/serializer/contracts/_module";
import {
    RedisSerializer,
    SuperJsonSerializer,
} from "@/serializer/implementations/_module";
import type {
    IBaseEvent,
    IEventBusAdapter,
    Listener,
} from "@/event-bus/contracts/_module";
import type Redis from "ioredis";
import { LazyPromise } from "@/utilities/_module";
import { EventEmitter } from "node:events";

/**
 * @group Adapters
 */
export type RedisEventBusAdapterSettings = {
    dispatcherClient: Redis;
    listenerClient: Redis;
    serializer?: ISerializer<string>;
};

/**
 * @group Adapters
 */
export class RedisEventBusAdapter implements IEventBusAdapter {
    private readonly serializer: ISerializer<string>;
    private readonly dispatcherClient: Redis;
    private readonly listenerClient: Redis;
    private readonly eventEmitter = new EventEmitter();

    constructor({
        dispatcherClient,
        listenerClient,
        serializer = new SuperJsonSerializer(),
    }: RedisEventBusAdapterSettings) {
        this.dispatcherClient = dispatcherClient;
        this.listenerClient = listenerClient;
        this.serializer = new RedisSerializer(serializer);
    }

    private redisListener = async (channel: string, message: string) => {
        this.eventEmitter.emit(
            channel,
            await this.serializer.deserialize(message),
        );
    };

    async addListener(
        event: string,
        listener: Listener<IBaseEvent>,
    ): Promise<void> {
        await this.listenerClient.subscribe(event);

        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        this.listenerClient.on("message", this.redisListener);

        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        this.eventEmitter.on(event, listener);
    }

    async removeListener(
        event: string,
        listener: Listener<IBaseEvent>,
    ): Promise<void> {
        await this.listenerClient.unsubscribe(event);
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        this.eventEmitter.off(event, listener);

        let totalListenerCount = 0;
        for (const event of this.eventEmitter.eventNames()) {
            totalListenerCount += this.eventEmitter.listenerCount(event);
        }

        if (totalListenerCount === 0) {
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            this.listenerClient.off("message", this.redisListener);
        }
    }

    async dispatch(events: IBaseEvent[]): Promise<void> {
        const promises: PromiseLike<number>[] = [];
        for (const event of events) {
            promises.push(
                new LazyPromise(async () =>
                    this.dispatcherClient.publish(
                        event.type,
                        await this.serializer.serialize(event),
                    ),
                ),
            );
        }
        await Promise.all(promises);
    }
}
