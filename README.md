# @daiso-tech/core

## Install
```bash
npm install @daiso-tech/core
```

## Description
The library provides modular solutions for the essential features needed in modern web applications. Stop wasting time searching for packages or reinventing the wheel — this framework-agnostic library, built on adaptable components, works well with popular frameworks like Express.js, Fastify, Nest.js, Next.js, Nuxt.js, SvelteKit, and Remix.

As of now the library includes:
* A set of immutable collection classes that simplifies working with iterables and async iterables.

In the future the following components will be added:
* Key value storage adapters that provides a single interface for interacting with different databases.

* TTL (Time To Live) Cache adapters that provides a single interface for interacting with different databases.

* File storage adapters that provides a single interface for interacting with different filesystems.

* A HTTP client built on the web standard Fetch API, featuring a middleware plugin system that includes predefined plugins for retry, timeout, and caching.

* Task scheduling adapters that provides a single interface for easily scheduling recuring jobs.

* Job queue adapters that provides a single interface for ofloading slow jobs to a background queue.
 
* Notification adapters that provides a single interface for quickly notifications to your users via email, Slack, SMS and in-app.

This library is heavily inspired laravel but built in modular way where you can choose which part to use.

## Visit the [docs](https://yousif-khalil-abdulkarim.github.io/daiso-core/docs/) for more information!
