---
"@daiso-tech/core": minor
---

Added a new `concurrentHedging` middleware executes the primary function and all fallback functions concurrently.
It returns the result of the first successful function and automatically aborts all remaining functions.
If all function fail than error is thrown.
