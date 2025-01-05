/**
 * @module EventBus
 */

import { type Validator } from "@/utilities/_module";
import type {
    INamespacedEventBus,
    IEventBusAdapter,
    IEventBusManager,
    IBaseEvent,
    IEventBusFactory,
} from "@/event-bus/contracts/_module";
import { EventBus } from "@/event-bus/implementations/event-bus/event-bus";

/**
 * @group Derivables
 */
export type EventBusManagerSettings<TAdapters extends string = string> = {
    adapters: Record<TAdapters, IEventBusAdapter>;
    defaultAdapter: NoInfer<TAdapters>;
    rootNamespace: string;
};

/**
 * @group Derivables
 */
export class EventBusManager<
    TAdapters extends string = string,
    TEvent extends IBaseEvent = IBaseEvent,
> implements IEventBusManager<TAdapters>
{
    private readonly adapters: Record<TAdapters, IEventBusAdapter>;
    private readonly defaultAdapter: TAdapters;
    private readonly rootNamespace: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private validator: Validator<any> = (value) => value;

    constructor(settings: EventBusManagerSettings<TAdapters>) {
        const { adapters, defaultAdapter, rootNamespace } = settings;
        this.adapters = adapters;
        this.defaultAdapter = defaultAdapter;
        this.rootNamespace = rootNamespace;
    }

    use(adapter: TAdapters = this.defaultAdapter): INamespacedEventBus<TEvent> {
        return new EventBus(this.adapters[adapter], {
            rootNamespace: this.rootNamespace,
            validator: this.validator,
        });
    }

    withValidation<TOutput extends IBaseEvent = IBaseEvent>(
        validator: Validator<TOutput>,
    ): IEventBusFactory<TAdapters, TOutput> {
        this.validator = validator;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
        return this as any;
    }

    withType<TOutput extends IBaseEvent = IBaseEvent>(): IEventBusFactory<
        TAdapters,
        TOutput
    > {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
        return this as any;
    }
}
