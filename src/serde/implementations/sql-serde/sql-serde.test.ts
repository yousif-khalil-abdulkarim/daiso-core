import { describe, expect, test } from "vitest";
import { serdeTestSuite } from "@/serde/implementations/_shared/test-utilities/_module";
import { SqlSerde } from "@/serde/implementations/sql-serde/_module";
import { SuperJsonSerde } from "@/serde/implementations/super-json-serde/_module";

describe("class: SqlSerde", () => {
    serdeTestSuite({
        createAdapter: () => new SqlSerde(new SuperJsonSerde()),
        expect,
        test,
    });
});
