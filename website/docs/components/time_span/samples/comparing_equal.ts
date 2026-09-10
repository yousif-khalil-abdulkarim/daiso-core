import { TimeSpan } from "eridu-tech/time-span";

// Returns false
TimeSpan.fromSeconds(1).equals(TimeSpan.fromSeconds(2));
