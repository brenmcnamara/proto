import { Calendar } from './Calendar';

// TODO: LOOK AT HOW IOS CALENDAR OBJECT IS DEFINED.
export interface GregorianCalendar extends Calendar {
  timezone: TimeZone;
}

export type TimeZone = string; // moment timezone value

export interface DateComponents {
  day: number;
  hour: number;
  isTimeZoneAgnostic: boolean;
  minute: number;
  month: number;
  seconds: number;
  year: number;
}

export const Utils = {
  createDateFromDateComponents(
    components: DateComponents,
    calendar: GregorianCalendar,
  ): Date {
    throw Error('NOT YET IMPLEMENTED');
  },

  createDateComponentsFromDate(
    date: Date,
    calendar: GregorianCalendar,
  ): DateComponents {
    throw Error('NOT YET IMPLEMENTED');
  },
};

// TODO: SUPER THIN WRAPPER AROUND MOMENT JS
export const Formatter = {};
