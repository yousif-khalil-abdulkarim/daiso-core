import { describe, expect, test } from "vitest";
import { serializerTestSuite } from "@/serializer/implementations/_shared/test-utilities/_module";
import { RedisSerializer } from "@/serializer/implementations/redis-serializer/_module";
import { SuperJsonSerializer } from "@/serializer/implementations/super-json-serializer/_module";

describe("class: RedisSerializer", () => {
    serializerTestSuite({
        createAdapter: () => new RedisSerializer(new SuperJsonSerializer()),
        expect,
        test,
    });
});
