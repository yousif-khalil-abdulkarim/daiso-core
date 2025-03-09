# @daiso-tech/core

## Installation
```bash
npm install @daiso-tech/core
```

## Description
The library provides modular solutions for the essential features needed in modern web applications. Stop wasting time searching for packages or reinventing the wheel — this framework-agnostic library, built on adaptable components, works well with popular frameworks like Express.js, Fastify, Next.js, Nuxt.js, SvelteKit, and Remix.

### Current Library Features:
- Immutable collection components:
  - Immutable <i>IterableCollection</i> that simplifies working with <i>Iterable</i>.
  - Immutable <i>ListCollection</i> that simplifies working with <i>Array</i>.
  - Immutable <i>AsyncIterableCollection</i> that simplifies working with <i>AsyncIterable</i>.
- LazyPromise with support for: 
  - Aborting it manually by using <i>AbortSignal</i>.
  - Aborting it by timeout.
  - Easily retrying when it fails
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

#### NOTE !!: This library only supports ESM (ecmascript) module.

#### NOTE !!: This library is under construction and breaking changes can occur.

### Inspiration
This library is inspired by [Laravel](https://laravel.com/docs/11.x/readme) and built with a modular design, so you can use only the parts you need.

It also integrates ideas from other libraries:
- [Symfony components](https://symfony.com/components), PHP
- [Verrou](https://verrou.dev/docs/introduction), TypeScript
- [Distributed lock](https://github.com/ZiggyCreatures/FusionCache), C#
- [Bento cache](https://bentocache.dev/docs/introduction), TypeScript
- [Fusion cache](https://github.com/ZiggyCreatures/FusionCache), C#
- [Polly](https://www.pollydocs.org/), C#


### Visit the [docs](https://yousif-khalil-abdulkarim.github.io/daiso-core/) for more information!