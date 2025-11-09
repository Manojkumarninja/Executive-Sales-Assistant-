/**
 * Analytics utility for tracking app events
 */

import * as EventNames from '../constants/eventNames';
import { API_BASE_URL } from '../config';

// Cache to prevent duplicate events within a short time window
const eventCache = new Map();
const DUPLICATE_WINDOW_MS = 2000; // 2 seconds

/**
 * Generate a unique key for an event
 */
const getEventKey = (employeeId, eventName, metaData) => {
  return `${employeeId}_${eventName}_${JSON.stringify(metaData)}`;
};

/**
 * Check if event was recently logged
 */
const isDuplicateEvent = (eventKey) => {
  const lastLoggedTime = eventCache.get(eventKey);
  const now = Date.now();

  if (lastLoggedTime && (now - lastLoggedTime) < DUPLICATE_WINDOW_MS) {
    return true;
  }

  eventCache.set(eventKey, now);

  // Clean up old entries (older than 5 seconds)
  if (eventCache.size > 100) {
    const fiveSecondsAgo = now - 5000;
    for (const [key, time] of eventCache.entries()) {
      if (time < fiveSecondsAgo) {
        eventCache.delete(key);
      }
    }
  }

  return false;
};

/**
 * Log an event to the backend
 * @param {string} eventName - Name of the event (e.g., 'Login', 'Home Page Viewed', 'Called Customer')
 * @param {object} metaData - Additional data about the event (optional)
 */
export const logEvent = async (eventName, metaData = {}) => {
  try {
    // Get employee ID from localStorage
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    const employeeId = userData.employee_id;

    if (!employeeId) {
      console.warn('Cannot log event: No employee ID found');
      return;
    }

    // Check for duplicate events
    const eventKey = getEventKey(employeeId, eventName, metaData);
    if (isDuplicateEvent(eventKey)) {
      console.log(`⏭️  Skipping duplicate event: ${eventName}`);
      return;
    }

    // Convert metaData object to JSON string
    const metaDataString = typeof metaData === 'object'
      ? JSON.stringify(metaData)
      : String(metaData);

    const response = await fetch(`${API_BASE_URL}/events/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        employee_id: employeeId,
        event_name: eventName,
        meta_data: metaDataString
      })
    });

    const data = await response.json();

    if (data.success) {
      console.log(`✅ Event logged: ${eventName}`);
    } else {
      console.error('Failed to log event:', data.message);
    }

    return data;
  } catch (error) {
    console.error('Error logging event:', error);
    return null;
  }
};

/**
 * Event tracking helpers
 */
/**
 * Authentication Event Tracking
 */
export const trackLogin = (employeeId, role) => {
  return logEvent(EventNames.EVENT_LOGIN, {
    employee_id: employeeId,
    role: role,
    timestamp: new Date().toISOString()
  });
};

export const trackSignup = (employeeId, role) => {
  return logEvent(EventNames.EVENT_SIGNUP, {
    employee_id: employeeId,
    role: role,
    timestamp: new Date().toISOString()
  });
};

export const trackLogout = (employeeId, role) => {
  return logEvent(EventNames.EVENT_LOGOUT, {
    employee_id: employeeId,
    role: role,
    timestamp: new Date().toISOString()
  });
};

/**
 * Page View Event Tracking
 */
export const trackPageView = (pageName) => {
  const eventNameMap = {
    'Home': EventNames.EVENT_HOME_PAGE_VIEWED,
    'Target': EventNames.EVENT_TARGET_PAGE_VIEWED,
    'Earnings': EventNames.EVENT_EARNINGS_PAGE_VIEWED,
    'More': EventNames.EVENT_MORE_PAGE_VIEWED
  };

  const eventName = eventNameMap[pageName] || `${pageName} Page Viewed`;

  return logEvent(eventName, {
    page: pageName,
    timestamp: new Date().toISOString()
  });
};

/**
 * Customer Interaction Event Tracking
 */
export const trackCustomerCall = (customerData) => {
  return logEvent(EventNames.EVENT_CALLED_CUSTOMER, {
    customer_id: customerData.customerId,
    customer_name: customerData.customerName,
    phone_number: customerData.phoneNumber,
    source: customerData.source || 'unknown', // 'nudge-zone', 'so-close', 'nearby', etc.
    timestamp: new Date().toISOString()
  });
};

/**
 * Home Page - Target Toggle Event Tracking
 */
export const trackHomeTargetsToggle = (targetType) => {
  const eventName = targetType === 'daily'
    ? EventNames.EVENT_HOME_TARGETS_TOGGLE_DAILY
    : EventNames.EVENT_HOME_TARGETS_TOGGLE_WEEKLY;

  return logEvent(eventName, {
    target_type: targetType,
    page: 'Home',
    timestamp: new Date().toISOString()
  });
};

/**
 * Target Page - Target Toggle Event Tracking
 */
export const trackTargetPageToggle = (targetType) => {
  const eventName = targetType === 'daily'
    ? EventNames.EVENT_TARGET_PAGE_TOGGLE_DAILY
    : EventNames.EVENT_TARGET_PAGE_TOGGLE_WEEKLY;

  return logEvent(eventName, {
    target_type: targetType,
    page: 'Target',
    timestamp: new Date().toISOString()
  });
};

/**
 * Leaderboard Period Toggle Event Tracking
 */
export const trackLeaderboardPeriodToggle = (period) => {
  const eventName = period === 'day'
    ? EventNames.EVENT_LEADERBOARD_PERIOD_DAY
    : EventNames.EVENT_LEADERBOARD_PERIOD_WEEK;

  return logEvent(eventName, {
    period: period,
    timestamp: new Date().toISOString()
  });
};

/**
 * Leaderboard Layer Toggle Event Tracking
 */
export const trackLeaderboardLayerToggle = (layer) => {
  const eventName = layer === 'city'
    ? EventNames.EVENT_LEADERBOARD_LAYER_CITY
    : EventNames.EVENT_LEADERBOARD_LAYER_CLUSTER;

  return logEvent(eventName, {
    layer: layer,
    timestamp: new Date().toISOString()
  });
};

/**
 * Leaderboard Combined View Event Tracking
 * Tracks the complete leaderboard view state (period + layer combination)
 */
export const trackLeaderboardView = (period, layer) => {
  const eventName = EventNames.getLeaderboardCombinedEvent(period, layer);

  return logEvent(eventName, {
    period: period,
    layer: layer,
    view_combination: `${period}_${layer}`,
    timestamp: new Date().toISOString()
  });
};

/**
 * Refresh Event Tracking
 */
export const trackGlobalRefresh = () => {
  return logEvent(EventNames.EVENT_GLOBAL_REFRESH, {
    page: 'Home',
    timestamp: new Date().toISOString()
  });
};

export const trackPullToRefresh = (pageName) => {
  return logEvent(EventNames.EVENT_PULL_TO_REFRESH, {
    page: pageName,
    timestamp: new Date().toISOString()
  });
};

/**
 * News/Updates Event Tracking
 */
export const trackNewsViewed = () => {
  return logEvent(EventNames.EVENT_NEWS_VIEWED, {
    timestamp: new Date().toISOString()
  });
};

export const trackNewsItemRead = (newsTitle, newsType) => {
  return logEvent(EventNames.EVENT_NEWS_ITEM_READ, {
    news_title: newsTitle,
    news_type: newsType,
    timestamp: new Date().toISOString()
  });
};
