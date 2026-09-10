import { memorySharedLockAdapter } from "./memory_shared_lock_adapter.js";

// Remove all expired shared-lock keys manually.
await memorySharedLockAdapter.removeAllExpired();
