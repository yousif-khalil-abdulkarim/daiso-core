/**
 * @module Cache
 */

import { type ICacheAdapter, TypeCacheError } from "@/cache/contracts/_module";
import type { Transaction } from "kysely";
import { sql, type Kysely } from "kysely";
import { type ISerializer } from "@/serializer/contracts/_module";
import type {
    IDeinitizable,
    IInitizable,
    OneOrMore,
} from "@/utilities/_module";
import { simplifyGroupName, TimeSpan } from "@/utilities/_module";

/**
 * @internal
 */
type KyselySqliteCacheTable = {
    group: string;
    key: string;
    value: string;
    // In ms since unix epoch
    expiresAt: number | null;
};

/**
 * @internal
 */
type KyselySqliteTables = {
    cache: KyselySqliteCacheTable;
};

/**
 * @internal
 */
type KyselySqliteSettings = {
    serializer: ISerializer<string>;
    enableTransactions: boolean;
    expiredKeysRemovalInterval?: TimeSpan;
    shouldRemoveExpiredKeys?: boolean;
    rootGroup: OneOrMore<string>;
};

/**
 * @internal
 */
export class KyselySqliteCacheAdapter<TType>
    implements ICacheAdapter<TType>, IInitizable, IDeinitizable
{
    private readonly group: string;
    private readonly serializer: ISerializer<string>;
    private readonly enableTransactions: boolean;
    private readonly expiredKeysRemovalInterval: TimeSpan;
    private readonly shouldRemoveExpiredKeys: boolean;
    private timeoutId: NodeJS.Timeout | string | number | null = null;

    constructor(
        private readonly db: Kysely<KyselySqliteTables>,
        settings: KyselySqliteSettings,
    ) {
        const {
            serializer,
            enableTransactions,
            expiredKeysRemovalInterval = TimeSpan.fromMinutes(1),
            shouldRemoveExpiredKeys = true,
            rootGroup,
        } = settings;
        this.group = simplifyGroupName(rootGroup);
        this.serializer = serializer;
        this.expiredKeysRemovalInterval = expiredKeysRemovalInterval;
        this.shouldRemoveExpiredKeys = shouldRemoveExpiredKeys;
        this.enableTransactions = enableTransactions;
    }

    getGroup(): string {
        return this.group;
    }

    withGroup(group: OneOrMore<string>): ICacheAdapter<TType> {
        return new KyselySqliteCacheAdapter(this.db, {
            enableTransactions: this.enableTransactions,
            expiredKeysRemovalInterval: this.expiredKeysRemovalInterval,
            serializer: this.serializer,
            shouldRemoveExpiredKeys: this.shouldRemoveExpiredKeys,
            rootGroup: [this.group, simplifyGroupName(group)],
        });
    }

    private async withTransaction<TValue>(
        callback: (trx: Transaction<KyselySqliteTables>) => Promise<TValue>,
    ): Promise<TValue> {
        if (this.enableTransactions) {
            return await this.db.transaction().execute(callback);
        }
        return await callback(this.db as Transaction<KyselySqliteTables>);
    }

    async removeExpiredKeys(): Promise<void> {
        await this.db
            .deleteFrom("cache")
            .where("cache.expiresAt", "<=", new Date().getTime())
            .execute();
    }

    async init(): Promise<void> {
        await this.db.schema
            .createTable("cache")
            .ifNotExists()
            .addColumn("group", "text")
            .addColumn("key", "text")
            .addColumn("value", "text")
            .addColumn("expiresAt", "integer")
            .addPrimaryKeyConstraint("asd", ["group", "key"])
            .modifyEnd(sql`strict`)
            .execute();
        await this.db.schema
            .createIndex("cache_expiresAt")
            .ifNotExists()
            .on("cache")
            .columns(["expiresAt"])
            .execute();
        if (this.shouldRemoveExpiredKeys) {
            this.timeoutId = setTimeout(() => {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                this.removeExpiredKeys();
            }, this.expiredKeysRemovalInterval.toMilliseconds());
        }
    }

    async deInit(): Promise<void> {
        if (this.shouldRemoveExpiredKeys && this.timeoutId !== null) {
            clearTimeout(this.timeoutId);
        }
        await this.db.schema
            .dropIndex("cache_expiresAt")
            .ifExists()
            .on("cache")
            .execute();
        await this.db.schema.dropTable("cache").ifExists().execute();
    }

    async exists(key: string): Promise<boolean> {
        const row = await this.db
            .selectFrom("cache")
            .where("cache.key", "=", key)
            .where("cache.group", "=", this.group)
            .select(["cache.expiresAt"])
            .executeTakeFirst();
        if (row === undefined) {
            return false;
        }
        const { expiresAt } = row;
        if (expiresAt === null) {
            return true;
        }
        const hasExpired = expiresAt <= new Date().getTime();
        if (hasExpired) {
            return false;
        }
        return true;
    }

    async get(key: string): Promise<TType | null> {
        const row = await this.db
            .selectFrom("cache")
            .where("cache.key", "=", key)
            .where("cache.group", "=", this.group)
            .select(["cache.value", "cache.expiresAt"])
            .executeTakeFirst();
        if (row === undefined) {
            return null;
        }
        const { value, expiresAt } = row;
        if (expiresAt === null) {
            return await this.serializer.deserialize(value);
        }
        const hasExpired = expiresAt <= new Date().getTime();
        if (hasExpired) {
            return null;
        }
        return await this.serializer.deserialize(value);
    }

    async add(
        key: string,
        value: TType,
        ttl: TimeSpan | null,
    ): Promise<boolean> {
        const result = await this.withTransaction(async (db) => {
            const serializedValue = this.serializer.serialize(value);
            const expiresAtInsert = ttl?.toMilliseconds() ?? null;
            const prevRow = await db
                .selectFrom("cache")
                .where("cache.key", "=", key)
                .where("cache.group", "=", this.group)
                .select(["cache.expiresAt"])
                .executeTakeFirst();
            await db
                .insertInto("cache")
                .values({
                    key,
                    group: this.group,
                    value: serializedValue,
                    expiresAt: expiresAtInsert,
                })
                .onConflict((eb) =>
                    eb.columns(["key", "group"]).doUpdateSet(({ eb }) => {
                        const hasExpiration = eb.not(
                            eb("cache.expiresAt", "is", null),
                        );
                        const hasExpired = eb(
                            "cache.expiresAt",
                            "<=",
                            new Date().getTime(),
                        );
                        const hasExpirationAndExpired = eb.and([
                            hasExpiration,
                            hasExpired,
                        ]);
                        return {
                            value: eb
                                .case()
                                .when(hasExpirationAndExpired)
                                .then(serializedValue)
                                .else(eb.ref("cache.value"))
                                .end(),
                            expiresAt: eb
                                .case()
                                .when(hasExpirationAndExpired)
                                .then(expiresAtInsert)
                                .else(eb.ref("cache.expiresAt"))
                                .end(),
                        };
                    }),
                )
                .execute();
            if (prevRow === undefined) {
                return true;
            }
            const { expiresAt } = prevRow;
            if (expiresAt === null) {
                return false;
            }
            const hasExpired = expiresAt <= new Date().getTime();
            return hasExpired;
        });
        return result;
    }

    async update(key: string, value: TType): Promise<boolean> {
        return await this.withTransaction(async (db) => {
            const serializedValue = this.serializer.serialize(value);
            const prevRow = await db
                .selectFrom("cache")
                .where("cache.key", "=", key)
                .where("cache.group", "=", this.group)
                .select(["cache.expiresAt"])
                .executeTakeFirst();
            await db
                .updateTable("cache")
                .where("cache.key", "=", key)
                .where("cache.group", "=", this.group)
                .where((eb) => {
                    const hasNoExpiration = eb("cache.expiresAt", "is", null);
                    const hasExpiration = eb.not(
                        eb("cache.expiresAt", "is", null),
                    );
                    const hasNotExpired = eb(
                        "cache.expiresAt",
                        "<=",
                        new Date().getTime(),
                    );
                    return eb.or([
                        hasNoExpiration,
                        eb.and([hasExpiration, hasNotExpired]),
                    ]);
                })
                .set({
                    key,
                    value: serializedValue,
                })
                .executeTakeFirst();
            if (prevRow === undefined) {
                return false;
            }
            const { expiresAt } = prevRow;
            if (expiresAt === null) {
                return true;
            }
            const hasExpired = expiresAt <= new Date().getTime();
            return !hasExpired;
        });
    }

    async put(
        key: string,
        value: TType,
        ttl: TimeSpan | null,
    ): Promise<boolean> {
        return await this.withTransaction(async (db) => {
            const resovledTtl = ttl?.toMilliseconds() ?? null;
            const prevRow = await db
                .selectFrom("cache")
                .where("cache.key", "=", key)
                .where("cache.group", "=", this.group)
                .select(["cache.expiresAt"])
                .executeTakeFirst();
            const serializedValue = this.serializer.serialize(value);
            await db
                .insertInto("cache")
                .values({
                    key,
                    group: this.group,
                    value: serializedValue,
                    expiresAt: resovledTtl,
                })
                .onConflict((cb) =>
                    cb.columns(["key", "group"]).doUpdateSet({
                        key,
                        value: serializedValue,
                        expiresAt: resovledTtl,
                    }),
                )
                .executeTakeFirst();
            if (prevRow === undefined) {
                return false;
            }
            const { expiresAt } = prevRow;
            if (expiresAt === null) {
                return true;
            }
            const hasExpired = expiresAt <= new Date().getTime();
            return !hasExpired;
        });
    }

    async remove(key: string): Promise<boolean> {
        const row = await this.db
            .deleteFrom("cache")
            .where("cache.key", "=", key)
            .where("cache.group", "=", this.group)
            .returning("cache.expiresAt")
            .executeTakeFirst();
        if (row === undefined) {
            return false;
        }
        const { expiresAt } = row;
        if (expiresAt === null) {
            return true;
        }
        const hasExpired = expiresAt <= new Date().getTime();
        return !hasExpired;
    }

    async increment(key: string, value: number): Promise<boolean> {
        return await this.withTransaction(async (db) => {
            const prevRow = await db
                .selectFrom("cache")
                .where("cache.key", "=", key)
                .where("cache.group", "=", this.group)
                .select(["cache.expiresAt"])
                .executeTakeFirst();
            const sqlResult = await db
                .updateTable("cache")
                .where("cache.key", "=", key)
                .where("cache.group", "=", this.group)
                .where((eb) => {
                    const hasNoExpiration = eb("cache.expiresAt", "is", null);
                    const hasExpiration = eb.not(
                        eb("cache.expiresAt", "is", null),
                    );
                    const hasNotExpired = eb(
                        "cache.expiresAt",
                        "<=",
                        new Date().getTime(),
                    );
                    return eb.or([
                        hasNoExpiration,
                        eb.and([hasExpiration, hasNotExpired]),
                    ]);
                })
                .set("value", (eb) => {
                    const jsonRootValue = sql`typeof(${eb.ref("cache.value")} ->> '$')`;
                    const isNumber = eb.or([
                        eb(jsonRootValue, "=", "real"),
                        eb(jsonRootValue, "=", "integer"),
                    ]);
                    const incrementJsonRootIfNumber = eb
                        .case()
                        .when(isNumber)
                        .then(sql`${eb.ref("cache.value")} ->> '$' + ${value}`)
                        .else(sql`${eb.ref("cache.value")} ->> '$'`)
                        .end();
                    return sql`json_set(${eb.ref("cache.value")}, '$', ${incrementJsonRootIfNumber})`;
                })
                .returning((eb) => {
                    const jsonRootValue = sql`typeof(${eb.ref("cache.value")} ->> '$')`;
                    const isNumber = eb.or([
                        eb(jsonRootValue, "=", "real"),
                        eb(jsonRootValue, "=", "integer"),
                    ]);
                    return isNumber.as("isNumber");
                })
                .executeTakeFirst();

            const isTypeError = Number(sqlResult?.isNumber.valueOf()) === 0;
            if (isTypeError) {
                throw new TypeCacheError(
                    `Unable to increment or decrement none number type key "${key}"`,
                );
            }

            if (prevRow === undefined) {
                return false;
            }
            const { expiresAt } = prevRow;
            if (expiresAt === null) {
                return true;
            }
            const hasExpired = expiresAt <= new Date().getTime();
            return !hasExpired;
        });
    }

    async clear(): Promise<void> {
        await this.db
            .deleteFrom("cache")
            .where("cache.group", "=", this.group)
            .execute();
    }
}
