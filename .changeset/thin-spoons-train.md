---
"@daiso-tech/core": minor
---

Removed the following `EventBus` errors:

- `UnableToRemoveListenerEventBusError`
- `UnableToAddListenerEventBusError`
- `UnableToDispatchEventBusError`

`EventBus` errors obscures unexpected errors originating from the underlying client, making it harder to identify the root cause.
