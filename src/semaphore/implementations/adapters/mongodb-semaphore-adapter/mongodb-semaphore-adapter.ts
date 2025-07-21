/**
 * @module Semaphore
 */

import type { TimeSpan } from "@/utilities/_module-exports.js";
import {
    UnexpectedError,
    type IDeinitizable,
    type IInitizable,
} from "@/utilities/_module-exports.js";
import type {
    ISemaphoreAdapter,
    SemaphoreAcquireSettings,
} from "@/semaphore/contracts/_module-exports.js";
import type { ObjectId } from "mongodb";
import { type Document } from "mongodb";
import { type Collection, type CollectionOptions, type Db } from "mongodb";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/adapters"`
 * @group Adapters
 */
export type MongodbSemaphoreSlotSubDocument = {
    id: string;
    expiration: Date | null;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/adapters"`
 * @group Adapters
 */
export type MongodbSemaphoreDocument = {
    _id: ObjectId;
    key: string;
    limit: number;
    slots: Array<MongodbSemaphoreSlotSubDocument>;
    expiration: Date | null;
};

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/adapters"`
 * @group Adapters
 */
export type MongodbSemaphoreAdapterSettings = {
    database: Db;
    /**
     * @default "semaphore"
     */
    collectionName?: string;
    collectionSettings?: CollectionOptions;
};

/**
 * To utilize the `MongodbSemaphoreAdapter`, you must install the `"mongodb"` package.
 *
 * Note in order to use `MongodbSemaphoreAdapter` correctly, ensure you use a single, consistent database across all server instances.
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/adapters"`
 * @group Adapters
 */
export class MongodbSemaphoreAdapter
    implements ISemaphoreAdapter, IDeinitizable, IInitizable
{
    private static isSlotNotExpired = (slotId: string) => {
        return (slot: MongodbSemaphoreSlotSubDocument): boolean => {
            const hasNotExpiration = slot.expiration === null;
            const hasExpirationAndNotExpired =
                slot.expiration !== null && slot.expiration < new Date();
            return (
                slot.id === slotId &&
                (hasNotExpiration || hasExpirationAndNotExpired)
            );
        };
    };

    private readonly collection: Collection<MongodbSemaphoreDocument>;

    /**
     * @example
     * ```ts
     * import { MongodbSemaphoreAdapter } from "@daiso-tech/core/semaphore/adapters";
     * import { MongoClient } from "mongodb";
     *
     * const client = await MongoClient.connect("YOUR_MONGODB_CONNECTION_STRING");
     * const database = client.db("database");
     * const semaphoreAdapter = new MongodbSemaphoreAdapter({
     *   database
     * });
     * // You need initialize the adapter once before using it.
     * await semaphoreAdapter.init()
     * ```
     */
    constructor(settings: MongodbSemaphoreAdapterSettings) {
        const {
            collectionName = "semaphore",
            collectionSettings,
            database,
        } = settings;
        this.collection = database.collection(
            collectionName,
            collectionSettings,
        );
    }

    async init(): Promise<void> {
        try {
            await this.collection.createIndex(
                {
                    key: 1,
                },
                {
                    unique: true,
                },
            );
        } catch {
            /* Empty */
        }

        try {
            await this.collection.createIndex("expiration", {
                expireAfterSeconds: 0,
            });
        } catch {
            /* Empty */
        }
    }

    async deInit(): Promise<void> {
        try {
            await this.collection.dropIndexes();
        } catch {
            /* EMPTY */
        }

        try {
            await this.collection.drop();
        } catch {
            /* EMPTY */
        }
    }

    private initSemaphoreIfNotExistsStage(
        key: string,
        limit: number,
    ): Document {
        // Initialies the fields if they dont exist when upserting
        return {
            $set: {
                key,
                limit: {
                    $ifNull: ["$limit", limit],
                },
                slots: {
                    $ifNull: ["$limit", []],
                },
            },
        };
    }

    private removeExpiredSlotsStage(): Document {
        return {
            $set: {
                slots: {
                    // We filter all slots that are no expired
                    $filter: {
                        input: "$slots",
                        tag: "slot",
                        cond: {
                            $or: [
                                // We filter all slots that have no ttl
                                {
                                    $eq: ["$$slot.expiration", null],
                                },
                                {
                                    // We filter all slots that have ttl but are not expired
                                    $and: [
                                        {
                                            $ne: ["$$slot.expiration", null],
                                        },
                                        {
                                            $gte: [
                                                "$$slot.expiration",
                                                new Date(),
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    },
                },
            },
        };
    }

    private updateSemaphoreExpiration(): Document[] {
        return [
            {
                $set: {
                    expiration: {
                        $cond: {
                            // Check if there is at least one unexpirable slot
                            if: {
                                $in: [
                                    null,
                                    {
                                        $map: {
                                            input: "$slots",
                                            as: "slot",
                                            in: "$$slot.expiration",
                                        },
                                    },
                                ],
                            },
                            // If there are at least on expirable slot we set the expiration to null
                            then: null,
                            // If all slots are expireable we set the expiration to highest expiration
                            else: {
                                $max: "$slots.expiration",
                            },
                        },
                    },
                },
            },
            {
                $set: {
                    expiration: {
                        $cond: {
                            // Are there slots acquired
                            if: { $eq: [{ $size: "$slots" }, 0] },
                            // If there are no slots acquired we immediatley expire the semaphore
                            then: new Date(),
                            // If there are slots acquired we do nothing
                            else: "$expiration",
                        },
                    },
                },
            },
        ];
    }

    async acquire(settings: SemaphoreAcquireSettings): Promise<boolean> {
        const { key, slotId, limit, ttl } = settings;
        const semaphore = await this.collection.findOneAndUpdate(
            {
                key,
            },
            [
                this.initSemaphoreIfNotExistsStage(key, limit),
                this.removeExpiredSlotsStage(),
                {
                    $set: {
                        slots: {
                            $cond: {
                                // We check if the limit is not reached and slotId does not exist
                                if: {
                                    $and: [
                                        // We check if the limit is not reached
                                        {
                                            $lt: [
                                                {
                                                    $size: "$slots",
                                                },
                                                "$limit",
                                            ],
                                        },
                                        // We check if the slot id does not exist
                                        {
                                            $not: [
                                                {
                                                    $in: [
                                                        slotId,
                                                        // We select the ids of each element in the $slots
                                                        {
                                                            $map: {
                                                                input: "$slots",
                                                                as: "slot",
                                                                in: "$$slot.id",
                                                            },
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                    ],
                                },
                                // If the limit is not reached and slot id does not exist we append the slot
                                then: {
                                    $contactArrays: [
                                        "$slots",
                                        [
                                            {
                                                id: slotId,
                                                expiration:
                                                    ttl?.toEndDate() ?? null,
                                            } satisfies MongodbSemaphoreSlotSubDocument,
                                        ],
                                    ],
                                },
                                // If the limit is reached or slot id does exist we do nonthing
                                else: "$slots",
                            },
                        },
                    },
                },
                ...this.updateSemaphoreExpiration(),
            ],
            {
                upsert: true,
                projection: {
                    _id: 0,
                    slots: 1,
                },
                returnDocument: "after",
            },
        );

        if (semaphore === null) {
            throw new UnexpectedError("!!__MESSAGE__!!");
        }
        return semaphore.slots.some(
            MongodbSemaphoreAdapter.isSlotNotExpired(slotId),
        );
    }

    async release(key: string, slotId: string): Promise<void> {
        await this.collection.updateOne(
            {
                key,
            },
            [
                this.removeExpiredSlotsStage(),
                {
                    $set: {
                        slots: {
                            $filter: {
                                input: "$slots",
                                as: "slot",
                                cond: {
                                    $ne: ["$$slot", slotId],
                                },
                            },
                        },
                    },
                },
                ...this.updateSemaphoreExpiration(),
            ],
        );
    }

    async forceReleaseAll(key: string): Promise<void> {
        await this.collection.deleteOne({
            key,
        });
    }

    async refresh(
        key: string,
        slotId: string,
        ttl: TimeSpan,
    ): Promise<boolean> {
        const semaphore = await this.collection.findOneAndUpdate(
            {
                key,
                slots: {
                    $elemMatch: {
                        $or: [
                            // Slot that doesnt have expiration
                            {
                                id: slotId,
                                expiration: null,
                            },
                            // Slots that have expiration and is not expired
                            {
                                id: slotId,
                                expiration: {
                                    $and: [
                                        // Has expiration
                                        {
                                            expiration: {
                                                $ne: null,
                                            },
                                        },
                                        // And has not expired
                                        {
                                            expiration: {
                                                $lt: new Date(),
                                            },
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                },
            },
            [
                this.removeExpiredSlotsStage(),
                {
                    $set: {
                        slots: {
                            $map: {
                                input: "$slots",
                                as: "slot",
                                in: {
                                    $cond: {
                                        if: {
                                            $eq: ["$$slot.id", slotId],
                                        },
                                        then: {
                                            id: "$$slot.id",
                                            expiration: ttl.toEndDate(),
                                        },
                                        else: "$$slot",
                                    },
                                },
                            },
                        },
                    },
                },
                this.updateSemaphoreExpiration(),
            ],
            {
                projection: {
                    _id: 0,
                    slots: 1,
                },
                returnDocument: "after",
            },
        );

        if (semaphore === null) {
            return false;
        }
        return semaphore.slots.some(
            MongodbSemaphoreAdapter.isSlotNotExpired(slotId),
        );
    }
}
