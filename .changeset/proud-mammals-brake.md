---
"@daiso-tech/core": minor
---

Changed the `NamespaceSettings` type:

before:
```ts
export type NamespaceSettings = {
    identifierDelimeter?: string;

    keyDelimeter?: string;

    rootIdentifier?: string;
}
```

after:
```ts
/**
 *
 * IMPORT_PATH: `"@daiso-tech/core/utilities"`
 * @group Namespace
 */
export type NamespaceSettings = {
    delimeter?: string;

    rootIdentifier?: string;
}
```
