import { describe, expect, test } from "vitest";
import { serdeTestSuite } from "@/serializer/implementations/_shared/test-utilities/_module";
import { RedisSerializer } from "@/serializer/implementations/redis-serializer/_module";
import { SuperJsonSerializer } from "@/serializer/implementations/super-json-serializer/_module";

describe("class: RedisSerializer", () => {
    serdeTestSuite({
        createAdapter: () => new RedisSerializer(new SuperJsonSerializer()),
        expect,
        test,
    });
});
