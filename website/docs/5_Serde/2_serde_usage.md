---
sidebar_position: 2
---

# Serde usage

## Initial configuration

```ts
import { Serde } from "@daiso-tech/core/serde";
import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";

const serde = new Serde(new SuperJsonSerdeAdapter());
```

## Serde basics

### Serializing and deserializing values

Here is an example of serializing and deserializing a value.

```ts
const serializedValue = serde.serialize({
    name: "abra",
    age: 20,
});

const deserializedValue = serde.deserialize(serializedValue);
```

### Custom serialization and deserialization logic of classes

Serializing and deserializing a class:

```ts
import type { ISerializable } from "@daiso-tech/core/serde/contracts";

type ISerializedUser = {
    name: string;
    age: number;
};

class User implements ISerializable<ISerializedUser> {
    static deserialize(serializedUser: ISerializedUser): User {
        return new User(serializedUser.name, serializedUser.age);
    }

    constructor(
        public readonly name: string,
        public readonly age: number,
    ) {}

    serialize(): ISerializedUser {
        return {
            name: this.name,
            age: this.age,
        };
    }

    logInfo(): void {
        console.log("Name:", this.name, "Age:", this.age);
    }
}

serde.registerClass(User);

const user = new User("Carl", 50);
const serializedUser = serde.serialize(user);
const deserializedUser = serde.deserialize(serializedUser);

// The instances will not be the same because deserializedUser is recreated.
console.log(user === deserializedUser);

// But the content will be the same
deserializedUser.logInfo();
user.logInfo();
```

:::danger
Note you need to register the class before serialzing or deserialzing any class instances.
:::

:::warning
To ensure correct serialization and deserialization, class names must be unique. If multiple classes share the same name, conflicts may occur when serialzing and deserialzing the objects. To resolve this, you can assign a unique prefix to differentiate between them during the process.

```ts
serde.registerClass(User, "my-library");
```

:::

### Custom serialization and deserialization logic

The `registerClass` method provides a simplified abstraction over `registerCustom` method, which offers finer-grained control over serialization and deserialization behavior.

```ts
import type { ISerdeTransformer } from "@daiso-tech/core/serde/contracts";

type ISerializedUser = {
    name: string;
    age: number;
};
const userSerdeTransformer: ISerdeTransformer<User, ISerializedUser> = {
    name: User.name,

    isApplicable(value: unknown): value is User {
        return value instanceof User;
    }

    deserialize(serializedValue: TSerializedValue): User {
        return new User(serializedValue.name, serializedValue.age);
    }

    serialize(deserializedValue: User): TSerializedValue {
        return {
            name: user.name,
            age: user.age,
        };
    }
}

serde.registerCustom(userSerdeTransformer);
```

:::info
Note the `ISerdeTranformer` object can be dynamically created.
:::

## Patterns

### Usage with other components

When using [`Serde`](https://yousif-khalil-abdulkarim.github.io/daiso-core/modules/Serde.html) class instance there is no need to call `serialize` and `deserialize` manually. Because components like [`Cache`](https://yousif-khalil-abdulkarim.github.io/daiso-core/modules/Cache.html) handle it automatically through their adapter.

```ts
import { Serde } from "@daiso-tech/core/serde";
import { Namespace } from "@daiso-tech/core/utilities";
import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";
import { RedisCacheAdapter } from "@daiso-tech/core/cache/adapters";
import { Cache } from "@daiso-tech/core/cache";
import { ListCollection } from "@daiso-tech/core/collection";
import Redis from "ioredis";

const serde = new Serde(new SuperJsonSerdeAdapter());
serde.registerClass(ListCollection);

const cache = new Cache({
    namespace: new Namespace("cache"),
    adapter: new RedisCacheAdapter({
        database: new Redis("YOUR_REDIS_CONNECTION_STRING"),
        serde,
    }),
});

const listCollection = new ListCollection(["a", "b", "c", "d", "e"]);

await cache.add("list", listCollection);

const deserializedListCollection = await cache.get("list");
if (deserializedListCollection) {
    // Logs "c"
    console.log(deserializedListCollection.getOrFail(2));
}
```

:::info
Note you should use one [`Serde`](https://yousif-khalil-abdulkarim.github.io/daiso-core/modules/Serde.html) class instance accross all components and register all serializable objects before component usage.
:::

## Seperating serialization, deserialization and registering custom serialization/deserialization logic

The library includes 4 additional contracts:

-   [`ISerializer`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Serde.ISerializer.html) - Allows only for serialization.

-   [`IDeserializer`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Serde.IDeserializer.html) - Allows only for deserialization.

-   [`ISerde`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Serde.ISerde.html) - Allows for both serialization and deserialization.

-   [`IFlexibleSerde`](https://yousif-khalil-abdulkarim.github.io/daiso-core/interfaces/Serde.IFlexibleSerde.html) – Allows for both serialization and deserialization. Allows also for customizable serialization/deserialization logic.

-   [`ISerderRegister`](https://yousif-khalil-abdulkarim.github.io/daiso-core/interfaces/Serde.ISerderRegister.html) - Allows only for regestering custom serialization and deserialization logic.

This seperation makes it easy to visually distinguish the 4 contracts, making it immediately obvious that they serve different purposes.
