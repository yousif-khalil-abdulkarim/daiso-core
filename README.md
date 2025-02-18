# @daiso-tech/core

## Installation
```bash
npm install @daiso-tech/core
```

## Description
The library provides modular solutions for the essential features needed in modern web applications. Stop wasting time searching for packages or reinventing the wheel — this framework-agnostic library, built on adaptable components, works well with popular frameworks like Express.js, Fastify, Nest.js, Next.js, Nuxt.js, SvelteKit, and Remix.

### Current Library Features:
- Immutable collection components:
  - Immutable <i>IterableCollection</i> that simplifies working with <i>Iterable</i>.
  - Immutable <i>ListCollection</i> that simplifies working with <i>Array</i>.
  - Immutable <i>AsyncIterableCollection</i> that simplifies working with <i>AsyncIterable</i>.
- Cache component with support for pluggable adapters.
- Lock component with supports for pluggable adapters.
- EventBus component with support for pluggable adapters.

### In the future the following components will be added:
- Command bus
- Semaphore component
- SharedLock (ReaderWriterLock) component
- RateLimter component
- CircuitBreaker component
- MessageQueue component
- TaskScheduler component
- Notification component
- Abstract file system component 

This library is heavily inspired laravel but built in modular way where you can choose which part to use.

#### NOTE: This library only a ESM (ecmascript) module.

### Visit the [docs](https://yousif-khalil-abdulkarim.github.io/daiso-core/) for more information!
