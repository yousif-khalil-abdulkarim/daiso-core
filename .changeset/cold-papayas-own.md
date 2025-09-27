---
"@daiso-tech/core": minor
---

## Feature: Introducing `ITimeSpan` Contract for Flexible Time Handling ⏱️

A new contract, `ITimeSpan`, has been introduced:

```ts
export const TO_MILLISECONDS = Symbol("TO_MILLISECONDS");

export type ITimeSpan = {
    /**
     * Converts the time span to its total duration in milliseconds.
     */
    [TO_MILLISECONDS](): number;
}
```

By replacing the concrete `TimeSpan` class with this interface, we achieve greater flexibility and interoperability. This makes it easy for developers to use external time libraries (e.g., `Luxon`) by simply implementing `ITimeSpan` on their duration objects.
