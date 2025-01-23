/**
 * @module EventBus
 */
import type {
    IFlexibleSerde,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ISerde,
    SerializableClass,
} from "@/serde/contracts/_module";

/**
 * This <i>NoOpSerde</i> will do nothing and is used for easily mocking {@link IFlexibleSerde} or {@link ISerde} for testing.
 * @group Adapters
 */
export class NoOpSerde implements IFlexibleSerde {
    serialize<TValue>(value: TValue): unknown {
        return value;
    }

    deserialize<TValue>(serializedValue: unknown): TValue {
        return serializedValue as TValue;
    }

    registerClass<TSerializedValue>(
        _class: SerializableClass<TSerializedValue>,
    ): void {}
}
