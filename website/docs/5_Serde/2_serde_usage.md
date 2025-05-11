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

Here is an example of serializing and deserializing a value.

```ts
const serializedValue = serde.serialize({
    name: "abra",
    age: 20,
});

const deserializedValue = serde.deserialize(serializedValue);
```

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

## Seperating serialization, deserialization and registering custom serialization/deserialization logic

The library includes 4 additional contracts:

-   [`ISerializer`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Serde.ISerializer.html) - Allows only for serialization.

-   [`IDeserializer`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Serde.IDeserializer.html) - Allows only for deserialization.

-   [`ISerde`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Serde.ISerde.html) - Allows for both serialization and deserialization.

-   [`IFlexibleSerde`](https://yousif-khalil-abdulkarim.github.io/daiso-core/interfaces/Serde.IFlexibleSerde.html) – Allows for both serialization and deserialization. Allows also fo customizable serialization/deserialization logic.

This seperation makes it easy to visually distinguish the 4 contracts, making it immediately obvious that they serve different purposes.
