import { useEffect, useState } from 'react';

const ProgressBar = ({
  percentage,
  height = '8px',
  showLabel = false,
  animated = true,
  slabs = null // { slab1: 25, slab2: 50, slab3: 75 } - percentages for markers
}) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (animated) {
      // Animate the progress bar
      const timer = setTimeout(() => {
        setWidth(percentage);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setWidth(percentage);
    }
  }, [percentage, animated]);

  // Determine color based on percentage
  const getColor = () => {
    if (percentage >= 80) return 'bg-success';
    if (percentage >= 50) return 'bg-warning';
    return 'bg-danger';
  };

  const getGradient = () => {
    if (percentage >= 80) return 'from-green-400 to-success';
    if (percentage >= 50) return 'from-yellow-400 to-warning';
    return 'from-red-400 to-danger';
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-bold text-gray-900">{percentage.toFixed(1)}%</span>
        </div>
      )}
      <div className="relative">
        <div
          className="w-full bg-gray-200 rounded-full overflow-hidden"
          style={{ height }}
        >
          <div
            className={`h-full bg-gradient-to-r ${getGradient()} transition-all duration-1000 ease-out`}
            style={{ width: `${width}%` }}
          >
            {animated && (
              <div className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
            )}
          </div>
        </div>

        {/* Slab Markers */}
        {slabs && (
          <>
            {slabs.slab1 > 0 && (
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-blue-400"
                style={{ left: `${slabs.slab1}%` }}
                title={`Slab 1: ${slabs.slab1.toFixed(1)}%`}
              >
                <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
            )}
            {slabs.slab2 > 0 && (
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-purple-400"
                style={{ left: `${slabs.slab2}%` }}
                title={`Slab 2: ${slabs.slab2.toFixed(1)}%`}
              >
                <div className="absolute -top-1 -left-1 w-2 h-2 bg-purple-500 rounded-full"></div>
              </div>
            )}
            {slabs.slab3 > 0 && (
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-pink-400"
                style={{ left: `${slabs.slab3}%` }}
                title={`Slab 3: ${slabs.slab3.toFixed(1)}%`}
              >
                <div className="absolute -top-1 -left-1 w-2 h-2 bg-pink-500 rounded-full"></div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProgressBar;
