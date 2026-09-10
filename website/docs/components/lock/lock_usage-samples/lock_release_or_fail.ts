import { lockFactory } from "./lock_factory_initial_config.js";

const lock = lockFactory.create("resource");

await lock.releaseOrFail();
