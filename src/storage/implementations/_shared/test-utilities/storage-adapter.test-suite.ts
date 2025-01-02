/**
 * @module Storage
 */

import {
    type TestAPI,
    type SuiteAPI,
    type ExpectStatic,
    type beforeEach,
} from "vitest";
import { type IStorageAdapter } from "@/storage/contracts/_module";
import { type Promisable } from "@/_shared/types";
import { storageAdapterValueTestSuite } from "@/storage/implementations/_shared/test-utilities/storage-adapter-value.test-suite";
import { storageAdapterApiTestSuite } from "@/storage/implementations/_shared/test-utilities/storage-adapter-api.test-suite";

/**
 * @group Utilities
 */
export type StorageAdapterTestSuiteSettings = {
    expect: ExpectStatic;
    test: TestAPI;
    describe: SuiteAPI;
    beforeEach: typeof beforeEach;
    createAdapter: () => Promisable<IStorageAdapter<unknown>>;
};
/**
 * @group Utilities
 */
export function storageTestSuite(
    settings: StorageAdapterTestSuiteSettings,
): void {
    storageAdapterApiTestSuite(settings);
    storageAdapterValueTestSuite(settings);
}
