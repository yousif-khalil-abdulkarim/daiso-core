import { accessor } from "./env_accessor_initial_config";

accessor.getOr("NODE_ENV", "DEV");
