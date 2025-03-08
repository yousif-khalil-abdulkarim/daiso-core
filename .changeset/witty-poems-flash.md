---
"@daiso-tech/core": patch
---

Fixed a bug in <i>LockProvider</i> where using two <i>ILockAdapter<i> instances with the same name caused ILock serialization/deserialization issues. Now, you can pass in unique prefix to <i>LockProvider</i> to differentiate them.