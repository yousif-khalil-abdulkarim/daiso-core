import { MongodbLockAdapter } from "eridu-tech/lock/mongodb-lock-adapter";
import { MongoClient } from "mongodb";

const client = await MongoClient.connect("YOUR_MONGODB_CONNECTION_STRING");
const database = client.db("database");
const mongodbLockAdapter = new MongodbLockAdapter({
    database,
    // You configure additional collection settings
    collectionSettings: {},
});

await mongodbLockAdapter.init();
