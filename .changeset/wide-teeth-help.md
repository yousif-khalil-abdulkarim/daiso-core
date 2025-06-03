---
"@daiso-tech/core": minor
---

Added [standard schema](https://standardschema.dev/) integration with following components:

- `Collection` and `AsyncCollection` components can now use [standard schema](https://standardschema.dev/) object filter all items match the schema and thereafter transform the matched items.

- `Cache` component can now use [standard schema](https://standardschema.dev/) object to validate all input and output data.

- `EventBus` component can now use [standard schema](https://standardschema.dev/) object to validate all input and output data.

- `fallback` middleware can now use [standard schema](https://standardschema.dev/) as error policy.

- `retry` middleware can now use [standard schema](https://standardschema.dev/) as error policy.
