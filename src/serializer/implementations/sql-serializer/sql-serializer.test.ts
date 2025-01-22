import { describe, expect, test } from "vitest";
import { serdeTestSuite } from "@/serializer/implementations/_shared/test-utilities/_module";
import { SqlSerializer } from "@/serializer/implementations/sql-serializer/_module";
import { SuperJsonSerializer } from "@/serializer/implementations/super-json-serializer/_module";

describe("class: SqlSerializer", () => {
    serdeTestSuite({
        createAdapter: () => new SqlSerializer(new SuperJsonSerializer()),
        expect,
        test,
    });
});
