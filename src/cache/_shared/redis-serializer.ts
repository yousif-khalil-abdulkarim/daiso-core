/**
 * @module Cache
 */
import { stringify, parse } from "superjson";
import { type ISerializer } from "@/contracts/serializer/_module";

/**
 * @internal
 */
export class RedisSerializer implements ISerializer<string> {
    // eslint-disable-next-line @typescript-eslint/require-await
    async serialize<TValue>(value: TValue): Promise<string> {
        if (
            typeof value === "number" &&
            !Number.isNaN(value) &&
            isFinite(value)
        ) {
            return String(value);
        }
        return stringify(value);
    }
    async deserialize<TValue>(value: string): Promise<TValue> {
        const isNumberRegex = /^(-?([0-9]+)(\.[0-5]+)?)$/g;
        if (isNumberRegex.test(value)) {
            return Number(value) as TValue;
        }
        return await parse(value);
    }
}
