---
"@daiso-tech/core": minor
---

Removed `IGroupableCache` contract and remove `getGroup` method from `ICache` meaning you cant longer use `withGroup` and `getGroup` methods of the `Cache`class. This feature was not flexible.
