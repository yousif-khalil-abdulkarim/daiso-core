---
sidebar_position: 1
---

# TimeSpan

The [`TimeSpan`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Utilities.TimeSpan.html) class is used for representing time interval.

:::info
Note [`TimeSpan`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Utilities.TimeSpan.html) cannot be negative.
:::

### Creating a TimeSpan

Creating [`TimeSpan`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Utilities.TimeSpan.html) from milliseconds:

```ts
const timeSpan = TimeSpan.fromMilliseconds(100);
```

Creating [`TimeSpan`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Utilities.TimeSpan.html) from seconds:

```ts
const timeSpan = TimeSpan.fromSeconds(30);
```

Creating [`TimeSpan`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Utilities.TimeSpan.html) from minutes:

```ts
const timeSpan = TimeSpan.fromMinutes(15);
```

Creating [`TimeSpan`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Utilities.TimeSpan.html) from hours:

```ts
const timeSpan = TimeSpan.fromHours(1);
```

Creating [`TimeSpan`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Utilities.TimeSpan.html) from days:

```ts
const timeSpan = TimeSpan.fromDays(1);
```

Creating [`TimeSpan`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Utilities.TimeSpan.html) from date range:

```ts
const timeSpan = TimeSpan.fromDateRange(
    new Date("2000-01-01"),
    new Date("2010-01-01"),
);
```

### Adding time to TimeSpan

You can add milliseconds to a [`TimeSpan`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Utilities.TimeSpan.html):

```ts
timeSpan.addMilliseconds(200);
```

You can add seconds to a [`TimeSpan`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Utilities.TimeSpan.html):`

```ts
timeSpan.addSeconds(30);
```

You can add minutes to a [`TimeSpan`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Utilities.TimeSpan.html):

```ts
timeSpan.addMinutes(20);
```

You can add hours to a [`TimeSpan`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Utilities.TimeSpan.html):

```ts
timeSpan.addHours(2);
```

You can add days to a [`TimeSpan`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Utilities.TimeSpan.html):

```ts
timeSpan.addDays(14);
```

You can add 2 [`TimeSpan`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Utilities.TimeSpan.html) together:

```ts
timeSpan.addTimeSpan(TimeSpan.fromDays(14).addHours(20));
```

### Subtracting time from TimeSpan

You can subtract milliseconds from a [`TimeSpan`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Utilities.TimeSpan.html):

```ts
timeSpan.subtractMilliseconds(200);
```

You can subtract seconds from a [`TimeSpan`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Utilities.TimeSpan.html):`

```ts
timeSpan.subtractSeconds(30);
```

You can subtract minutes from a [`TimeSpan`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Utilities.TimeSpan.html):

```ts
timeSpan.subtractMinutes(20);
```

You can subtract hours from a [`TimeSpan`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Utilities.TimeSpan.html):

```ts
timeSpan.subtractHours(2);
```

You can subtract days from a [`TimeSpan`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Utilities.TimeSpan.html):

```ts
timeSpan.subtractDays(14);
```

You can subtract 2 [`TimeSpan`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Utilities.TimeSpan.html) together:

```ts
timeSpan.subtractTimeSpan(TimeSpan.fromDays(14).addHours(20));
```

### Multiplying and dividing a TimeSpan

Dividing a timespan:

```ts
// Will be now 100 miliseconds
TimeSpan.fromMilliseconds(200).divide(2);
```

Multiplying a timespan:

```ts
// Will be now 400 miliseconds
TimeSpan.fromMilliseconds(200).multiply(2);
```

### Converting a TimeSpan

You can get amount of milliseconds contained in the [`TimeSpan`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Utilities.TimeSpan.html):

```ts
TimeSpan.fromSeconds(1).toMilliseconds();
```

You can get amount of seconds contained in the [`TimeSpan`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Utilities.TimeSpan.html):

```ts
TimeSpan.fromMinutes(1).toSeconds();
```

You can get amount of minutes contained in the [`TimeSpan`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Utilities.TimeSpan.html):

```ts
TimeSpan.fromHour(1).toMinutes();
```

You can get amount of hours contained in the [`TimeSpan`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Utilities.TimeSpan.html):

```ts
TimeSpan.fromDays(1).toHours();
```

You can get amount of days contained in the [`TimeSpan`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Utilities.TimeSpan.html):

```ts
TimeSpan.fromHour(48).toDays();
```

You can get end date relative to a start date:

```ts
// Will return date of "2002-01-01"
TimeSpan.fromDays(365).toEndDate(new Date("2001-01-01"));
```

You can get start date relative to a end date:

```ts
// Will return date of "2000-01-01"
TimeSpan.fromDays(365).toStartDate(new Date("2001-01-01"));
```

### Serialization and deserialization of TimeSpan

The [`TimeSpan`](https://yousif-khalil-abdulkarim.github.io/daiso-core/classes/Utilities.TimeSpan.html) class supports serialization and deserialization, allowing you to easily convert instances to and from serialized formats. However, registration is required first:

```ts
import { Serde } from "@daiso-tech/core/serde";
import { SuperJsonSerdeAdapter } from "@daiso-tech/core/serde/adapters";
import { TimeSpan } from "@daiso-tech/core/utilities";

const serde = new Serde(new SuperJsonSerdeAdapter());

serde.registerClass(TimeSpan);

const timeSpan = TimeSpan.fromSeconds(12);
const serializedTimeSpan = serde.serialize(timeSpan);
const deserializedTimeSpan = serde.deserialize(serializedTimeSpan);
```
