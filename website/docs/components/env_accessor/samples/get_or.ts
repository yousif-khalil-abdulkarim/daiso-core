import { accessor } from "./env_accessor_initial_config.js";

accessor.getOr("NODE_ENV", "DEV");
