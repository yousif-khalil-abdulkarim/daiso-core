import { describe, expect, test } from "vitest";
import { serializerTestSuite } from "@/serializer/implementations/_shared/test-utilities/_module";
import { SqlSerializer } from "@/serializer/implementations/sql-serializer/_module";
import { SuperJsonSerializer } from "@/serializer/implementations/super-json-serializer/_module";

describe("class: SqlSerializer", () => {
    serializerTestSuite({
        createAdapter: () => new SqlSerializer(new SuperJsonSerializer()),
        expect,
        test,
    });
});
