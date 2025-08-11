/**
 * @module Semaphore
 */
import {
    type TestAPI,
    type SuiteAPI,
    type ExpectStatic,
    type beforeEach,
} from "vitest";
import { type IDatabaseSemaphoreAdapter } from "@/semaphore/contracts/_module-exports.js";
import { type Promisable } from "@/utilities/_module-exports.js";
import type { TimeSpan } from "@/utilities/_module-exports.js";
import { LazyPromise } from "@/async/_module-exports.js";

/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/test-utilities"`
 * @group Utilities
 */
export type DatabaseSemaphoreAdapterTestSuiteSettings = {
    expect: ExpectStatic;
    test: TestAPI;
    describe: SuiteAPI;
    beforeEach: typeof beforeEach;
    createAdapter: () => Promisable<IDatabaseSemaphoreAdapter>;
};

/**
 * The `databaseSemaphoreAdapterTestSuite` function simplifies the process of testing your custom implementation of {@link IDatabaseSemaphoreAdapter | `IDatabaseSemaphoreAdapter`} with `vitest`.
 *
 * IMPORT_PATH: `"@daiso-tech/core/semaphore/test-utilities"`
 * @group Utilities
 * @example
 * ```ts
 * import { afterEach, beforeEach, describe, expect, test } from "vitest";
 * import { databaseSemaphoreAdapterTestSuite } from "@daiso-tech/core/semaphore/test-utilities";
 * import { LibsqlSemaphoreAdapter } from "@daiso-tech/core/semaphore/adapters";
 * import { type Client, createClient } from "@libsql/client";
 *
 * describe("class: LibsqlSemaphoreAdapter", () => {
 *     let client: Client;
 *     beforeEach(() => {
 *         client = createClient({
 *             url: ":memory:",
 *         });
 *     });
 *     afterEach(() => {
 *         client.close();
 *     });
 *     databaseSemaphoreAdapterTestSuite({
 *         createAdapter: async () => {
 *             const semaphoreAdapter = new LibsqlSemaphoreAdapter({
 *                database: client,
 *                 tableName: "custom_table",
 *                 shouldRemoveExpiredKeys: false,
 *             });
 *             await semaphoreAdapter.init();
 *             return semaphoreAdapter;
 *         },
 *         test,
 *         beforeEach,
 *         expect,
 *         describe,
 *     });
 * });
 * ```
 */
export function databaseSemaphoreAdapterTestSuite(
    settings: DatabaseSemaphoreAdapterTestSuiteSettings,
): void {
    const { expect, test, createAdapter, describe, beforeEach } = settings;
    let adapter: IDatabaseSemaphoreAdapter;
    beforeEach(async () => {
        adapter = await createAdapter();
    });

    async function delay(time: TimeSpan): Promise<void> {
        await LazyPromise.delay(time);
    }

    test.todo("Write tests!!!");
}
