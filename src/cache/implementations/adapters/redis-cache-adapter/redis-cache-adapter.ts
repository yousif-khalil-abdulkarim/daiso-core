/**
 * @module Cache
 */

import { TypeCacheError } from "@/cache/contracts/cache.errors";
import { type ICacheAdapter } from "@/cache/contracts/cache-adapter.contract";
import { simplifyGroupName, type TimeSpan } from "@/utilities/_module";
import { ReplyError, type Redis, type Result } from "ioredis";
import type { ISerde } from "@/serde/contracts/_module";
import {
    RedisSerde,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type SuperJsonSerde,
} from "@/serde/implementations/_module";
import type { RedisCacheAdapterSettings } from "@/cache/implementations/adapters/redis-cache-adapter/redis-cache-adapter-settings";
import { RedisCacheAdapterSettingsBuilder } from "@/cache/implementations/adapters/redis-cache-adapter/redis-cache-adapter-settings";

/**
 * @internal
 */
class ClearIterable implements AsyncIterable<void> {
    constructor(
        private readonly client: Redis,
        private readonly pattern: string,
    ) {}

    async *[Symbol.asyncIterator](): AsyncIterator<void> {
        let coursor = 0;
        do {
            const [_coursor, elements] = await this.client.scan(
                coursor,
                "MATCH",
                this.pattern,
            );
            if (elements.length === 0) {
                return;
            }
            await this.client.del(elements);
            coursor++;
            yield undefined;
        } while (coursor !== 0);
    }
}

/**
 * @internal
 */
function escapeRedisChars(value: string): string {
    const replacements: Record<string, string> = {
        ",": "\\,",
        ".": "\\.",
        "<": "\\<",
        ">": "\\>",
        "{": "\\{",
        "}": "\\}",
        "[": "\\[",
        "]": "\\]",
        '"': '\\"',
        "'": "\\'",
        ":": "\\:",
        ";": "\\;",
        "!": "\\!",
        "@": "\\@",
        "#": "\\#",
        $: "\\$",
        "%": "\\%",
        "^": "\\^",
        "&": "\\&",
        "*": "\\*",
        "(": "\\(",
        ")": "\\)",
        "-": "\\-",
        "+": "\\+",
        "=": "\\=",
        "~": "\\~",
    };
    return value.replace(
        /,|\.|<|>|\{|\}|\[|\]|"|'|:|;|!|@|#|\$|%|\^|&|\*|\(|\)|-|\+|=|~/g,
        (chunk) => {
            const item = replacements[chunk];
            if (item === undefined) {
                throw new Error("Encounterd none existing field");
            }
            return item;
        },
    );
}

declare module "ioredis" {
    interface RedisCommander<Context> {
        daiso_cache_increment(
            key: string,
            number: string,
        ): Result<number, Context>;
    }
}

/**
 * To utilize the <i>RedisCacheAdapter</i>, you must install the <i>"ioredis"</i> package and supply a <i>{@link ISerde | ISerde<string> }</i>, such as <i>{@link SuperJsonSerde}</i>.
 * @group Adapters
 */
export class RedisCacheAdapter<TType = unknown>
    implements ICacheAdapter<TType>
{
    /**
     * @example
     * ```ts
     * import { RedisCacheAdapter, SuperJsonSerde } from "@daiso-tech/core";
     * import Redis from "ioredis";
     *
     * const cacheAdapter = new RedisCacheAdapter(
     *   RedisCacheAdapter
     *     .settings()
     *     .setDatabase(new Redis("YOUR_REDIS_CONNECTION_STRING"))
     *     .setSerde(new SuperJsonSerde())
     *     .setRootGroup("@global")
     *     .build()
     * );
     * ```
     */
    static settings<
        TSettings extends Partial<RedisCacheAdapterSettings>,
    >(): RedisCacheAdapterSettingsBuilder<TSettings> {
        return new RedisCacheAdapterSettingsBuilder();
    }

    private static isRedisTypeError(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
        value: any,
    ): boolean {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return (
            value instanceof ReplyError &&
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            value.message.includes("ERR value is not a valid float")
        );
    }

    private readonly baseSerde: ISerde<string>;
    private readonly redisSerde: ISerde<string>;
    private readonly group: string;
    private readonly database: Redis;

    /**
     * @example
     * ```ts
     * import { RedisCacheAdapter, SuperJsonSerde } from "@daiso-tech/core";
     * import Redis from "ioredis";
     *
     * const database = new Redis("YOUR_REDIS_CONNECTION_STRING");
     * const serde = new SuperJsonSerde();
     * const cacheAdapter = new RedisCacheAdapter({
     *   database,
     *   serde,
     *   rootGroup: "@global"
     * });
     * ```
     */
    constructor({ database, serde, rootGroup }: RedisCacheAdapterSettings) {
        this.database = database;
        this.group = rootGroup;
        this.baseSerde = serde;
        this.redisSerde = new RedisSerde(serde);
        this.initIncrementCommand();
    }

    private getGroupName(): string {
        return simplifyGroupName([this.group, "__KEY__"]);
    }

    private withPrefix(key: string): string {
        return simplifyGroupName([this.getGroupName(), key]);
    }

    async exists(key: string): Promise<boolean> {
        key = this.withPrefix(key);
        const result = await this.database.exists(key);
        return result > 0;
    }

    async get(key: string): Promise<TType | null> {
        key = this.withPrefix(key);
        const value = await this.database.get(key);
        if (value === null) {
            return null;
        }
        return await this.redisSerde.deserialize(value);
    }

    async add(
        key: string,
        value: TType,
        ttl: TimeSpan | null,
    ): Promise<boolean> {
        key = this.withPrefix(key);
        if (ttl === null) {
            const result = await this.database.set(
                key,
                this.redisSerde.serialize(value),
                "NX",
            );
            return result === "OK";
        }
        const result = await this.database.set(
            key,
            this.redisSerde.serialize(value),
            "PX",
            ttl.toMilliseconds(),
            "NX",
        );
        return result === "OK";
    }

    async update(key: string, value: TType): Promise<boolean> {
        key = this.withPrefix(key);
        const result = await this.database.set(
            key,
            this.redisSerde.serialize(value),
            "XX",
        );
        return result === "OK";
    }

    async put(
        key: string,
        value: TType,
        ttl: TimeSpan | null,
    ): Promise<boolean> {
        key = this.withPrefix(key);
        if (ttl === null) {
            const result = await this.database.set(
                key,
                this.redisSerde.serialize(value),
                "GET",
            );
            return result !== null;
        }
        const result = await this.database.set(
            key,
            this.redisSerde.serialize(value),
            "PX",
            ttl.toMilliseconds(),
            "GET",
        );
        return result !== null;
    }

    async remove(key: string): Promise<boolean> {
        key = this.withPrefix(key);
        const result = await this.database.del(key);
        return result === 1;
    }

    private initIncrementCommand(): void {
        if (typeof this.database.daiso_cache_increment === "function") {
            return;
        }

        this.database.defineCommand("daiso_cache_increment", {
            numberOfKeys: 1,
            lua: `
                local hasKey = redis.call("exists", KEYS[1])
        
                if hasKey == 1 then
                    redis.call("incrbyfloat", KEYS[1], tonumber(ARGV[1]))
                end
                
                return hasKey
                `,
        });
    }

    async increment(key: string, value: number): Promise<boolean> {
        try {
            key = this.withPrefix(key);
            const redisResult = await this.database.daiso_cache_increment(
                key,
                this.redisSerde.serialize(value),
            );
            const keyExists = redisResult === 1;
            return keyExists;
        } catch (error: unknown) {
            if (!RedisCacheAdapter.isRedisTypeError(error)) {
                throw error;
            }
            throw new TypeCacheError(
                `Unable to increment or decrement none number type key "${key}"`,
            );
        }
    }

    async clear(): Promise<void> {
        for await (const _ of new ClearIterable(
            this.database,
            simplifyGroupName([escapeRedisChars(this.getGroupName()), "*"]),
        )) {
            /* Empty */
        }
    }

    getGroup(): string {
        return this.group;
    }

    withGroup(group: string): ICacheAdapter<TType> {
        return new RedisCacheAdapter({
            database: this.database,
            serde: this.baseSerde,
            rootGroup: simplifyGroupName([this.group, group]),
        });
    }
}
