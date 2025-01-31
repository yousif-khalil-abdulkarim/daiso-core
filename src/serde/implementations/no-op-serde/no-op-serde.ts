/**
 * @module EventBus
 */
import type {
    SerializableEventClass,
    IFlexibleSerde,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ISerde,
    ISerdeTransformer,
    SerializableClass,
} from "@/serde/contracts/_module";

/**
 * This <i>NoOpSerde</i> will do nothing and is used for easily mocking {@link IFlexibleSerde} or {@link ISerde} for testing.
 * @group Adapters
 */
export class NoOpSerde<TSerializedValue>
    implements IFlexibleSerde<TSerializedValue>
{
    registerEvent<TFields extends Record<string, unknown>>(
        _eventClass: SerializableEventClass<TFields>,
    ): IFlexibleSerde<TSerializedValue> {
        return this;
    }

    serialize<TValue>(value: TValue): TSerializedValue {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return value as any;
    }

    deserialize<TValue>(serializedValue: TSerializedValue): TValue {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return serializedValue as any;
    }

    registerClass<TSerializedClassInstance>(
        _class: SerializableClass<TSerializedClassInstance>,
    ): IFlexibleSerde<TSerializedValue> {
        return this;
    }

    registerCustom<TCustomSerialized, TCustomDeserialized>(
        _transformer: ISerdeTransformer<TCustomSerialized, TCustomDeserialized>,
    ): IFlexibleSerde<TSerializedValue> {
        return this;
    }
}
