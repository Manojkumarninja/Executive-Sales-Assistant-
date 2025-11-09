import { useState, useEffect, useCallback, useRef } from 'react';
import { FaSyncAlt, FaClock } from 'react-icons/fa';

/**
 * Global Refresh Button Component
 * - Displays a fancy refresh button with last refreshed time
 * - Auto-refreshes every 10 minutes
 * - Manual refresh on button click
 */
const GlobalRefreshButton = ({ onRefresh }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [timeAgo, setTimeAgo] = useState('Just now');
  const autoRefreshInterval = useRef(null);
  const timeAgoInterval = useRef(null);

  // Calculate time ago
  const getTimeAgo = useCallback((date) => {
    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return 'Long time ago';
  }, []);

  // Update time ago display every 10 seconds
  useEffect(() => {
    timeAgoInterval.current = setInterval(() => {
      setTimeAgo(getTimeAgo(lastRefreshed));
    }, 10000);

    return () => {
      if (timeAgoInterval.current) {
        clearInterval(timeAgoInterval.current);
      }
    };
  }, [lastRefreshed, getTimeAgo]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;

    console.log('🔄 Global refresh triggered...');
    setIsRefreshing(true);

    try {
      if (onRefresh) {
        await onRefresh();
      }
      setLastRefreshed(new Date());
      setTimeAgo('Just now');
    } catch (error) {
      console.error('❌ Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, onRefresh]);

  // Auto-refresh every 10 minutes
  useEffect(() => {
    // Set up auto-refresh interval (10 minutes = 600000ms)
    autoRefreshInterval.current = setInterval(() => {
      console.log('⏰ Auto-refresh triggered (10 minutes)');
      handleRefresh();
    }, 600000); // 10 minutes

    return () => {
      if (autoRefreshInterval.current) {
        clearInterval(autoRefreshInterval.current);
      }
    };
  }, [handleRefresh]);

  return (
    <div className="flex items-center space-x-3 relative">
      {/* Refresh Button */}
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className={`
          bg-gradient-to-r from-primary to-primary-dark
          text-white shadow-lg rounded-xl
          px-6 py-3
          flex items-center space-x-2
          font-semibold text-sm
          transform transition-all duration-300
          ${isRefreshing
            ? 'opacity-75 cursor-not-allowed scale-95'
            : 'hover:scale-105 hover:shadow-xl active:scale-95'
          }
        `}
        title="Refresh all data"
      >
        <FaSyncAlt
          className={`text-lg ${isRefreshing ? 'animate-spin' : ''}`}
        />
        <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
      </button>

      {/* Last Refreshed Time */}
      <div className="bg-white shadow-lg rounded-xl px-4 py-2 border border-gray-200 flex items-center space-x-2">
        <FaClock className="text-gray-500 text-sm" />
        <span className="text-xs font-medium text-gray-600">{timeAgo}</span>
      </div>

      {/* Pulse animation on auto-refresh */}
      {isRefreshing && (
        <div className="absolute top-0 left-0 w-full h-full rounded-xl animate-ping bg-primary opacity-20 pointer-events-none" />
      )}
    </div>
  );
};

export default GlobalRefreshButton;
