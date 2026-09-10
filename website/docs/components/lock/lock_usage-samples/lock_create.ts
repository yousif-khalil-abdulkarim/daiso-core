import { lockFactory } from "./lock_factory_initial_config";

export const lock = lockFactory.create("shared-resource");
