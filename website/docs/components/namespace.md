---
"sidebar_position": 10
---

# Namespace

The `@daiso-tech/core/namespace` component provides seamless way to group data by prefixing and suffixing keys.

## Usage

The `Namespace` class provides a foundational way to prefix or suffix keys. This mechanism is vital for avoiding key conflicts and logically grouping related items, making it a useful primitive block for features like multi-tenancy. Components such as `Cache` and `Lock` utilize it to ensure data isolation.

```ts
import { Namespace } from "@daiso-tech/core/namspace";

const namespace = new Namespace("@my-namespace");

// Logs "@my-namespace:_rt"
console.log(namespace.toString());

const key = namespace.create("my-key");

// Logs "my-key"
console.log(key.get());

// Logs "@my-namespace:_rt:my-key"
console.log(key.toString());

// You can extend the root
const newNamespace = namespace.appendRoot("sub");

// Logs "@my-namespace:sub:_rt"
console.log(newNamespace.toString());

// Logs "@my-namespace:sub:_rt:my-key"
console.log(namespace.create("my-key").toString());
```

## Further information

For further information refer to [`@daiso-tech/core/namespace`](https://yousif-khalil-abdulkarim.github.io/daiso-core/modules/Namespace.html) API docs.
