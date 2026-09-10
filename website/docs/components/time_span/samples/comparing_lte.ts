import { TimeSpan } from "eridu-tech/time-span";

// Returns true
TimeSpan.fromSeconds(1).lte(TimeSpan.fromSeconds(2));
