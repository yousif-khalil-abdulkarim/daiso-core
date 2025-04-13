---
"@daiso-tech/core": patch
---

Fixed a bug where middlewares were being executed in reverse (right-to-left) order. They now correctly execute in the intended left-to-right sequence.