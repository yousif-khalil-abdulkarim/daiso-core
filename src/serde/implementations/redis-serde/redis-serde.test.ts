import { describe, expect, test } from "vitest";
import { serdeTestSuite } from "@/serde/implementations/_shared/test-utilities/_module";
import { RedisSerde } from "@/serde/implementations/redis-serde/_module";
import { SuperJsonSerde } from "@/serde/implementations/super-json-serde/_module";

describe("class: RedisSerde", () => {
    serdeTestSuite({
        createAdapter: () => new RedisSerde(new SuperJsonSerde()),
        expect,
        test,
    });
});
