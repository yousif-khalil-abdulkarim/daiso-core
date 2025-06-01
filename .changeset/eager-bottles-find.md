---
"@daiso-tech/core": minor
---

- Removed the following types:

    - `AsyncFactoryable`
    - `Factoryable`

- Updated remaining factory types to use the new `InvokableFn` and `InvokableObject` contracts:
    - Synchronous factories:
        - `FactoryFn`
        - `IFactoryObject`
        - `Factory`
    - Asynchronous factories:
        - `AsyncFactoryFn`
        - `IAsyncFactoryObject`
        - `AsyncFactory`

This change simplifies the type hierarchy and ensures consistent behavior between factory and invokable patterns.
