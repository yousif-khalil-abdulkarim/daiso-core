import { genericToken } from "eridu-tech/di/contracts";
import type { IDatabase } from "./idatabase.js";

// token created with genericToken where
// `"Database service"` is the description and `IDatabase` is the phantom type.
export const IDATABASE = genericToken<IDatabase>("Database service");
