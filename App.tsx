
import React, { useState, useEffect, useCallback } from 'react';
import { useTime } from './hooks/useTime';
import { groupTimezonesByOffset } from './services/timezoneService';
import type { TimezoneData } from './types';
import { TimezoneDisplay } from './components/TimezoneDisplay';
import { CopyIcon, CheckIcon } from './components/Icons';

const App: React.FC = () => {
  const time = useTime(50); // Update every 50ms for smooth milliseconds
  const [timezoneData, setTimezoneData] = useState<TimezoneData>({});
  const [sortedOffsets, setSortedOffsets] = useState<number[]>([]);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const data = groupTimezonesByOffset();
    setTimezoneData(data);
    const sorted = Object.keys(data).map(Number).sort((a, b) => a - b);
    setSortedOffsets(sorted);
  }, []);

  const handleCopyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(time.getTime().toString()).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  }, [time]);

  return (
    <div className="bg-gray-900 text-white min-h-screen font-mono p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-xl sm:text-2xl text-gray-400 mb-2">Current Epoch Time</h1>
          <div 
            className="group relative inline-flex items-center justify-center cursor-pointer"
            onClick={handleCopyToClipboard}
          >
            <p className="text-4xl sm:text-5xl md:text-6xl font-bold text-cyan-300 tracking-wider">
              {time.getTime()}
            </p>
            <div className="absolute -right-8 sm:-right-10 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
              {isCopied ? <CheckIcon className="w-6 h-6 text-green-400" /> : <CopyIcon className="w-6 h-6 text-gray-500" />}
            </div>
          </div>
          {isCopied && <p className="text-green-400 mt-2 transition-opacity duration-300">Copied to clipboard!</p>}
        </header>

        <div className="bg-gray-800/50 rounded-lg shadow-lg overflow-hidden border border-gray-700">
          <div className="px-4 py-3 sm:px-6 bg-gray-800 border-b border-gray-700 hidden md:flex">
            <div className="w-1/5 font-bold text-gray-400">Offset</div>
            <div className="w-2/5 font-bold text-gray-400 text-center">ISO 8601 Time</div>
            <div className="w-2/5 font-bold text-gray-400 text-right">Timezone Names</div>
          </div>
          <div className="max-h-[70vh] overflow-y-auto">
            {sortedOffsets.map((offset) => (
              <TimezoneDisplay
                key={offset}
                offset={offset}
                timezones={timezoneData[offset]}
                currentTime={time}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
