---
"@daiso-tech/core": minor
---

## Changes
- Added Cache module that can work ttl keys and none ttl keys.
- Remove Storage module in favor of the Cache module because it can with ttl keys and none ttl keys.
- Added MongodbCacheAdapter
- Added SqliteCacheAdapter
- Added LibsqlCacheAdapter
- Added RedisCacheAdapter
- Added MemoryCacheAdapter

## Changes
- Added Cache module: Introduced a new Cache module that supports both TTL (time-to-live) keys and non-TTL keys.
- Removed Storage module: Its functionality has been replaced by the more versatile Cache module, which supports both TTL and non-TTL keys.
  - New Cache Adapters: Added the following cache adapters for improved flexibility and compatibility:
  - MongodbCacheAdapter
  - SqliteCacheAdapter
  - LibsqlCacheAdapter
  - RedisCacheAdapter
  - MemoryCacheAdapter