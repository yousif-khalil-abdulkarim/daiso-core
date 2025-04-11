---
"@daiso-tech/core": minor
---

Added a new `sequentialHedging` middleware that executes the primary function and all fallback functions sequentially.
It returns the result of the first successful function and automatically cancels all remaining function.
If all function fail than error is thrown.
