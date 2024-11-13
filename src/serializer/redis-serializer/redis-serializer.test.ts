import { describe, expect, test } from "vitest";
import { serializerTestSuite } from "@/serializer/_shared/test-utilities/_module";
import { RedisSerializer } from "@/serializer/redis-serializer/_module";
import { SuperJsonSerializer } from "@/serializer/super-json-serializer/_module";

describe("class: RedisSerializer", () => {
    serializerTestSuite({
        createAdapter: () => new RedisSerializer(new SuperJsonSerializer()),
        expect,
        test,
    });
});
