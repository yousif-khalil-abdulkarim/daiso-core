[![npm version](https://img.shields.io/npm/v/@daiso-tech/core)](https://www.npmjs.com/package/@daiso-tech/core)
![NPM Downloads](https://img.shields.io/npm/dy/@daiso-tech/core)
![Static Badge](https://img.shields.io/badge/TypeScript-3178C6?logo=TypeScript&logoColor=white)
[![ES Modules](https://img.shields.io/badge/module%20type-ESM-blue)](https://nodejs.org/api/esm.html)
[![License](https://img.shields.io/npm/l/@daiso-tech/core)](LICENSE)

# @daiso-tech/core

`@daiso-tech/core` is a TypeScript-first backend library for building web apps and API servers. It includes an ecosystem of official packages designed to work seamlessly together.

[Get started now](https://daiso-core.vercel.app/docs/Installation)

- **Type safe:**
  We pay a closer look at type-safety, seamless intellisense, and support for auto imports when designing library APIs.

- **ESM ready:**
  @daiso-tech/core leverages modern JavaScript primitives, including ES modules

- **Easily testable:**
  @daiso-tech/core includes built-in [vitest](https://vitest.dev/) helpers for custom adapters and in-memory adapters for all components, enabling testing without Docker.

- **Supports standard schema:**
  Integrated seamlessly with [standard schema](https://standardschema.dev/) allowing you to use libraries like zod to ensure both compile time and runtimte typesafety.


## A growing collection of officially maintained components

- **Cache:**
  Speed up your applications by storing slowly changing data in a cache store.

- **EventBus:**
  Easily send events accross different applications or in-memory.

- **Distributed lock:**
  Synchronize the access to a shared resource to prevents several processes, or concurrent code, from executing a section of code at the same time.

- **Distributed semaphore:**
  A semaphore is a concurrency control primitive used to limit the number of processes or systems that can access a shared resource of code concurrently.

- **Distributed shared lock:**
  A shared lock (a.k.a reader writer lock) is a concurrency primitive offering better concurrency than a lock by coordinating a reader semaphore for concurrent access and an writer lock for mutual exclusion, strictly preventing conflicting simultaneous access and maintaining data consistency.

- **Serde:**
  Add custom serialization and deserialization logic that seamlessly integrates with all other components.

- **Collection:**
  Effortlessly work with Arrays, Iterables, and AsyncIterables. Filter and transform with precision.

- **Hooks:**
  Extend any sync and async function with agnostic hooks.@daiso-tech/core includes predefined retry, fallback, timeout and hedging hooks to easily allow handling transient failures.

