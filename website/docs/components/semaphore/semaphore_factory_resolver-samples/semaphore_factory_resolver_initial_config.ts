import * as semaphore from "eridu-tech/semaphore";
import type {
    SemaphoreFactoryResolver as SemaphoreFactoryResolverType,
    SemaphoreFactoryResolverSettings,
} from "eridu-tech/semaphore";
import { MemorySemaphoreAdapter } from "eridu-tech/semaphore/memory-semaphore-adapter";
import { RedisSemaphoreAdapter } from "eridu-tech/semaphore/redis-semaphore-adapter";
import { Serde } from "eridu-tech/serde";
import { SuperJsonSerdeAdapter } from "eridu-tech/serde/super-json-serde-adapter";
import Redis from "ioredis";

const serde = new Serde(new SuperJsonSerdeAdapter());

type AdapterName = "memory" | "redis";

// Note: eridu-tech re-exports `SemaphoreFactoryResolver` from its `semaphore` entry point
// as a type-only export, so we resolve its constructor from the module namespace below
// while keeping the full public API type through `SemaphoreFactoryResolverType`.
const SemaphoreFactoryResolverCtor = (semaphore as any)
    .SemaphoreFactoryResolver as unknown as new (
    settings: SemaphoreFactoryResolverSettings<AdapterName>,
) => SemaphoreFactoryResolverType<AdapterName>;

export const semaphoreFactoryResolver = new SemaphoreFactoryResolverCtor({
    serde,
    adapters: {
        memory: new MemorySemaphoreAdapter(),
        redis: new RedisSemaphoreAdapter(new Redis("YOUR_REDIS_CONNECTION")),
    },
    // You can set an optional default adapter
    defaultAdapter: "memory",
});
