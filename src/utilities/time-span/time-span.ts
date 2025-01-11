/**
 * @module Utilities
 */

/**
 * The <i>TimeSpan</i> class is used for representing time interval that is the difference between two times measured in a number of days, hours, minutes, and seconds.
 * <i>TimeSpan</i> cannot be negative.
 * @group Time utilities
 */
export class TimeSpan {
    private static secondInMilliseconds = 1000;
    private static minuteInMilliseconds = 60 * TimeSpan.secondInMilliseconds;
    private static hourInMilliseconds = 60 * TimeSpan.minuteInMilliseconds;
    private static dayInMilliseconds = 24 * TimeSpan.hourInMilliseconds;

    private constructor(private readonly milliseconds: number = 0) {
        this.milliseconds = Math.max(0, this.milliseconds);
    }

    static fromMilliseconds(milliseconds: number): TimeSpan {
        return new TimeSpan().addMilliseconds(milliseconds);
    }

    static fromSeconds(seconds: number): TimeSpan {
        return new TimeSpan().addSeconds(seconds);
    }

    static fromMinutes(minutes: number): TimeSpan {
        return new TimeSpan().addMinutes(minutes);
    }

    static fromHours(hours: number): TimeSpan {
        return new TimeSpan().addHours(hours);
    }

    static fromDays(days: number): TimeSpan {
        return new TimeSpan().addDays(days);
    }

    static fromTimeSpan(timeSpan: TimeSpan): TimeSpan {
        return new TimeSpan().addTimeSpan(timeSpan);
    }

    static fromDateRange(from: Date, to: Date): TimeSpan {
        return new TimeSpan().addMilliseconds(to.getTime() - from.getTime());
    }

    addMilliseconds(milliseconds: number): TimeSpan {
        return new TimeSpan(this.toMilliseconds() + milliseconds);
    }

    addSeconds(seconds: number): TimeSpan {
        return this.addMilliseconds(TimeSpan.secondInMilliseconds * seconds);
    }

    addMinutes(minutes: number): TimeSpan {
        return this.addMilliseconds(TimeSpan.minuteInMilliseconds * minutes);
    }

    addHours(hours: number): TimeSpan {
        return this.addMilliseconds(TimeSpan.hourInMilliseconds * hours);
    }

    addDays(days: number): TimeSpan {
        return this.addMilliseconds(TimeSpan.dayInMilliseconds * days);
    }

    addTimeSpan(timeSpan: TimeSpan): TimeSpan {
        return this.addMilliseconds(timeSpan.toMilliseconds());
    }

    subtractMilliseconds(milliseconds: number): TimeSpan {
        return new TimeSpan(this.toMilliseconds() - milliseconds);
    }

    subtractSeconds(seconds: number): TimeSpan {
        return this.subtractMilliseconds(
            TimeSpan.secondInMilliseconds * seconds,
        );
    }

    subtractMinutes(minutes: number): TimeSpan {
        return this.subtractMilliseconds(
            TimeSpan.minuteInMilliseconds * minutes,
        );
    }

    subtractHours(hours: number): TimeSpan {
        return this.subtractMilliseconds(TimeSpan.hourInMilliseconds * hours);
    }

    subtractDays(days: number): TimeSpan {
        return this.subtractMilliseconds(TimeSpan.dayInMilliseconds * days);
    }

    subtractTimeSpan(timeSpan: TimeSpan): TimeSpan {
        return this.subtractMilliseconds(timeSpan.toMilliseconds());
    }

    multiply(value: number): TimeSpan {
        return new TimeSpan(Math.round(value * this.toMilliseconds()));
    }

    divide(value: number): TimeSpan {
        return new TimeSpan(Math.round(this.toMilliseconds() / value));
    }

    toMilliseconds(): number {
        return this.milliseconds;
    }

    toSeconds(): number {
        return Math.floor(this.milliseconds / TimeSpan.secondInMilliseconds);
    }

    toMinutes(): number {
        return Math.floor(this.milliseconds / TimeSpan.minuteInMilliseconds);
    }

    toHours(): number {
        return Math.floor(this.milliseconds / TimeSpan.hourInMilliseconds);
    }

    toDays(): number {
        return Math.floor(this.milliseconds / TimeSpan.dayInMilliseconds);
    }

    toUTCTimestamp(): number {
        return Math.round(this.toMilliseconds() / 1000);
    }

    /**
     * Will return endDate relative to a given <i>startDate</i> argument.
     * @default {new Date()} - current date
     */
    toEndDate(startDate = new Date()): Date {
        return new Date(startDate.getTime() + this.toMilliseconds());
    }

    /**
     * Will return startDate relative to a given <i>endDate</i> argument.
     * @default {new Date()} - current date
     */
    toStartDate(endDate = new Date()): Date {
        return new Date(endDate.getTime() - this.toMilliseconds());
    }
}
