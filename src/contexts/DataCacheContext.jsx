import { createContext, useContext, useRef, useCallback } from 'react';

const DataCacheContext = createContext();

export const useDataCache = () => {
  const context = useContext(DataCacheContext);
  if (!context) {
    throw new Error('useDataCache must be used within DataCacheProvider');
  }
  return context;
};

export const DataCacheProvider = ({ children }) => {
  // Use ref for cache to keep getter functions stable
  const cacheRef = useRef({
    homeTargets: null,
    homeRankings: null,
    homeNudgeZone: null,
    homeSoClose: null,
    homeDailyIncentives: null,
    homeWeeklyIncentives: null,
    targetPageDaily: null,
    targetPageWeekly: null,
    targetPageCustomers: {},
  });

  const updateCache = useCallback((key, data) => {
    cacheRef.current = {
      ...cacheRef.current,
      [key]: {
        data,
        timestamp: Date.now(),
      },
    };
  }, []);

  const getCache = useCallback((key) => {
    return cacheRef.current[key]?.data || null;
  }, []);

  const clearCache = useCallback(() => {
    cacheRef.current = {
      homeTargets: null,
      homeRankings: null,
      homeNudgeZone: null,
      homeSoClose: null,
      homeDailyIncentives: null,
      homeWeeklyIncentives: null,
      targetPageDaily: null,
      targetPageWeekly: null,
      targetPageCustomers: {},
    };
  }, []);

  // Update target page customers cache (nested object)
  const updateTargetCustomersCache = useCallback((metric, period, data) => {
    cacheRef.current = {
      ...cacheRef.current,
      targetPageCustomers: {
        ...cacheRef.current.targetPageCustomers,
        [`${metric}_${period}`]: {
          data,
          timestamp: Date.now(),
        },
      },
    };
  }, []);

  const getTargetCustomersCache = useCallback((metric, period) => {
    return cacheRef.current.targetPageCustomers[`${metric}_${period}`]?.data || null;
  }, []);

  const value = {
    updateCache,
    getCache,
    clearCache,
    updateTargetCustomersCache,
    getTargetCustomersCache,
  };

  return (
    <DataCacheContext.Provider value={value}>
      {children}
    </DataCacheContext.Provider>
  );
};
