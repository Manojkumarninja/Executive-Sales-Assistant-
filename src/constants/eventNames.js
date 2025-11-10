/**
 * Analytics Event Names
 * Centralized location for all app event names used for tracking
 *
 * Last Updated: After removing Earnings/More tabs and renaming to Customers
 */

// Authentication Events
export const EVENT_LOGIN = 'Login';
export const EVENT_SIGNUP = 'Signup';
export const EVENT_LOGOUT = 'Logout';

// Page View Events
export const EVENT_HOME_PAGE_VIEWED = 'Home Page Viewed';
export const EVENT_CUSTOMERS_PAGE_VIEWED = 'Customers Page Viewed';  // Renamed from Target Page

// Removed Events (Pages Disabled):
// export const EVENT_EARNINGS_PAGE_VIEWED = 'Earnings Page Viewed';
// export const EVENT_MORE_PAGE_VIEWED = 'More Page Viewed';

// Customer Interaction Events
export const EVENT_CALLED_CUSTOMER = 'Called Customer';
export const EVENT_CUSTOMER_DETAIL_VIEWED = 'Customer Detail Modal Viewed';
export const EVENT_CUSTOMER_SKU_VIEWED = 'Customer SKU Details Viewed';

// Home Page - Target Toggle Events
export const EVENT_HOME_TARGETS_TOGGLE_DAILY = 'Home Page Targets Toggle - Daily';
export const EVENT_HOME_TARGETS_TOGGLE_WEEKLY = 'Home Page Targets Toggle - Weekly';

// Customers Page - Period Toggle Events (Renamed from Target Page)
export const EVENT_CUSTOMERS_PAGE_TOGGLE_DAILY = 'Customers Page Toggle - Daily';
export const EVENT_CUSTOMERS_PAGE_TOGGLE_WEEKLY = 'Customers Page Toggle - Weekly';

// Customers Page - Metric Selection Events
export const EVENT_CUSTOMERS_METRIC_SELECTED = 'Customers Page Metric Selected';

// Leaderboard Events - Period (Day/Week)
export const EVENT_LEADERBOARD_PERIOD_DAY = 'Leaderboard Period Toggle - Day';
export const EVENT_LEADERBOARD_PERIOD_WEEK = 'Leaderboard Period Toggle - Week';

// Leaderboard Events - Layer (City/Cluster)
export const EVENT_LEADERBOARD_LAYER_CITY = 'Leaderboard Layer Toggle - City';
export const EVENT_LEADERBOARD_LAYER_CLUSTER = 'Leaderboard Layer Toggle - Cluster';

// Leaderboard Events - Combined (Period + Layer)
export const EVENT_LEADERBOARD_DAY_CITY = 'Leaderboard View - Day + City';
export const EVENT_LEADERBOARD_DAY_CLUSTER = 'Leaderboard View - Day + Cluster';
export const EVENT_LEADERBOARD_WEEK_CITY = 'Leaderboard View - Week + City';
export const EVENT_LEADERBOARD_WEEK_CLUSTER = 'Leaderboard View - Week + Cluster';

// Refresh Events
export const EVENT_GLOBAL_REFRESH = 'Global Refresh Triggered';
export const EVENT_PULL_TO_REFRESH = 'Pull to Refresh Triggered';

// News/Updates Events
export const EVENT_NEWS_VIEWED = 'News Modal Viewed';
export const EVENT_NEWS_ITEM_READ = 'News Item Read';

/**
 * Helper function to get combined leaderboard event name
 * @param {string} period - 'day' or 'week'
 * @param {string} layer - 'city' or 'cluster'
 * @returns {string} Combined event name
 */
export const getLeaderboardCombinedEvent = (period, layer) => {
  const eventMap = {
    'day_city': EVENT_LEADERBOARD_DAY_CITY,
    'day_cluster': EVENT_LEADERBOARD_DAY_CLUSTER,
    'week_city': EVENT_LEADERBOARD_WEEK_CITY,
    'week_cluster': EVENT_LEADERBOARD_WEEK_CLUSTER,
  };

  const key = `${period}_${layer}`;
  return eventMap[key] || `Leaderboard View - ${period} + ${layer}`;
};

export default {
  // Authentication
  EVENT_LOGIN,
  EVENT_SIGNUP,
  EVENT_LOGOUT,

  // Page Views
  EVENT_HOME_PAGE_VIEWED,
  EVENT_CUSTOMERS_PAGE_VIEWED,

  // Customer Interactions
  EVENT_CALLED_CUSTOMER,
  EVENT_CUSTOMER_DETAIL_VIEWED,
  EVENT_CUSTOMER_SKU_VIEWED,

  // Home Page Targets
  EVENT_HOME_TARGETS_TOGGLE_DAILY,
  EVENT_HOME_TARGETS_TOGGLE_WEEKLY,

  // Customers Page (Renamed from Target Page)
  EVENT_CUSTOMERS_PAGE_TOGGLE_DAILY,
  EVENT_CUSTOMERS_PAGE_TOGGLE_WEEKLY,
  EVENT_CUSTOMERS_METRIC_SELECTED,

  // Leaderboard
  EVENT_LEADERBOARD_PERIOD_DAY,
  EVENT_LEADERBOARD_PERIOD_WEEK,
  EVENT_LEADERBOARD_LAYER_CITY,
  EVENT_LEADERBOARD_LAYER_CLUSTER,
  EVENT_LEADERBOARD_DAY_CITY,
  EVENT_LEADERBOARD_DAY_CLUSTER,
  EVENT_LEADERBOARD_WEEK_CITY,
  EVENT_LEADERBOARD_WEEK_CLUSTER,

  // Refresh
  EVENT_GLOBAL_REFRESH,
  EVENT_PULL_TO_REFRESH,

  // News/Updates
  EVENT_NEWS_VIEWED,
  EVENT_NEWS_ITEM_READ,

  // Helper
  getLeaderboardCombinedEvent,
};
