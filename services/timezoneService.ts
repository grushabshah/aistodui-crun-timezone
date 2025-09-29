import type { TimezoneData } from '../types';

let memoizedTimezoneData: TimezoneData | null = null;

export const groupTimezonesByOffset = (): TimezoneData => {
  if (memoizedTimezoneData) {
    return memoizedTimezoneData;
  }

  // FIX: Cast Intl to 'any' to call 'supportedValuesOf', which may not be in the
  // default TypeScript lib definitions. This silences the type error, assuming
  // the runtime environment supports this modern API.
  const timezones = (Intl as any).supportedValuesOf('timeZone');
  const now = new Date();
  
  // Use a specific date string to avoid issues with daylight saving transitions
  const dateString = now.toLocaleString('en-US', { timeZone: 'UTC' });
  const utcDate = new Date(dateString);

  // FIX: The `timezones` variable is of type `any`, so `reduce` is an untyped
  // function call that cannot accept type arguments. The fix is to remove the
  // generic and cast the initial value of the accumulator to `TimezoneData`.
  const grouped = timezones.reduce((acc, tz) => {
    try {
      const tzDate = new Date(now.toLocaleString('en-US', { timeZone: tz }));
      const offsetMinutes = (tzDate.getTime() - utcDate.getTime()) / 60000;
      
      if (acc[offsetMinutes]) {
        acc[offsetMinutes].push(tz);
      } else {
        acc[offsetMinutes] = [tz];
      }
    } catch (e) {
      console.warn(`Could not process timezone: ${tz}`, e);
    }
    return acc;
  }, {} as TimezoneData);

  memoizedTimezoneData = grouped;
  return grouped;
};

export const formatOffsetToString = (offsetMinutes: number): string => {
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absOffset = Math.abs(offsetMinutes);
  const hours = Math.floor(absOffset / 60).toString().padStart(2, '0');
  const minutes = (absOffset % 60).toString().padStart(2, '0');
  return `UTC ${sign}${hours}:${minutes}`;
};