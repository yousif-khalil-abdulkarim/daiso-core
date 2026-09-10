import { lockFactory } from "./lock_factory_initial_config.js";

export const lock = lockFactory.create("shared-resource");
