# @daiso-tech/core

[![npm version](https://img.shields.io/npm/v/@daiso-tech/core)](https://www.npmjs.com/package/@daiso-tech/core)
![NPM Downloads](https://img.shields.io/npm/dy/@daiso-tech/core)
![Static Badge](https://img.shields.io/badge/TypeScript-3178C6?logo=TypeScript&logoColor=white)
[![ES Modules](https://img.shields.io/badge/module%20type-ESM-blue)](https://nodejs.org/api/esm.html)
[![License](https://img.shields.io/npm/l/@daiso-tech/core)](LICENSE)


A modular, framework-agnostic library providing essential components for modern web applications. Stop reinventing the wheel - focus on building your application while the library handles the core functionalities.

## ✨ Features

### Current Features

-   **Immutable Collections**:

    -   `IterableCollection` - Simplifies work with `Iterable`
    -   `ListCollection` - Simplifies work with `Array`
    -   `AsyncIterableCollection` - Simplifies work with `AsyncIterable`

-   **Middleware System**
    -   Agnostic middlewares applicable to any async/sync functions.
        -   `fallback`: Automatic recovery with default values on errors
        -   `observe`: Monitor function execution and performance
        -   `retry`: Smart retries with multiple backoff policies:
            -   `constantBackoffPolicy`
            -   `exponentialBackoffPolicy`
            -   `linearBackoffPolicy`
            -   `polynomialBackoffPolicy`
        -   `sequentialHedging`: Runs fallbacks sequentially if the primary function fails, ensuring graceful failure handling.
        -   `concurrentHedging`: Executes the primary function alongside fallbacks concurrently, returning the first successful result and aborting all remaining operations.
        -   `timeout`: Guaranteed execution time limits
-   **LazyPromise**:
    -   Executes only when awaited
    -   With middleware support
-   **Pluggable Components**:
    -   `Cache` with adapter support
    -   `Lock` with adapter support
    -   `EventBus` with adapter support
    -   `Serde` (serializer, deserializer) adapters

### Planned Features

-   Query bus
-   Command bus
-   Semaphore component
-   SharedLock (ReaderWriterLock)
-   RateLimiter
-   CircuitBreaker
-   MessageQueue
-   TaskScheduler
-   Notification system
-   Abstract file system

## 🚀 Installation

```bash
npm install @daiso-tech/core
```

## Inspired By

Built with ideas from:

-   [Laravel](https://laravel.com/docs/11.x/readme), PHP
-   [Symfony components](https://symfony.com/components), PHP
-   [Verrou](https://verrou.dev/docs/introduction), TypeScript
-   [Distributed lock](https://github.com/ZiggyCreatures/FusionCache), C#
-   [Bento cache](https://bentocache.dev/docs/introduction), TypeScript
-   [Fusion cache](https://github.com/ZiggyCreatures/FusionCache), C#
-   [Polly](https://www.pollydocs.org/), C#
