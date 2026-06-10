import React from 'react';

const StorageBar = ({ usedBytes, totalBytes }) => {
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const used = usedBytes || 0;
  const total = totalBytes || 1; // Prevent division by zero
  let percentage = (used / total) * 100;
  if (percentage > 100) percentage = 100;

  // Determine color based on percentage
  let barColor = 'bg-orange-500'; // Default orange
  if (percentage > 90) {
    barColor = 'bg-red-500';
  } else if (percentage > 75) {
    barColor = 'bg-yellow-500';
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1 text-sm font-medium text-gray-300">
        <span>Storage Usage</span>
        <span>
          {formatBytes(used)} / {formatBytes(total)}
        </span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden border border-gray-700">
        <div
          className={`${barColor} h-2.5 rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="mt-1 text-xs text-right text-gray-400">
        {percentage.toFixed(1)}% used
      </div>
    </div>
  );
};

export default StorageBar;
