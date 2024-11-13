import { describe, expect, test } from "vitest";
import { serializerTestSuite } from "@/serializer/_shared/test-utilities/_module";
import { MongodbSerializer } from "@/serializer/mongodb-serializer/_module";
import { SuperJsonSerializer } from "@/serializer/super-json-serializer/_module";

describe("class: MongodbSerializer", () => {
    serializerTestSuite({
        createAdapter: () => new MongodbSerializer(new SuperJsonSerializer()),
        expect,
        test,
    });
});
