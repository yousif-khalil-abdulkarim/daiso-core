---
"@daiso-tech/core": minor
---

Added new <i>Pipeline</i> utility class makes it easy to chain multiple functions and <i>IInvokableObject</i> instances together. Each function or object in the pipeline can inspect or modify the input as it passes through. The <i>Pipeline</i> class is immutable, so you can safely extend or modify it without causing issues.

