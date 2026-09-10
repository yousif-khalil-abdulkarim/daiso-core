---
sidebar_position: 6
sidebar_label: Plugins
pagination_label: EventBus plugin
tags:
    - EventBus
    - Plugins
keywords:
    - EventBus
    - Plugins
    - withEventBusPrefix
    - withEventBusSchema
    - withListenerTracking
---

# EventBus Plugins

## withEventBusPrefix plugin

The EventBus prefix plugin intercepts calls to an event bus adapter and transparently prefixes all event names with a configurable string. This enables logical event namespace isolation without modifying the adapter implementation.

### Use cases

- **Multi-tenant systems** — Prefix event names with a tenant identifier to isolate events between tenants
- **Environment isolation** — Separate development, staging, and production event streams
- **Module scoping** — Organize events by feature or module to avoid naming collisions

### How it works

The `withEventBusPrefix` function returns a [`PluginFn`](/docs/components/middleware) that calls `enhance` on each adapter method that accepts an event name. When an enhanced method is invoked, the plugin intercepts the call, prepends the configured prefix to the event name argument, and forwards the modified arguments to the original method.

The plugin prefixes event names for the following methods:

| Method           | Event name argument | Pattern        |
| ---------------- | ------------------- | -------------- |
| `dispatch`       | First argument      | `prefix + key` |
| `addListener`    | First argument      | `prefix + key` |
| `removeListener` | First argument      | `prefix + key` |

### Usage

```ts file=./event_bus_plugin-samples/with_event_bus_prefix.ts

```

### Before/after behavior

**Before** — Event names are used as-is:

```ts file=./event_bus_plugin-samples/unprefixed_dispatch.ts

```

**After** — Event names are automatically prefixed:

```ts file=./event_bus_plugin-samples/prefixed_dispatch.ts

```

:::danger
Because `withPlugin` uses `enhance` under the hood, the same edge case applies: if one enhanced method internally calls another enhanced method via `this`, the middleware will apply **twice**. Be mindful of inter-method calls when applying plugins that enhance multiple methods on the same instance.
:::

:::info
For more information about the `withPlugin` function and applying plugins to adapters, see the [Middleware plugin](/docs/components/middleware#plugin) documentation.
:::

## withListenerTracking plugin

The `withListenerTracking` plugin wraps another plugin with automatic listener-reference tracking. When a middleware plugin intercepts `addListener` and wraps the listener function, the adapter stores the wrapped reference. If the caller later invokes `removeListener` with the original listener, the adapter cannot find it — the reference has changed.

This plugin solves that problem by ensuring that `removeListener` with the original listener correctly resolves through the chain.

### Use cases

- **Listener reference transparency** — Callers can use the original listener function with `removeListener` even when a plugin wraps the listener in `addListener`
- **Plugin safety** — Wrap plugins that transform listeners in `addListener` (for example a plugin that wraps the listener to add logging or validation) to ensure `removeListener` still resolves correctly
- **Per-plugin tracking** — Apply `withListenerTracking` to each plugin that wraps listeners; it does not automatically handle wrapping from other plugins in the chain

:::info
This plugin is only needed if you call `removeListener` at runtime. If you only register listeners during startup and never remove them, listener-reference tracking is unnecessary.
:::

### How it works

`withListenerTracking` wraps the provided plugin and adds tracking layers around `addListener` and `removeListener` on the adapter. When `addListener` is called, the original listener is wrapped with a tracking wrapper and the mapping from original to wrapper is stored in a `ListenerStore` keyed by event name. On `removeListener`, the original listener is resolved back to the tracking wrapper through the store before forwarding the call down the chain.

The plugin execution order is:

1. The user plugin's enhancements are applied first (inner layer)
2. The tracking enhancements are applied second (outermost layer)

### Usage

```ts file=./event_bus_plugin-samples/with_listener_tracking.ts

```

#### Chaining multiple tracking calls

Multiple `withListenerTracking` calls can be composed together:

```ts file=./event_bus_plugin-samples/listener_tracking_chaining.ts

```

:::danger
Because `withPlugin` uses `enhance` under the hood, the same edge case applies: if one enhanced method internally calls another enhanced method via `this`, the middleware will apply **twice**. Be mindful of inter-method calls when applying plugins that enhance multiple methods on the same instance.
:::

:::info
For more information about the `withPlugin` function and applying plugins to adapters, see the [Middleware plugin](/docs/components/middleware#plugin) documentation.
:::
