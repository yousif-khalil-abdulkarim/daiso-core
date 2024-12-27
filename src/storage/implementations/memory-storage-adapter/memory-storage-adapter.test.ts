import { beforeEach, describe, expect, test } from "vitest";
import { storageTestSuite } from "@/storage/implementations/_shared/test-utilities/_module";
import { MemoryStorageAdapter } from "@/storage/implementations/memory-storage-adapter/_module";

describe("class: MemoryStorageAdapter", () => {
    storageTestSuite({
        createAdapter: () =>
            new MemoryStorageAdapter(new Map<string, unknown>()),
        test,
        beforeEach,
        expect,
        describe,
    });
});
