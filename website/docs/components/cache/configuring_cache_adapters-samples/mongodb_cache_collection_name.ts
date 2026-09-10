import { MongodbCacheAdapter } from "eridu-tech/cache/mongodb-cache-adapter";
import { Serde } from "eridu-tech/serde";
import { SuperJsonSerdeAdapter } from "eridu-tech/serde/super-json-serde-adapter";
import { MongoClient } from "mongodb";

const client = await MongoClient.connect("YOUR_MONGODB_CONNECTION_STRING");
const database = client.db("database");
const serde = new Serde(new SuperJsonSerdeAdapter());
const mongodbCacheAdapter = new MongodbCacheAdapter({
    database,
    serde,
    // By default "cache" is used as collection name
    collectionName: "my-cache",
});

await mongodbCacheAdapter.init();
