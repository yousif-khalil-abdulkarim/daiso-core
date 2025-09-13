/**
 * @module SharedLock
 */
import type { TestAPI, SuiteAPI, ExpectStatic, beforeEach } from "vitest";
import type { IDatabaseSharedLockAdapter } from "@/shared-lock/contracts/_module-exports.js";
import type { Promisable } from "@/utilities/_module-exports.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/test-utilities"`
 * @group Utilities
 */
export type DatabaseSharedLockAdapterTestSuiteSettings = {
    expect: ExpectStatic;
    test: TestAPI;
    describe: SuiteAPI;
    beforeEach: typeof beforeEach;
    createAdapter: () => Promisable<IDatabaseSharedLockAdapter>;
};

/**
 * The `databaseSharedLockAdapterTestSuite` function simplifies the process of testing your custom implementation of {@link IDatabaseSharedLockAdapter | `IDatabaseSharedLockAdapter`} with `vitest`.
 *
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/test-utilities"`
 * @group Utilities
 * @example
 * ```ts
 * import { afterEach, beforeEach, describe, expect, test } from "vitest";
 * import { databaseSharedLockAdapterTestSuite } from "@daiso-tech/core/shared-lock/test-utilities";
 * import { LibsqlSharedLockAdapter } from "@daiso-tech/core/shared-lock/adapters";
 * import { type Client, createClient } from "@libsql/client";
 *
 * describe("class: LibsqlSharedLockAdapter", () => {
 *     let client: Client;
 *     beforeEach(() => {
 *         client = createClient({
 *             url: ":memory:",
 *         });
 *     });
 *     afterEach(() => {
 *         client.close();
 *     });
 *     databaseSharedLockAdapterTestSuite({
 *         createAdapter: async () => {
 *             const lockAdapter = new LibsqlSharedLockAdapter({
 *                database: client,
 *                 tableName: "custom_table",
 *                 shouldRemoveExpiredKeys: false,
 *             });
 *             await lockAdapter.init();
 *             return lockAdapter;
 *         },
 *         test,
 *         beforeEach,
 *         expect,
 *         describe,
 *     });
 * });
 * ```
 */
export function databaseSharedLockAdapterTestSuite(
    settings: DatabaseSharedLockAdapterTestSuiteSettings,
): void {
    const { expect, test, createAdapter, describe, beforeEach } = settings;

    describe("Reusable tests:", () => {
        let adapter: IDatabaseSharedLockAdapter;
        beforeEach(async () => {
            adapter = await createAdapter();
        });
        test.todo("Write tests!!!");
    });
}
