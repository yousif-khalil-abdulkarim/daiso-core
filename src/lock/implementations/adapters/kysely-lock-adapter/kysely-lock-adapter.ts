/**
 * @module Lock
 */

import type { IDatabaseLockAdapter, ILockData } from "@/lock/contracts/_module";
import type { Kysely } from "kysely";
import {
    type IDeinitizable,
    type IInitizable,
    TimeSpan,
} from "@/utilities/_module";
import { simplifyGroupName } from "@/utilities/_module";

/**
 * @internal
 */
type KyselyLockTable = {
    group: string;
    key: string;
    owner: string;
    // In ms since unix epoch
    expiresAt: number | null;
};

/**
 * @internal
 */
type KyselyTables = {
    lock: KyselyLockTable;
};

/**
 * @internal
 */
type KyselySettings = {
    database: Kysely<KyselyTables>;
    rootGroup: string;
    expiredKeysRemovalInterval?: TimeSpan;
    shouldRemoveExpiredKeys?: boolean;
};

/**
 * @internal
 */
export class KyselyLockAdapter
    implements IDatabaseLockAdapter, IDeinitizable, IInitizable
{
    private readonly group: string;
    private readonly database: Kysely<KyselyTables>;
    private readonly expiredKeysRemovalInterval: TimeSpan;
    private readonly shouldRemoveExpiredKeys: boolean;
    private timeoutId: string | number | NodeJS.Timeout | undefined;

    constructor(settings: KyselySettings) {
        const {
            database,
            rootGroup,
            expiredKeysRemovalInterval = TimeSpan.fromMinutes(1),
            shouldRemoveExpiredKeys = true,
        } = settings;
        this.expiredKeysRemovalInterval = expiredKeysRemovalInterval;
        this.shouldRemoveExpiredKeys = shouldRemoveExpiredKeys;
        this.database = database;
        this.group = rootGroup;
    }

    async deInit(): Promise<void> {
        await this.database.schema
            .dropIndex("lock_expiresAt")
            .ifExists()
            .on("lock")
            .execute();
        await this.database.schema.dropTable("lock").ifExists().execute();
        if (this.shouldRemoveExpiredKeys) {
            clearTimeout(this.timeoutId);
        }
    }

    async init(): Promise<void> {
        await this.database.schema
            .createTable("lock")
            .ifNotExists()
            .addColumn("group", "varchar(255)")
            .addColumn("key", "varchar(255)")
            .addColumn("owner", "varchar(255)")
            .addColumn("expiresAt", "bigint")
            .addPrimaryKeyConstraint("cache_unique_columns", ["group", "key"])
            .execute();
        await this.database.schema
            .createIndex("lock_expiresAt")
            .ifNotExists()
            .on("lock")
            .columns(["expiresAt"])
            .execute();
        if (this.shouldRemoveExpiredKeys) {
            this.timeoutId = setTimeout(() => {
                void this.removeExpiredKeys();
            }, this.expiredKeysRemovalInterval.toMilliseconds());
        }
    }

    async removeExpiredKeys(): Promise<void> {
        await this.database
            .deleteFrom("lock")
            .where("lock.expiresAt", "<=", new Date().getTime())
            .execute();
    }

    async insert(
        key: string,
        owner: string,
        expiration: Date | null,
    ): Promise<void> {
        await this.database
            .insertInto("lock")
            .values({
                key,
                owner,
                group: this.group,
                expiresAt: expiration?.getTime() ?? null,
            })
            .execute();
    }

    async update(
        key: string,
        owner: string,
        expiration: Date | null,
    ): Promise<number> {
        const updateResult = await this.database
            .updateTable("lock")
            .where("lock.key", "=", key)
            .where("lock.group", "=", this.group)
            // Has expired
            .where((eb) =>
                eb.and([
                    eb("lock.expiresAt", "is not", null),
                    eb("lock.expiresAt", "<=", Date.now()),
                ]),
            )
            .set({ owner, expiresAt: expiration?.getTime() ?? null })
            .executeTakeFirst();
        return Number(updateResult.numUpdatedRows); // > 0;
    }

    async remove(key: string, owner: string | null): Promise<void> {
        await this.database
            .deleteFrom("lock")
            .where("lock.key", "=", key)
            .where("lock.group", "=", this.group)
            .$if(owner !== null, (query) =>
                query.where("lock.owner", "=", owner),
            )
            .execute();
    }

    async refresh(
        key: string,
        owner: string,
        expiration: Date,
    ): Promise<number> {
        const updateResult = await this.database
            .updateTable("lock")
            .where("lock.key", "=", key)
            .where("lock.group", "=", this.group)
            .where("lock.owner", "=", owner)
            .set({ expiresAt: expiration.getTime() })
            .executeTakeFirst();
        return Number(updateResult.numUpdatedRows); // > 0;
    }

    async find(key: string): Promise<ILockData | null> {
        const row = await this.database
            .selectFrom("lock")
            .where("lock.key", "=", key)
            .where("lock.group", "=", this.group)
            .select(["lock.owner", "lock.expiresAt"])
            .executeTakeFirst();
        if (row === undefined) {
            return null;
        }
        return {
            expiration: row.expiresAt ? new Date(row.expiresAt) : null,
            owner: row.owner,
        };
    }

    getGroup(): string {
        return this.group;
    }

    withGroup(group: string): IDatabaseLockAdapter {
        return new KyselyLockAdapter({
            database: this.database,
            rootGroup: simplifyGroupName([this.group, group]),
        });
    }
}
