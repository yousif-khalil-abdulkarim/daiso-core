/**
 * @module SharedLock
 */

import type { IDatabaseSharedLockAdapter } from "@/shared-lock/contracts/database-shared-lock-adapter.contract.js";
import type { ISharedLockAdapter } from "@/shared-lock/contracts/shared-lock-adapter.contract.js";

/**
 * IMPORT_PATH: `"@daiso-tech/core/shared-lock/contracts"`
 * @group Contracts
 */
export type SharedLockAdapterVariants =
    | ISharedLockAdapter
    | IDatabaseSharedLockAdapter;
