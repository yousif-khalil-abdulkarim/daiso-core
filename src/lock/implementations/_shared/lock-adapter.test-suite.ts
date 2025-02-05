/**
 * @module Lock
 */
import {
    type TestAPI,
    type SuiteAPI,
    type ExpectStatic,
    type beforeEach,
} from "vitest";
import { type ILockAdapter } from "@/lock/contracts/_module";
import { type Promisable } from "@/utilities/_module";
import { TimeSpan } from "@/utilities/_module";
import { delay } from "@/async/_module";

/**
 * @group Utilities
 */
export type LockAdapterTestSuiteSettings = {
    expect: ExpectStatic;
    test: TestAPI;
    describe: SuiteAPI;
    beforeEach: typeof beforeEach;
    createAdapter: () => Promisable<ILockAdapter>;
};

/**
 * The <i>lockAdapterTestSuite</i> function simplifies the process of testing your custom implementation of <i>{@link ILockAdapter}</i> with <i>vitest</i>.
 * @group Utilities
 */
export function lockAdapterTestSuite(
    settings: LockAdapterTestSuiteSettings,
): void {
    const { expect, test, createAdapter, describe, beforeEach } = settings;
    let lockAdapterA: ILockAdapter;
    let lockAdapterB: ILockAdapter;
    beforeEach(async () => {
        lockAdapterA = await createAdapter();
        lockAdapterB = lockAdapterA.withGroup("b");
    });

    const ttl = TimeSpan.fromMilliseconds(50);
    describe("Api tests:", () => {
        describe("method: acquire", () => {
            test("Should return true when key is not acquired", async () => {
                const key = "a";
                const owner = "b";
                const result = await lockAdapterA.acquire(key, owner, null);
                expect(result).toBe(true);
            });
            test("Should return true when key is expired", async () => {
                const key = "a";
                const owner = "b";
                await lockAdapterA.acquire(key, owner, ttl);
                await delay(ttl);
                const result = await lockAdapterA.acquire(key, owner, null);
                expect(result).toBe(true);
            });
            test("Should return false when key is already acquired by same owner", async () => {
                const key = "a";
                const owner = "b";
                await lockAdapterA.acquire(key, owner, null);
                const result = await lockAdapterA.acquire(key, owner, null);
                expect(result).toBe(false);
            });
            test("Should return false when key is already acquired by different owner", async () => {
                const key = "a";
                const owner1 = "b";
                await lockAdapterA.acquire(key, owner1, null);
                const owner2 = "c";
                const result = await lockAdapterA.acquire(key, owner2, null);
                expect(result).toBe(false);
            });
            test("Should return false when key is already acquired and not expired", async () => {
                const key = "a";
                const owner = "b";
                await lockAdapterA.acquire(key, owner, ttl);
                await delay(ttl.divide(2));
                const result = await lockAdapterA.acquire(key, owner, null);
                expect(result).toBe(false);
            });
        });
        describe("method: release", () => {
            test("Should return true when key is released by same owner", async () => {
                const key = "a";
                const owner = "b";
                await lockAdapterA.acquire(key, owner, null);
                const result = await lockAdapterA.release(key, owner);
                expect(result).toBe(true);
            });
            test("Should return false when key is tried to be released by different owner", async () => {
                const key = "a";
                const owner1 = "b";
                await lockAdapterA.acquire(key, owner1, null);
                const owner2 = "c";
                const result = await lockAdapterA.release(key, owner2);
                expect(result).toBe(false);
            });
            test("Should be reacquirable by new owner after release", async () => {
                const key = "a";
                const owner1 = "b";
                await lockAdapterA.acquire(key, owner1, null);
                await lockAdapterA.release(key, owner1);
                const owner2 = "c";
                const result = await lockAdapterA.acquire(key, owner2, null);
                expect(result).toBe(true);
            });
        });
        describe("method: forceRelease", () => {
            test("Should be reacquirable by new owner after release", async () => {
                const key = "a";
                const owner1 = "b";
                await lockAdapterA.acquire(key, owner1, null);
                await lockAdapterA.forceRelease(key);
                const owner2 = "c";
                const result = await lockAdapterA.acquire(key, owner2, null);
                expect(result).toBe(true);
            });
        });
        describe("method: isLocked", () => {
            test("Should return false when key is not acquired", async () => {
                const key = "a";
                const result = await lockAdapterA.isLocked(key);
                expect(result).toBe(false);
            });
            test("Should return true when key is acquired", async () => {
                const key = "a";
                const owner = "b";
                await lockAdapterA.acquire(key, owner, null);
                const result = await lockAdapterA.isLocked(key);
                expect(result).toBe(true);
            });
        });
        describe("method: getRemainingTime", () => {
            test("Should return null when key is not acquired", async () => {
                const key = "a";

                const result = await lockAdapterA.getRemainingTime(key);

                expect(result).toBeNull();
            });
            test("Should return null when key is acquired and has no expiration", async () => {
                const key = "a";
                const owner = "b";
                const ttl = null;
                await lockAdapterA.acquire(key, owner, ttl);

                const result = await lockAdapterA.getRemainingTime(key);

                expect(result).toBeNull();
            });
            test("Should return null when key is acquired and has expired", async () => {
                const key = "a";
                const owner = "b";
                await lockAdapterA.acquire(key, owner, ttl);
                await delay(ttl);

                const result = await lockAdapterA.getRemainingTime(key);

                expect(result).toBeNull();
            });
            test("Should return TimeSpan when key is acquired and has not expired", async () => {
                const key = "a";
                const owner = "b";
                await lockAdapterA.acquire(key, owner, ttl.multiply(2));
                await delay(ttl);

                const result = await lockAdapterA.getRemainingTime(key);

                expect(result).toBeInstanceOf(TimeSpan);
                expect(result?.toMilliseconds()).toBeGreaterThan(0);
            });
        });
        describe("method: refresh", () => {
            test("Should return true when extended by same owner", async () => {
                const key = "a";
                const owner = "b";

                await lockAdapterA.acquire(key, owner, ttl);
                const result = await lockAdapterA.refresh(
                    key,
                    owner,
                    ttl.multiply(2),
                );

                expect(result).toBe(true);
            });
            test("Should refresh ttl when by same owner", async () => {
                const key = "a";
                const owner = "b";
                await lockAdapterA.acquire(key, owner, ttl);
                await lockAdapterA.refresh(key, owner, ttl.multiply(2));
                await delay(ttl);

                const result1 = await lockAdapterA.isLocked(key);
                expect(result1).toBe(true);

                await delay(ttl);

                const result2 = await lockAdapterA.isLocked(key);
                expect(result2).toBe(false);
            });
            test("Should return false when extended by different owner", async () => {
                const key = "a";
                const owner1 = "b";

                await lockAdapterA.acquire(key, owner1, ttl);
                const owner2 = "c";
                const result = await lockAdapterA.refresh(
                    key,
                    owner2,
                    ttl.multiply(2),
                );

                expect(result).toBe(false);
            });
            test("Should not refresh ttl when by different owner", async () => {
                const key = "a";
                const owner1 = "b";
                await lockAdapterA.acquire(key, owner1, ttl);
                const owner2 = "c";
                await lockAdapterA.refresh(key, owner2, ttl.multiply(2));
                await delay(ttl);

                const result = await lockAdapterA.isLocked(key);
                expect(result).toBe(false);
            });
        });
    });
    describe("Group tests:", () => {
        test("method: acquire", async () => {
            const key = "a";
            const owner = "b";

            const resultA = await lockAdapterA.acquire(key, owner, null);
            expect(resultA).toBe(true);

            const resultB = await lockAdapterB.acquire(key, owner, null);
            expect(resultB).toBe(true);
        });
        test("method: release", async () => {
            const key = "a";
            const owner = "b";

            await lockAdapterA.acquire(key, owner, null);
            await lockAdapterB.acquire(key, owner, null);
            await lockAdapterA.release(key, owner);

            expect(await lockAdapterA.isLocked(key)).toBe(false);
            expect(await lockAdapterB.isLocked(key)).toBe(true);
        });
        test("method: forceRelease", async () => {
            const key = "a";
            const owner = "b";

            await lockAdapterA.acquire(key, owner, null);
            await lockAdapterB.acquire(key, owner, null);
            await lockAdapterA.forceRelease(key);

            expect(await lockAdapterA.isLocked(key)).toBe(false);
            expect(await lockAdapterB.isLocked(key)).toBe(true);
        });
        test("method: isLocked", async () => {
            const key = "a";
            const owner = "b";
            await lockAdapterA.acquire(key, owner, null);

            const resultA = await lockAdapterA.isLocked(key);
            expect(resultA).toBe(true);

            const resultB = await lockAdapterB.isLocked(key);
            expect(resultB).toBe(false);
        });
        test("method: getRemainingTime", async () => {
            const key = "a";
            const owner = "b";
            await lockAdapterA.acquire(key, owner, ttl);
            await lockAdapterB.acquire(key, owner, null);

            const resultA = await lockAdapterA.getRemainingTime(key);
            const resultB = await lockAdapterB.getRemainingTime(key);

            expect(typeof resultA?.toMilliseconds()).toBe("number");
            expect(resultB).toBeNull();
        });
        test("method: refresh", async () => {
            const key = "a";
            const owner = "b";
            await lockAdapterA.acquire(key, owner, ttl);
            await lockAdapterB.acquire(key, owner, ttl);
            await lockAdapterA.refresh(key, owner, ttl.multiply(2));
            await delay(ttl);

            const resultA = await lockAdapterA.isLocked(key);
            expect(resultA).toBe(true);

            const resultB = await lockAdapterB.isLocked(key);
            expect(resultB).toBe(false);
        });
    });
}
