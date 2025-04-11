import {
    bulkhead,
    type OnProcessingData,
} from "@/async/middlewares/bulkhead/bulkhead.middleware.js";
import { LazyPromise } from "@/async/utilities/_module.js";
import { CapacityFullAsyncError } from "@/async/async.errors.js";
import { AsyncHooks, TimeSpan } from "@/utilities/_module-exports.js";
import { describe, expect, test } from "vitest";

describe("function: bulkhead", () => {
    test("Should throw CapacityFullAsyncError when capacity execded", async () => {
        const fetchData = new AsyncHooks(
            async (_url: string): Promise<string> => {
                await LazyPromise.delay(TimeSpan.fromMilliseconds(10));
                return "data";
            },
            [
                bulkhead({
                    maxCapacity: 1,
                    maxConcurrency: 1,
                }),
            ],
        );

        const promise1 = fetchData.invoke("url");
        const promise2 = fetchData.invoke("url");
        const promise3 = fetchData.invoke("url");
        try {
            await Promise.all([promise1, promise2, promise3]);
        } catch {
            /* Empty */
        }
        await expect(promise3).rejects.toBeInstanceOf(CapacityFullAsyncError);
    });
    test("Should return value when capacity is not execded", async () => {
        const fetchData = new AsyncHooks(
            async (_url: string): Promise<string> => {
                await LazyPromise.delay(TimeSpan.fromMilliseconds(10));
                return "data";
            },
            [
                bulkhead({
                    maxCapacity: 1,
                    maxConcurrency: 1,
                }),
            ],
        );

        const promise1 = fetchData.invoke("url");
        const promise2 = fetchData.invoke("url");
        try {
            await Promise.all([promise1, promise2]);
        } catch {
            /* Empty */
        }
        await expect(promise1).resolves.toBe("data");
        await expect(promise1).resolves.toBe("data");
    });
    test("Should call the onProcessing callback when capacity is not execded", async () => {
        let data = null as OnProcessingData | null;
        await new AsyncHooks(
            async (_url: string): Promise<string> => {
                await LazyPromise.delay(TimeSpan.fromMilliseconds(10));
                return "data";
            },
            [
                bulkhead({
                    onProcessing: (data_) => {
                        data = data_;
                    },
                    maxCapacity: 1,
                    maxConcurrency: 1,
                }),
            ],
            {
                context: {
                    a: "a",
                },
            },
        ).invoke("URL");

        expect(data?.args).toStrictEqual(["URL"]);
        expect(data?.context).toStrictEqual({
            a: "a",
        });
    });
});
