/**
 * @module Serde
 */

import {
    type ISerdeTransformerAdapter,
    type IFlexibleSerdeAdapter,
    DeserializationSerdeError,
    SerializationSerdeError,
} from "@/serde/contracts/_module-exports.js";
import { SuperJSON } from "superjson-cjs";

/**
 *
 * IMPORT_PATH: ```"@daiso-tech/core/serde/adapters"```
 * @group Adapters
 */
export class SuperJsonSerdeAdapter implements IFlexibleSerdeAdapter<string> {
    private readonly superJson: SuperJSON = new SuperJSON();

    registerCustom<TCustomSerialized, TCustomDeserialized>(
        transformer: ISerdeTransformerAdapter<
            TCustomSerialized,
            TCustomDeserialized
        >,
    ): void {
        this.superJson.registerCustom<TCustomSerialized, any>(
            {
                isApplicable(value) {
                    return transformer.isApplicable(value);
                },
                serialize(deserializedValue) {
                    return transformer.serialize(deserializedValue);
                },
                deserialize(serializedValue) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                    return transformer.deserialize(serializedValue);
                },
            },
            transformer.name,
        );
    }

    serialize<TValue>(value: TValue): string {
        try {
            return this.superJson.stringify(value);
        } catch (error: unknown) {
            throw new SerializationSerdeError(
                `Serialization error "${String(error)}" occured`,
                error,
            );
        }
    }

    deserialize<TValue>(value: string): TValue {
        try {
            return this.superJson.parse(value);
        } catch (error: unknown) {
            throw new DeserializationSerdeError(
                `Deserialization error "${String(error)}" occured`,
                error,
            );
        }
    }
}
