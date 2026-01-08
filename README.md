[![npm version](https://img.shields.io/npm/v/@daiso-tech/core)](https://www.npmjs.com/package/@daiso-tech/core)
![NPM Downloads](https://img.shields.io/npm/dy/@daiso-tech/core)
![Static Badge](https://img.shields.io/badge/TypeScript-3178C6?logo=TypeScript&logoColor=white)
[![ES Modules](https://img.shields.io/badge/module%20type-ESM-blue)](https://nodejs.org/api/esm.html)
[![License](https://img.shields.io/npm/l/@daiso-tech/core)](LICENSE)

# @daiso-tech/core

`@daiso-tech/core` is a TypeScript-first backend library for building web apps and API servers. It includes an ecosystem of official packages designed to work seamlessly together.

**@daiso-tech/core** is a library of backend server components designed for maximum flexibility. While each component is fully functional on its own, they are written to work seamlessly together to build robust server-side logic.

Key Features:
- **Framework Agnostic:** Built without a dependency injection (DI) container, the library integrates effortlessly into any framework / library. Whether you use Express.js, backend frameworks like AdonisJS or NestJS, or full-stack frameworks like Next.js, Nuxt, or TanStack Start, these components "just work."

- **Runtime Portability:** By leveraging the Adapter Pattern, the library remains decoupled from specific runtimes. Easily implement custom adapters, such as Cloudflare Durable Objects or Amazon DynamoDB, for better serverless integration with cloudflare workers or aws lambda.

- **Test Friendly:** Testing is simple because every component comes with an "in-memory" adapter. This means you can run your tests instantly without needing to connect to a real database or server.

- **Developer Friendly:** Save time with high-quality documentation and a readable, well-documented codebase. Clear comments and a logical structure make it easy to understand and extend system functionality.

- **Type safe:**
  We pay a closer look at type-safety, seamless intellisense, and support for auto imports when designing library APIs.

- **ESM ready:**
  @daiso-tech/core leverages modern JavaScript primitives, including ES modules

- **Supports standard schema:**
  Integrated seamlessly with [standard schema](https://standardschema.dev/) allowing you to use libraries like zod to ensure both compile time and runtime typesafety.

[Get started now](https://daiso-core.vercel.app/docs/Installation)

## A growing collection of officially maintained components

- **Cache:**
  Speed up your applications by storing slowly changing data in a cache store.

- **EventBus:**
  Easily send events accross different applications or in-memory.

- **Circuit-breaker:**
  A circuit-breaker is a resilience primitive preventing cascading failures from external services by stopping calls to a failing service.

- **Lock:**
  Synchronize the access to a shared resource to prevents several processes, or concurrent code, from executing a section of code at the same time.

- **Semaphore:**
  A semaphore is a concurrency control primitive used to limit the number of processes or systems that can access a shared resource of code concurrently.

- **Shared-lock:**
  A shared-lock (a.k.a reader writer lock) is a concurrency primitive offering better concurrency than a lock by coordinating a reader semaphore for concurrent access and an writer lock for mutual exclusion, strictly preventing conflicting simultaneous access and maintaining data consistency.

- **Serde:**
  Add custom serialization and deserialization logic that seamlessly integrates with all other components.

- **Collection:**
  Effortlessly work with Arrays, Iterables, and AsyncIterables. Filter and transform with precision.

- **Hooks:**
  Extend any sync and async function with agnostic hooks.@daiso-tech/core includes predefined retry, fallback, timeout and hedging hooks to easily allow handling transient failures.

