---
sidebar_position: 6
sidebar_label: Creating policies
pagination_label: Creating circuit-breaker policies
---

# Creating policies

## Implementing your custom ICircuitBreakerPolicy

In order to create custom circuit-breaker you need to implement the [`ICircuitBreakerPolicy`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/CircuitBreaker.ICircuitBreakerPolicy.html) contract. Custom circuit breaker policies can be used with [`DatabaseCircuitBreakerAdapter`](./configuring_circuit_breaker_adapters.md#databasecircuitbreakeradapter) and [`DatabaseCircuitBreakerProviderFactory`](./circuit_breaker_provider_factory.md#databasecircuitbreakerproviderfactory).

To understand how to implement a custom [`ICircuitBreakerPolicy`](https://yousif-khalil-abdulkarim.github.io/daiso-core/types/CircuitBreaker.ICircuitBreakerPolicy.html), refer to the [`ConsecutiveBreaker`](https://github.com/yousif-khalil-abdulkarim/daiso-core/blob/main/src/circuit-breaker/implementations/policies/consecutive-breaker/consecutive-breaker.ts) implementation.

## Further information

For further information refer to [`@daiso-tech/core/circuit-breaker`](https://yousif-khalil-abdulkarim.github.io/daiso-core/modules/CircuitBreaker.html) API docs.