import { Serde } from "eridu-tech/serde";
import { SuperJsonSerdeAdapter } from "eridu-tech/serde/super-json-serde-adapter";

export const serde = new Serde(new SuperJsonSerdeAdapter());
