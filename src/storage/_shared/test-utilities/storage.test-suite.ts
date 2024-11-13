/**
 * @module Storage
 */

import {
    type TestAPI,
    type SuiteAPI,
    type ExpectStatic,
    type beforeEach,
} from "vitest";
import { type IStorageAdapter } from "@/contracts/storage/_module";
import { type Promisable } from "@/_shared/types";
import { storageNamespaceTestSuite } from "@/storage/_shared/test-utilities/storage-namespace.test-suite";
import { storageValueTestSuite } from "@/storage/_shared/test-utilities/storage-value.test-suite";
import { storageApiTestSuite } from "@/storage/_shared/test-utilities/storage-api.test-suite";

/**
 * @group Utilities
 */
export type StorageTestSuiteSettings = {
    expect: ExpectStatic;
    test: TestAPI;
    describe: SuiteAPI;
    beforeEach: typeof beforeEach;
    createAdapter: () => Promisable<IStorageAdapter<unknown>>;
};
/**
 * @group Utilities
 */
export function storageTestSuite(settings: StorageTestSuiteSettings): void {
    storageApiTestSuite(settings);
    storageNamespaceTestSuite(settings);
    storageValueTestSuite(settings);
}
