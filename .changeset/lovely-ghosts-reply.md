---
"@daiso-tech/core": minor
---

Update `TimeSpan` class `fromDateRange` method arguments. Now it only takes on optional argument which an object of type `TimeSpanFromDateRangeSettings`.

```ts
export type TimeSpanFromDateRangeSettings = {
    /**
     * @default
     * ```ts
     * new Date()
     * ```
     */
    start?: Date;

    /**
     * @default
     * ```ts
     * new Date()
     * ```
     */
    end?: Date;
};
```
