import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTime } from './hooks/useTime';
import { groupTimezonesByOffset, formatOffsetToString } from './services/timezoneService';
import type { TimezoneData } from './types';
import { TimezoneDisplay } from './components/TimezoneDisplay';

const App: React.FC = () => {
  const time = useTime(50); // Update every 50ms for smooth milliseconds
  const [timezoneData, setTimezoneData] = useState<TimezoneData>({});
  const [sortedOffsets, setSortedOffsets] = useState<number[]>([]);
  const [isCopied, setIsCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pastedTime, setPastedTime] = useState<Date | null>(null);
  const [pastedTimestampInput, setPastedTimestampInput] = useState('');
  const [pinnedOffsets, setPinnedOffsets] = useState<number[]>([]);


  useEffect(() => {
    const data = groupTimezonesByOffset();
    setTimezoneData(data);
    const sorted = Object.keys(data).map(Number).sort((a, b) => a - b);
    setSortedOffsets(sorted);

    // Identify offsets to pin
    const localOffset = -new Date().getTimezoneOffset();
    const gmtOffset = 0;
    let pacificOffset: number | undefined;

    for (const offset in data) {
      if (data[offset].includes('America/Los_Angeles')) {
        pacificOffset = Number(offset);
        break;
      }
    }
    
    const pinnedSet = new Set([gmtOffset, localOffset]);
    if (pacificOffset !== undefined) {
      pinnedSet.add(pacificOffset);
    }
    setPinnedOffsets(Array.from(pinnedSet).sort((a,b) => a - b));

  }, []);

  const showCopyConfirmation = useCallback(() => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }, []);

  const handleEpochCopyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(time.getTime().toString()).then(() => {
      showCopyConfirmation();
    });
  }, [time, showCopyConfirmation]);
  
  const handleTimestampChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPastedTimestampInput(value);

    if (!value.trim()) {
      setPastedTime(null);
      return;
    }

    // Try parsing as a string, then as a number for epoch ms
    const dateFromString = new Date(value);
    const dateFromNumber = new Date(Number(value));

    if (!isNaN(dateFromString.getTime())) {
      setPastedTime(dateFromString);
    } else if (!isNaN(dateFromNumber.getTime()) && !isNaN(parseInt(value))) {
      setPastedTime(dateFromNumber);
    } else {
      setPastedTime(null);
    }
  }, []);

  const filteredAndSortedOffsets = useMemo(() => {
      const pinnedSet = new Set(pinnedOffsets);
      const filterableOffsets = sortedOffsets.filter(offset => !pinnedSet.has(offset));

      if (!searchQuery.trim()) {
        return filterableOffsets;
      }
      
      const lowerCaseQuery = searchQuery.toLowerCase();
      
      return filterableOffsets.filter(offset => {
          const offsetString = formatOffsetToString(offset).toLowerCase();
          const names = timezoneData[offset].join(', ').toLowerCase();
          return offsetString.includes(lowerCaseQuery) || names.includes(lowerCaseQuery);
      });
  }, [searchQuery, sortedOffsets, timezoneData, pinnedOffsets]);

  return (
    <div className="bg-gray-900 text-white min-h-screen font-mono p-4 sm:p-6 md:p-8">
      
      <div
        className={`fixed top-6 right-6 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg transition-opacity duration-300 ease-in-out ${isCopied ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        aria-live="polite"
        role="status"
      >
        Copied to clipboard!
      </div>

      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-xl sm:text-2xl text-gray-400 mb-2">Current Epoch Time</h1>
          <div 
            className="group relative inline-flex items-center justify-center cursor-pointer"
            onClick={handleEpochCopyToClipboard}
            aria-label="Copy epoch time to clipboard"
          >
            <p className="text-4xl sm:text-5xl md:text-6xl font-bold text-cyan-300 tracking-wider">
              {time.getTime()}
            </p>
          </div>
        </header>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or offset (e.g. London, +01:00)"
            className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          />
          <input 
            type="text"
            value={pastedTimestampInput}
            onChange={handleTimestampChange}
            placeholder="Paste a timestamp to convert (e.g. 1672531200000)"
            className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          />
        </div>

        <div className="bg-gray-800/50 rounded-lg shadow-lg overflow-hidden border border-gray-700">
          <div className="px-4 py-3 sm:px-6 bg-gray-800 border-b border-gray-700 hidden md:flex text-sm">
            <div className="w-1/5 font-bold text-gray-400">Offset</div>
            <div className={`${pastedTime ? 'w-[30%]' : 'w-2/5'} font-bold text-gray-400 text-center`}>Live ISO 8601 Time</div>
            {pastedTime && <div className="w-[30%] font-bold text-gray-400 text-center">Entered Time</div>}
            <div className={`${pastedTime ? 'w-1/5' : 'w-2/5'} font-bold text-gray-400 text-right`}>Timezone Names</div>
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {pinnedOffsets.length > 0 && (
              <>
                <h2 className="px-4 py-2 text-xs text-gray-500 font-bold sticky top-0 bg-gray-800/80 backdrop-blur-sm z-10">PINNED</h2>
                {pinnedOffsets.map((offset) => timezoneData[offset] && (
                  <TimezoneDisplay
                    key={`pinned-${offset}`}
                    offset={offset}
                    timezones={timezoneData[offset]}
                    currentTime={time}
                    pastedTime={pastedTime}
                    onCopy={showCopyConfirmation}
                  />
                ))}
              </>
            )}
            {filteredAndSortedOffsets.map((offset) => (
              <TimezoneDisplay
                key={offset}
                offset={offset}
                timezones={timezoneData[offset]}
                currentTime={time}
                pastedTime={pastedTime}
                onCopy={showCopyConfirmation}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;