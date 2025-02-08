---
"@daiso-tech/core": minor
---

- New features
  - Added new <i>ILock</i> <i>UnexpectedLockErrorEvent</i> that will dispatched when error occurs.
  - Added event listeners to <i>ILockProvider</i>, enabling monitoring of lock events from multiple locks.
- Changes
  - Made all the <i>ILock</i> events defered when dispatched.

