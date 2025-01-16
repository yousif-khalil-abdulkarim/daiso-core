---
"@daiso-tech/core": minor
---

## Changes
- Added: A new <i>NoOpCacheAdapter</i> for mocking cache operations in testing environments.
- Updated: All cache and eventbus adapters now require a serializer to be explicitly provided, ensuring consistent serialization behavior.
- Removed: The validation feature has been removed from the <i>EventBus</i> and <i>EventBusFactory</i> classes.
- Added: A new abstract class <i>BaseEventBus</i> to simplify the implementation of <i>IEventBus</i>. This allows direct use without needing <i>IEventBusAdapter</i>.