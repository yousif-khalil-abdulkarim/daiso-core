import { describe, expect, test } from "vitest";
import { lazyPromise } from "@/async/lazy-promise/_module";

describe("function: lazyPromise", () => {
    test("Should not execute callback function when not awaited", async () => {
        let value: string | null = null;
        lazyPromise(
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
        const promise = lazyPromise(
            // eslint-disable-next-line @typescript-eslint/require-await
            async () => {
                value = "a";
            },
        );
        await promise;
        expect(value).toBe("a");
    });
});
