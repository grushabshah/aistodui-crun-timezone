import React, { useMemo, useCallback } from 'react';
import { formatOffsetToString } from '../services/timezoneService';

interface TimezoneDisplayProps {
  offset: number;
  timezones: string[];
  currentTime: Date;
  pastedTime: Date | null;
  onCopy: () => void;
}

const getPart = (parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): string => {
  return parts.find(p => p.type === type)?.value ?? '';
};

const formatTimeForDisplay = (date: Date, formatter: Intl.DateTimeFormat): string => {
    const parts = formatter.formatToParts(date);
    const year = getPart(parts, 'year');
    const month = getPart(parts, 'month');
    const day = getPart(parts, 'day');
    const hour = getPart(parts, 'hour');
    const minute = getPart(parts, 'minute');
    const second = getPart(parts, 'second');

    const milliseconds = date.getMilliseconds().toString().padStart(3, '0');
    const correctedHour = hour === '24' ? '00' : hour;

    return `${year}-${month}-${day}T${correctedHour}:${minute}:${second}.${milliseconds}`;
};

export const TimezoneDisplay: React.FC<TimezoneDisplayProps> = ({ offset, timezones, currentTime, pastedTime, onCopy }) => {

  const formattedOffset = useMemo(() => formatOffsetToString(offset), [offset]);

  const formatter = useMemo(() => {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: timezones[0],
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  }, [timezones]);

  const isoLocalTime = useMemo(() => formatTimeForDisplay(currentTime, formatter), [currentTime, formatter]);
  const isoPastedTime = useMemo(() => pastedTime ? formatTimeForDisplay(pastedTime, formatter) : null, [pastedTime, formatter]);
  
  const handleCopy = useCallback((text: string | null) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      onCopy();
    });
  }, [onCopy]);

  const timeColumnClasses = "text-xl sm:text-2xl text-cyan-300 tracking-wider";
  const timeContainerClasses = "w-full mb-2 md:mb-0 md:text-center relative flex items-center justify-center cursor-pointer";

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border-b border-gray-700 last:border-b-0 hover:bg-gray-700/50 transition-colors duration-200 text-sm">
      <div className="w-full md:w-1/5 mb-2 md:mb-0">
        <span className="md:hidden font-bold text-gray-400 mr-2">Offset:</span>
        <span className="text-base text-gray-300">{formattedOffset}</span>
      </div>

      <div
        className={`${timeContainerClasses} ${pastedTime ? 'md:w-[30%]' : 'md:w-2/5'}`}
        onClick={() => handleCopy(isoLocalTime)}
        aria-label="Copy live time to clipboard"
      >
        <span className="md:hidden font-bold text-gray-400 mr-2">Live Time:</span>
        <span className={timeColumnClasses}>{isoLocalTime}</span>
      </div>

      {pastedTime && (
         <div
            className={`${timeContainerClasses} md:w-[30%]`}
            onClick={() => handleCopy(isoPastedTime)}
            aria-label="Copy entered time to clipboard"
         >
            <span className="md:hidden font-bold text-gray-400 mr-2">Entered Time:</span>
            <span className={`${timeColumnClasses} text-yellow-300`}>{isoPastedTime}</span>
        </div>
      )}

      <div className={`w-full text-xs text-gray-500 md:text-right ${pastedTime ? 'md:w-1/5' : 'md:w-2/5'}`}>
        <span>({timezones.join(', ')})</span>
      </div>
    </div>
  );
};