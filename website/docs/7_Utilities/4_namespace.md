---
sidebar_position: 4
---

# Namespace

The [`Namespace`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Utilities.Namespace.html) class enables the use of namespaces to prevent key collisions in key-value stores (like Redis) by adding prefixes or suffixes to keys. This simulates hierarchical grouping in storage systems that don’t natively support it.

## Use cases

### Separating different types of data

When multiple components share the same storage, their keys may collide. Namespaces ensure isolation.

**Example**:
Suppose you use Redis for both:

-   A [`LockProvider`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Lock.LockProvider.html) (managing locks with keys like `"order/123"`)

-   A [`Cache`](https://yousif-khalil-abdulkarim.github.io/daiso-core/modules/Cache.html) (storing data with keys like `"order/123"`)

Without namespaces, both could accidentally use the same key (e.g., `"order/123"`), causing data corruption. <br/>
By prefixing cache keys with `"cache"` and lock keys with `"lock"`, we ensure unique namespaces:

-   [`LockProvider`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Lock.LockProvider.html) keys become `"lock:_rt:order/123"`

-   [`Cache`](https://yousif-khalil-abdulkarim.github.io/daiso-core/modules/Cache.html) keys become `"cache:_rt:order/123"`

Now, they won’t interfere with each other.

### Multi-tenancy support

Multi-tenancy is an architecture where a single server serves multiple customers (tenants) while keeping their data isolated.

<!-- Namespaces isolate data for different clients or services in a shared storage system. -->

**Example**:
A SaaS platform stores customer data in Redis. Without namespaces keys could collide between diffrent tenants:

-   Tenant A’s key (`"user_prefs:100"`) could clash with tenant B’s key (`"user_prefs:100"`).

But this issue is resolved through tenant-specific namespaces by prefixing keys with tenant identifiers (e.g., `tenant_A` for Tenant A, `tenant_B` for Tenant B) to maintain data isolation:

-   Tenant A’s keys become `"tenant_A:_rt:user_prefs/100"`

-   Tenant B’s keys become `"tenant_B:_rt:user_prefs/100"`

This ensures secure data separation.

## Usage

### Initial configuration

To begin using the [`Namspace`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Utilities.Namespace.html) class, you'll need to create and configure an instance:

```ts
import { Namespace } from "@daiso-tech/core/utilities";

// You only need to initialize with required root
const cacheNamespace = new Namespace("@cache");
```

### Additional configuration

The root can also be `Iterable<string>`:

```ts
import { Namespace } from "@daiso-tech/core/utilities";

const cacheNamespace = new Namespace(["@cache", "user"]);
```

The [`Namspace`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Utilities.Namespace.html) constructor accepts an optional second parameter for customization:

```ts
import { Namespace } from "@daiso-tech/core/utilities";

const cacheNamespace = new Namespace(
    ["@cache", "user"],
    // Optional configuration (defaults shown below)
    {
        // Joins the root, rootIdentifier, and key with this delimiter
        identifierDelimiter: ":",

        // Joins Iterable<string> path (root or key) with this delimiter
        keyDelimiter: "/",

        // Marks the boundary between the root and the key
        rootIdentifier: "_rt",
    },
);
```

### Usage with cache

Here's how to use the configured namespace with the Cache:

```ts
import { MemoryCacheAdapter } from "@daiso-tech/core/cache/adapters";
import { Cache } from "@daiso-tech/core/cache";
import { Namespace } from "@daiso-tech/core/utilities";

const cacheNamespace = new Namespace(["@cache", "user"]);

const cache = new Cache({
    namespace: cacheNamespace,
    adapter: new MemoryCacheAdapter(),
});
```

Here is how the keys will be stored in the cache adapters:

```ts
await cache.add("key", 1);
// Resulting key in adapter: "@cache/user:_rt:key"

// The key can aslo be Iterable<string>
await cache.add(["key", "a"], 1);
// Resulting key in adapter: "@cache/user:_rt:key/a"
```

### Overriding configurations

```ts
import { MemoryCacheAdapter } from "@daiso-tech/core/cache/adapters";
import { Cache } from "@daiso-tech/core/cache";

const cacheNamespace1 = new Namespace(["@cache", "user"]);

const cacheNamespace2 = cacheNamespace
    .setIdentifierDelimeter("#")
    .setKeyDelimeter("_")
    .setRootIdentifier("root");
```

### Appending to root

```ts
const cacheNamespace1 = new Namespace("@cache");

const cacheNamespace2 = cacheNamespace1.appendRoot("user");
// The root will now be ["@cache", "user"]

const cacheNamespace3 = cacheNamespace1.appendRoot(["user", "contact"]);
// The root will now be ["@cache", "user", "contact"ssssss]
```

:::info
Note that the [`Namspace`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Utilities.Namespace.html) is immutable, meaning any configuration override returns a new instance rather than modifying the existing one.
:::
