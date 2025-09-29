import React, { useMemo } from 'react';
import { formatOffsetToString } from '../services/timezoneService';

interface TimezoneDisplayProps {
  offset: number;
  timezones: string[];
  currentTime: Date;
}

const getPart = (parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): string => {
  return parts.find(p => p.type === type)?.value ?? '';
};

export const TimezoneDisplay: React.FC<TimezoneDisplayProps> = ({ offset, timezones, currentTime }) => {
  const formattedOffset = useMemo(() => formatOffsetToString(offset), [offset]);

  const formatter = useMemo(() => {
    return new Intl.DateTimeFormat('en-CA', { // en-CA locale gives YYYY-MM-DD format
      timeZone: timezones[0], // Use the first timezone of the group for formatting
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  }, [timezones]);

  const isoLocalTime = useMemo(() => {
    const parts = formatter.formatToParts(currentTime);
    const year = getPart(parts, 'year');
    const month = getPart(parts, 'month');
    const day = getPart(parts, 'day');
    const hour = getPart(parts, 'hour');
    const minute = getPart(parts, 'minute');
    const second = getPart(parts, 'second');

    // FIX: The 'fractionalSecondDigits' formatter option and 'fractionalSecond' part type
    // are not available in older TypeScript lib definitions.
    // To resolve this, we remove the option and get milliseconds directly from the Date object.
    const milliseconds = currentTime.getMilliseconds().toString().padStart(3, '0');

    // Intl.DateTimeFormat can return '24' for hour at midnight. ISO 8601 requires '00'.
    const correctedHour = hour === '24' ? '00' : hour;

    return `${year}-${month}-${day}T${correctedHour}:${minute}:${second}.${milliseconds}`;
  }, [currentTime, formatter]);

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border-b border-gray-700 last:border-b-0 hover:bg-gray-700/50 transition-colors duration-200">
      <div className="w-full md:w-1/5 mb-2 md:mb-0">
        <span className="md:hidden font-bold text-gray-400 mr-2">Offset:</span>
        <span className="text-lg text-gray-300">{formattedOffset}</span>
      </div>
      <div className="w-full md:w-2/5 mb-2 md:mb-0 md:text-center">
        <span className="md:hidden font-bold text-gray-400 mr-2">Time:</span>
        <span className="text-xl sm:text-2xl text-cyan-300 tracking-wider">{isoLocalTime}</span>
      </div>
      <div className="w-full md:w-2/5 text-xs text-gray-500 md:text-right">
        <span>({timezones.join(', ')})</span>
      </div>
    </div>
  );
};