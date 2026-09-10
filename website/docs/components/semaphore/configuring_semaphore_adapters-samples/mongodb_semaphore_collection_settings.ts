import { MongodbSemaphoreAdapter } from "eridu-tech/semaphore/mongodb-semaphore-adapter";
import { MongoClient } from "mongodb";

const client = await MongoClient.connect("YOUR_MONGODB_CONNECTION_STRING");
const database = client.db("database");
const mongodbSemaphoreAdapter = new MongodbSemaphoreAdapter({
    database,
    // You configure additional collection settings
    collectionSettings: {},
});

await mongodbSemaphoreAdapter.init();
