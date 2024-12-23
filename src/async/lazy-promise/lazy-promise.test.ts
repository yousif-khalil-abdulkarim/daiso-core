import { describe, expect, test } from "vitest";
import { LazyPromise } from "@/async/lazy-promise/_module";

describe("function: lazyPromise", () => {
    test("Should not execute callback function when not awaited", async () => {
        let value: string | null = null;
        new LazyPromise(
            // eslint-disable-next-line @typescript-eslint/require-await
            async () => {
                value = "a";
            },
        );
        await new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, 15);
        });
        expect(value).toBe(null);
    });
    test("Should execute callback function when not awaited", async () => {
        let value: string | null = null;
        const promise = new LazyPromise(
            // eslint-disable-next-line @typescript-eslint/require-await
            async () => {
                value = "a";
            },
        );
        await promise;
        expect(value).toBe("a");
    });
    test("Should execute only once", async () => {
        let value = 0;
        const promise = new LazyPromise(
            // eslint-disable-next-line @typescript-eslint/require-await
            async () => {
                value++;
            },
        );
        await promise;
        await promise;
        await promise;
        expect(value).toBe(1);
    });
});
