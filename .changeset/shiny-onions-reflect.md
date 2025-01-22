---
"@daiso-tech/core": minor
---

## New features

-   Introduced a instance static method <i>listenOnce</i> for the <i>IEventBus</i> contract and <i>EventBus</i> class.
    This method simplifies add listener that will only execute once.

## Changes

-   Moved event bus group logic from the <i>Cache</i> class into the adapters classes.
    -   **Key Impact**: Each adapter is now required to implement the <i>getGroup</i> and <i>withGroup</i> methods.
    -   This change enhances flexibility for adapter-specific logic.
