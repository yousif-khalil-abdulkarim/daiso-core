import { TimeSpan } from "eridu-tech/time-span";

// Returns false
TimeSpan.fromSeconds(1).gt(TimeSpan.fromSeconds(2));
