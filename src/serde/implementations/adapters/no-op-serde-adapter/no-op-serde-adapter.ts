/**
 * @module Serde
 */
import type {
    IFlexibleSerdeAdapter,
    ISerdeTransformerAdapter,
} from "@/serde/contracts/_module-exports.js";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/serde/adapters"```
 * @group Adapters
 */
export class NoOpSerdeAdapter<TSerializedValue>
    implements IFlexibleSerdeAdapter<TSerializedValue>
{
    serialize<TValue>(value: TValue): TSerializedValue {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return value as any;
    }

    deserialize<TValue>(serializedValue: TSerializedValue): TValue {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return serializedValue as any;
    }

    registerCustom<TCustomSerialized, TCustomDeserialized>(
        _transformer: ISerdeTransformerAdapter<
            TCustomSerialized,
            TCustomDeserialized
        >,
    ): void {}
}
