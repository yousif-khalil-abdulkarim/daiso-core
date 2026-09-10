import { TimeSpan } from "eridu-tech/time-span";

// Will return date of "2002-01-01"
TimeSpan.fromDays(365).toEndDate(new Date("2001-01-01"));
