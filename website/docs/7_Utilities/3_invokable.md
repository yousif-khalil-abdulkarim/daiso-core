---
sidebar_position: 3
---

# Invokable

An [`Invokable`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Utilities.Invokable.html) represents a callable entity, which can be either:

1. A function [`InvokableFn`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Utilities.InvokableFn.html)
2. An object with a specific invocation signature ([`IInvokableObject`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Utilities.IInvokableObject.html))

## Types

-   [`Invokable`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Utilities.Invokable.html) - Union type of [`InvokableFn`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Utilities.InvokableFn.html) and [`IInvokableObject`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Utilities.IInvokableObject.html)
-   [`InvokableFn`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Utilities.InvokableFn.html) - Function signature
-   [`IInvokableObject`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/Utilities.IInvokableObject.html) - Object with `invoke` method

## Function Invokable (`InvokableFn`)

Represents a standard function with typed parameters and return value.

```typescript
import type { InvokableFn } from "@daiso-tech/core/utilities";

// Using InvokableFn
type AddFunction = InvokableFn<[arg1: number, arg2: number], number>;

// Equivalent to:
type TraditionalFunction = (arg1: number, arg2: number) => number;
```

## Object Invokable (`IInvokableObject`)

An object that implements a callable contract through an invoke method. This pattern is especially useful for dependency injection (DI) integration, as most DI frameworks are adapted for class-based resolution.

```ts
import type { IInvokableObject } from "@daiso-tech/core/utilities";

class InvokableObject
    implements IInvokableObject<[arg1: number, arg2: number], number>
{
    invoke(arg1: number, arg: number2): number {
        throw new Error("Method not implemented.");
    }
}

const invokableObject: IInvokableObject<[arg1: number, arg2: number], number> =
    {
        invoke(arg1: number, arg: number2): number {
            throw new Error("Method not implemented.");
        },
    };
```
