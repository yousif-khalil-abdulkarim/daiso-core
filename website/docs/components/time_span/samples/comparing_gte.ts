import { TimeSpan } from "eridu-tech/time-span";

// Returns false
TimeSpan.fromSeconds(1).gte(TimeSpan.fromSeconds(2));
