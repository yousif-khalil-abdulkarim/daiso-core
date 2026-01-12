---
"@daiso-tech/core": minor
---

Added a new static method, `TimeSpan.fromStr`, which parses a time-formatted string to create a new `TimeSpan` instance.

Example:
```ts
import { TimeSpan } from "@daiso-tech/core/time-span"

TimeSpan.fromStr("5s")
```