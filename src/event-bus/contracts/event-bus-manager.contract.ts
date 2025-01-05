/**
 * @module EventBus
 */

import { type Validator } from "@/utilities/_module";
import type { INamespacedEventBus } from "@/event-bus/contracts/event-bus.contract";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { IEventBusAdapter } from "@/event-bus/contracts/event-bus-adapter.contract";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { IBaseEvent } from "@/event-bus/contracts/_shared";

/**
 * The <i>IEventBusFactory</i> contract makes it easy to switch between different <i>{@link IEventBusAdapter | event adapters}</i> dynamically.
 * @group Contracts
 */
export type IEventBusFactory<
    TAdapters extends string = string,
    TEvents extends IBaseEvent = IBaseEvent,
> = {
    /**
     * @example
     * ```ts
     * import { EventBusManager, MemoryEventBusAdapter, RedisEventBusAdapter } from "@daiso-tech/core";
     * import Redis from "ioredis";
     *
     * const eventBusManager = new EventBusManager({
     *   adapters: {
     *     memory: new MemoryEventBusAdapter(),
     *     redis: new RedisEventBusAdapter({
     *       dispatcherClient: new Redis();
     *       listenerClient: new Redis();
     *     }),
     *   },
     *   defaultAdapter: "memory",
     *   rootNamespace: "@storage/"
     * });
     *
     * (async () => {
     *   // Will dispatch envent using the default adapter which is the memory addapter
     *   await eventBusManager
     *     .use()
     *     .dispatch({ type: "add", a: 1, b: 2 });
     *   // Will dispatch envent using the redis addapter
     *   await eventBusManager
     *     .use("redis")
     *     .dispatch({ type: "add", a: 1, b: 2 });
     * })();
     * ```
     */
    use(adapter?: TAdapters): INamespacedEventBus<TEvents>;
};

/**
 * The <i>IEventBusManager</i> contract makes it easy to configure and switch between different <i>{@link IEventBusAdapter | event adapters}</i> dynamically.
 * @group Contracts
 */
export type IEventBusManager<
    TAdapters extends string = string,
    TEvents extends IBaseEvent = IBaseEvent,
> = IEventBusFactory<TAdapters, TEvents> & {
    /**
     * The <i>withValidation</i> method is used to set a <i>validator</i>, which validates the event during runtime.
     * The type is inferred from the provided <i>validator</i>.
     * @example
     * ```ts
     * import { EventBusManager, MemoryEventBusAdapter, RedisEventBusAdapter, zodValidator } from "@daiso-tech/core";
     * import Redis from "ioredis";
     * import { z } from "zod"
     *
     * const eventBusManager = new EventBusManager({
     *   adapters: {
     *     memory: new MemoryEventBusAdapter(),
     *     redis: new RedisEventBusAdapter({
     *       dispatcherClient: new Redis();
     *       listenerClient: new Redis();
     *     }),
     *   },
     *   defaultAdapter: "memory",
     *   rootNamespace: "@storage/"
     * });
     *
     * (async () => {
     *   const addEventSchema = z.zod({
     *     type: z.literal("add"),
     *     a: z.number(),
     *     b: z.number(),
     *   });
     *   await eventBusManager
     *     .withValidation(zodValidator(addEventSchema))
     *     .use()
     *     // You will se an typescript error and get runtime erorr
     *     .dispatch({ type: "add" });
     * })();
     * ```
     */
    withValidation<TOutput extends TEvents = TEvents>(
        validator: Validator<TOutput>,
    ): IEventBusFactory<TAdapters, TOutput>;

    /**
     * The <i>withTypes</i> method is used to set the event types of the <i>{@link IEventBus}</i>.
     * @example
     * ```ts
     * import { EventBusManager, MemoryEventBusAdapter, RedisEventBusAdapter, zodValidator } from "@daiso-tech/core";
     * import Redis from "ioredis";
     * import { z } from "zod"
     *
     * const eventBusManager = new EventBusManager({
     *   adapters: {
     *     memory: new MemoryEventBusAdapter(),
     *     redis: new RedisEventBusAdapter({
     *       dispatcherClient: new Redis();
     *       listenerClient: new Redis();
     *     }),
     *   },
     *   defaultAdapter: "memory",
     *   rootNamespace: "@storage/"
     * });
     *
     * (async () => {
     *   type AddEvent = {
     *     type: "add";
     *     a: number;
     *     b: number;
     *   };
     *   await eventBusManager
     *     .withTypes<AddEvent>()
     *     .use()
     *     // You will se an typescript error
     *     .dispatch({ type: "add" });
     * })();
     * ```
     */
    withType<TOutput extends TEvents = TEvents>(): IEventBusFactory<
        TAdapters,
        TOutput
    >;
};
