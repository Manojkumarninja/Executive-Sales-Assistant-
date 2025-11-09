import { useEffect, useState, useRef } from 'react';

/**
 * Custom hook for scroll-to-refresh functionality
 * Triggers refresh when user scrolls up while already at the top of the page
 * @param {Function} onRefresh - Callback function to execute when refresh is triggered
 * @returns {Object} - { isRefreshing }
 */
export const usePullToRefresh = (onRefresh) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const scrollAttempts = useRef(0);
  const refreshTimeout = useRef(null);

  useEffect(() => {
    const handleWheel = async (e) => {
      // Check if at the top of the page
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      // If at top and scrolling up (negative deltaY)
      if (scrollTop === 0 && e.deltaY < 0) {
        scrollAttempts.current += 1;

        // Trigger refresh after 2 scroll-up attempts at the top
        if (scrollAttempts.current >= 2 && !isRefreshing) {
          console.log('🔄 Scroll-to-refresh triggered!');
          scrollAttempts.current = 0;
          setIsRefreshing(true);

          try {
            await onRefresh();
          } catch (error) {
            console.error('Error during refresh:', error);
          } finally {
            setTimeout(() => {
              setIsRefreshing(false);
            }, 500);
          }
        }

        // Reset counter after 1 second of no scrolling
        if (refreshTimeout.current) {
          clearTimeout(refreshTimeout.current);
        }
        refreshTimeout.current = setTimeout(() => {
          scrollAttempts.current = 0;
        }, 1000);
      } else {
        // Reset if scrolling down or not at top
        scrollAttempts.current = 0;
      }
    };

    // Add wheel event listener
    window.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      if (refreshTimeout.current) {
        clearTimeout(refreshTimeout.current);
      }
    };
  }, [onRefresh, isRefreshing]);

  return { isRefreshing };
};
