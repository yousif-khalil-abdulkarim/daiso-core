import { MongodbSharedLockAdapter } from "eridu-tech/shared-lock/mongodb-shared-lock-adapter";
import { MongoClient } from "mongodb";

const client = await MongoClient.connect("YOUR_MONGODB_CONNECTION_STRING");
const database = client.db("database");
const mongodbSharedLockAdapter = new MongodbSharedLockAdapter({
    database,
    // You configure additional collection settings
    collectionSettings: {},
});

await mongodbSharedLockAdapter.init();
