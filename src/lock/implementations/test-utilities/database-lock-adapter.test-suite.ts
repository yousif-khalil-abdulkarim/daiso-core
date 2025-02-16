/**
 * @module Lock
 */
import {
    type TestAPI,
    type SuiteAPI,
    type ExpectStatic,
    type beforeEach,
    vi,
} from "vitest";
import { type IDatabaseLockAdapter } from "@/lock/contracts/_module-exports.js";
import { type Promisable } from "@/utilities/_module-exports.js";
import { TimeSpan } from "@/utilities/_module-exports.js";

/**
 * @group Utilities
 */
export type DatabaseLockAdapterTestSuiteSettings = {
    expect: ExpectStatic;
    test: TestAPI;
    describe: SuiteAPI;
    beforeEach: typeof beforeEach;
    createAdapter: () => Promisable<IDatabaseLockAdapter>;
};

/**
 * The <i>databaseLockAdapterTestSuite</i> function simplifies the process of testing your custom implementation of <i>{@link IDatabaseLockAdapter}</i> with <i>vitest</i>.
 * @group Utilities
 */
export function databaseLockAdapterTestSuite(
    settings: DatabaseLockAdapterTestSuiteSettings,
): void {
    const { expect, test, createAdapter, describe, beforeEach } = settings;
    let databaseLockAdapterA: IDatabaseLockAdapter;
    let databaseLockAdapterB: IDatabaseLockAdapter;
    beforeEach(async () => {
        databaseLockAdapterA = await createAdapter();
        databaseLockAdapterB = databaseLockAdapterA.withGroup("b");
    });

    const ttl = TimeSpan.fromMilliseconds(50);
    describe("Api tests:", () => {
        describe("method: insert", () => {
            test("Should insert lock when not existing", async () => {
                const key = "a";
                const owner = "b";
                const expiration = null;

                await databaseLockAdapterA.insert(key, owner, expiration);

                const result = await databaseLockAdapterA.find(key);
                expect(result).toEqual({
                    owner,
                    expiration,
                });
            });
            test("Should insert lock with expiration when not existing", async () => {
                const key = "a";
                const owner = "b";
                const expiration = ttl.toEndDate();

                await databaseLockAdapterA.insert(key, owner, expiration);

                const result = await databaseLockAdapterA.find(key);
                expect(result).toEqual({
                    owner,
                    expiration,
                });
            });
            test("Should throw error when lock already existing", async () => {
                const key = "a";
                const owner = "b";
                const expiration = null;

                await databaseLockAdapterA.insert(key, owner, expiration);

                const result = databaseLockAdapterA.insert(
                    key,
                    owner,
                    expiration,
                );
                await expect(result).rejects.toBeDefined();
            });
        });
        describe("method: update", () => {
            test("Should return false when lock has no expiration", async () => {
                const key = "a";
                const owner1 = "b";
                const expiration = null;
                await databaseLockAdapterA.insert(key, owner1, expiration);

                const owner2 = "c";
                const result = await databaseLockAdapterA.update(
                    key,
                    owner2,
                    expiration,
                );

                expect(result).toBe(0);
            });
            test("Should not update when lock has no expiration", async () => {
                const key = "a";
                const owner1 = "b";
                const expiration = null;
                await databaseLockAdapterA.insert(key, owner1, expiration);

                const owner2 = "c";
                await databaseLockAdapterA.update(key, owner2, expiration);

                const result = await databaseLockAdapterA.find(key);
                expect(result).toEqual({
                    owner: owner1,
                    expiration,
                });
            });
            test("Should return false when lock has not expired", async () => {
                vi.useFakeTimers();
                const key = "a";
                const owner1 = "b";
                const expiration1 = ttl.toEndDate();
                await databaseLockAdapterA.insert(key, owner1, expiration1);
                vi.advanceTimersByTime(ttl.divide(2).toMilliseconds());

                const owner2 = "c";
                const expiration2 = ttl.addMilliseconds(25).toEndDate();
                const result = await databaseLockAdapterA.update(
                    key,
                    owner2,
                    expiration2,
                );

                expect(result).toBe(0);
                vi.useRealTimers();
            });
            test("Should not update when lock has not expired", async () => {
                vi.useFakeTimers();
                const key = "a";
                const owner1 = "b";
                const expiration1 = ttl.toEndDate();
                await databaseLockAdapterA.insert(key, owner1, expiration1);
                vi.advanceTimersByTime(ttl.divide(2).toMilliseconds());

                const owner2 = "c";
                const expiration2 = ttl.addMilliseconds(25).toEndDate();
                await databaseLockAdapterA.update(key, owner2, expiration2);

                const result = await databaseLockAdapterA.find(key);
                expect(result).toEqual({
                    owner: owner1,
                    expiration: expiration1,
                });
                vi.useRealTimers();
            });
            test("Should return true when lock has expired", async () => {
                vi.useFakeTimers();
                const key = "a";
                const owner1 = "b";
                const expiration1 = ttl.toEndDate();
                await databaseLockAdapterA.insert(key, owner1, expiration1);
                vi.advanceTimersByTime(ttl.addMilliseconds(1).toMilliseconds());

                const owner2 = "c";
                const expiration2 = ttl.addMilliseconds(25).toEndDate();
                const result = await databaseLockAdapterA.update(
                    key,
                    owner2,
                    expiration2,
                );

                expect(result).toBe(1);
                vi.useRealTimers();
            });
            test("Should update when lock has expired", async () => {
                vi.useFakeTimers();
                const key = "a";
                const owner1 = "b";
                const expiration1 = ttl.toEndDate();
                await databaseLockAdapterA.insert(key, owner1, expiration1);
                vi.advanceTimersByTime(ttl.addMilliseconds(1).toMilliseconds());

                const owner2 = "c";
                const expiration2 = ttl.addMilliseconds(25).toEndDate();
                await databaseLockAdapterA.update(key, owner2, expiration2);

                const result = await databaseLockAdapterA.find(key);
                expect(result).toEqual({
                    owner: owner2,
                    expiration: expiration2,
                });
                vi.useRealTimers();
            });
        });
        describe("method: remove", () => {
            test("Should not remove lock when not same owner", async () => {
                const key = "a";
                const owner1 = "b";
                const expiration = null;
                await databaseLockAdapterA.insert(key, owner1, expiration);

                const owner2 = "c";
                await databaseLockAdapterA.remove(key, owner2);

                const result = await databaseLockAdapterA.find(key);
                expect(result).toEqual({
                    owner: owner1,
                    expiration,
                });
            });
            test("Should remove lock when same owner", async () => {
                const key = "a";
                const owner = "b";
                const expiration = null;
                await databaseLockAdapterA.insert(key, owner, expiration);

                await databaseLockAdapterA.remove(key, owner);

                const result = await databaseLockAdapterA.find(key);
                expect(result).toBeNull();
            });
            test("Should remove lock when given null as owner", async () => {
                const key = "a";
                const owner = "b";
                const expiration = null;
                await databaseLockAdapterA.insert(key, owner, expiration);

                await databaseLockAdapterA.remove(key, null);

                const result = await databaseLockAdapterA.find(key);
                expect(result).toBeNull();
            });
        });
        describe("method: refresh", () => {
            test("Should return false when not same owner", async () => {
                const key = "a";
                const owner1 = "b";
                const expiration1 = ttl.toEndDate();
                await databaseLockAdapterA.insert(key, owner1, expiration1);

                const expiration2 = ttl.multiply(2).toEndDate();
                const owner2 = "c";
                const result = await databaseLockAdapterA.refresh(
                    key,
                    owner2,
                    expiration2,
                );

                expect(result).toBe(0);
            });
            test("Should not update lock when not same owner", async () => {
                const key = "a";
                const owner1 = "b";
                const expiration1 = ttl.toEndDate();
                await databaseLockAdapterA.insert(key, owner1, expiration1);

                const expiration2 = ttl.multiply(2).toEndDate();
                const owner2 = "c";
                await databaseLockAdapterA.refresh(key, owner2, expiration2);

                const result = await databaseLockAdapterA.find(key);
                expect(result).toEqual({
                    owner: owner1,
                    expiration: expiration1,
                });
            });
            test("Should return true when same owner", async () => {
                const key = "a";
                const owner = "b";
                const expiration1 = ttl.toEndDate();
                await databaseLockAdapterA.insert(key, owner, expiration1);

                const expiration2 = ttl.multiply(2).toEndDate();
                const result = await databaseLockAdapterA.refresh(
                    key,
                    owner,
                    expiration2,
                );

                expect(result).toBe(1);
            });
            test("Should update lock when same owner", async () => {
                const key = "a";
                const owner = "b";
                const expiration1 = ttl.toEndDate();
                await databaseLockAdapterA.insert(key, owner, expiration1);

                const expiration2 = ttl.multiply(2).toEndDate();
                await databaseLockAdapterA.refresh(key, owner, expiration2);

                const result = await databaseLockAdapterA.find(key);
                expect(result).toEqual({
                    owner,
                    expiration: expiration2,
                });
            });
        });
    });
    describe("Group tests:", () => {
        test("method: insert", async () => {
            const key = "a";
            const owner = "b";
            const expiration = ttl.toEndDate();

            const result1 = databaseLockAdapterA.insert(key, owner, expiration);
            const result2 = databaseLockAdapterB.insert(key, owner, expiration);

            await expect(result1).resolves.toBeUndefined();
            await expect(result2).resolves.toBeUndefined();
        });
        test("method: update", async () => {
            vi.useFakeTimers();
            const key = "a";
            const owner1 = "b";
            const expiration = ttl.toEndDate();

            await databaseLockAdapterA.insert(key, owner1, expiration);
            await databaseLockAdapterB.insert(key, owner1, expiration);
            vi.advanceTimersByTime(ttl.toMilliseconds());

            const owner2 = "c";
            await databaseLockAdapterA.update(key, owner2, null);

            const result1 = await databaseLockAdapterA.find(key);
            expect(result1).toEqual({
                owner: owner2,
                expiration: null,
            });
            const result2 = await databaseLockAdapterB.find(key);
            expect(result2).toEqual({
                owner: owner1,
                expiration,
            });
            vi.useRealTimers();
        });
        test("method: remove", async () => {
            const key = "a";
            const owner = "b";
            const expiration = ttl.toEndDate();

            await databaseLockAdapterA.insert(key, owner, expiration);
            await databaseLockAdapterB.insert(key, owner, expiration);
            await databaseLockAdapterA.remove(key, owner);

            const result1 = await databaseLockAdapterA.find(key);
            expect(result1).toBeNull();
            const result2 = await databaseLockAdapterB.find(key);
            expect(result2).toEqual({
                owner,
                expiration,
            });
        });
        test("method: refresh", async () => {
            vi.useFakeTimers();
            const key = "a";
            const owner = "b";
            const expiration = ttl.toEndDate();

            await databaseLockAdapterA.insert(key, owner, expiration);
            await databaseLockAdapterB.insert(key, owner, expiration);
            vi.advanceTimersByTime(ttl.toMilliseconds());

            const newExpiration = ttl.multiply(2).toEndDate();
            await databaseLockAdapterA.refresh(key, owner, newExpiration);

            const result1 = await databaseLockAdapterA.find(key);
            expect(result1).toEqual({
                owner,
                expiration: newExpiration,
            });
            const result2 = await databaseLockAdapterB.find(key);
            expect(result2).toEqual({
                owner,
                expiration,
            });
            vi.useRealTimers();
        });
    });
}
