import { describe, expect, test } from "vitest";
import { serializerTestSuite } from "@/serializer/_shared/test-utilities/_module";
import { SuperJsonSerializer } from "@/serializer/super-json-serializer/super-json-serializer";

describe("class: SuperJsonSerializer", () => {
    serializerTestSuite({
        createAdapter: () => new SuperJsonSerializer(),
        expect,
        test,
    });
});
