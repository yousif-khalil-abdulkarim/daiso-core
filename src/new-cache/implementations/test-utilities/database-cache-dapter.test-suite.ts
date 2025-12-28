/**
 * @module Cache
 */

import {
    type TestAPI,
    type SuiteAPI,
    type ExpectStatic,
    type beforeEach,
} from "vitest";
import {
    type ICacheData,
    type ICacheDataExpiration,
    type ICacheInsert,
    type ICacheUpdate,
    type IDatabaseCacheAdapter,
} from "@/cache/contracts/_module.js";
import { type Promisable } from "@/utilities/_module.js";
import { TimeSpan } from "@/time-span/implementations/_module.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/test-utilities"`
 * @group TestUtilities
 */
export type DatabaseCacheAdapterTestSuiteSettings = {
    expect: ExpectStatic;
    test: TestAPI;
    describe: SuiteAPI;
    beforeEach: typeof beforeEach;
    createAdapter: () => Promisable<IDatabaseCacheAdapter>;
};

/**
 * The `databaseCacheAdapterTestSuite` function simplifies the process of testing your custom implementation of {@link IDatabaseCacheAdapter | `IDatabaseCacheAdapter`} with `vitest`.
 *
 * IMPORT_PATH: `"@daiso-tech/core/cache/test-utilities"`
 * @group TestUtilities
 * @example
 * ```ts
 * import { afterEach, beforeEach, describe, expect, test } from "vitest";
 * import Sqlite, { type Database } from "better-sqlite3";
 * import { databaseCacheAdapterTestSuite } from "@daiso-tech/core/cache/test-utilities";
 * import { KyselyCacheAdapter, type KyselyCacheAdapterTables } from "@daiso-tech/core/cache/kysely-cache-adapter";
 * import { Serde } from "@daiso-tech/core/serde";
 * import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/super-json-serde-adapter";
 * import { Kysely, SqliteDialect } from "kysely";
 *
 * describe("class: KyselyCacheAdapter", () => {
 *   let database: Database;
 *   let kysely: Kysely<KyselyCacheAdapterTables>;
 *
 *   beforeEach(() => {
 *       database = new Sqlite(":memory:");
 *       kysely = new Kysely({
 *          dialect: new SqliteDialect({
 *              database,
 *          }),
 *       });
 *   });
 *   afterEach(() => {
 *       database.close();
 *   });
 *   databaseCacheAdapterTestSuite({
 *       createAdapter: async () => {
 *           const adapter = new KyselyCacheAdapter({
 *               kysely,
 *               shouldRemoveExpiredKeys: false,
 *               serde: new Serde(new SuperJsonSerdeAdapter()),
 *           });
 *           await adapter.init();
 *           return adapter;
 *       },
 *       test,
 *       beforeEach,
 *       expect,
 *       describe,
 *    });
 * });
 * ```
 */
export function databaseCacheAdapterTestSuite(
    settings: DatabaseCacheAdapterTestSuiteSettings,
): void {
    const { expect, test, createAdapter, describe, beforeEach } = settings;
    let adapter: IDatabaseCacheAdapter<any>;
    beforeEach(async () => {
        adapter = await createAdapter();
    });

    describe("Reusable tests:", () => {
        test.todo("Write tests!!!");
    });
}
