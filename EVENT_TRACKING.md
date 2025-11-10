# Event Tracking Documentation

This document lists all analytics events tracked in the Sales Executive App. All events are stored in the `SA_AppEvents` table with the following structure:

## Database Schema: SA_AppEvents

| Column | Type | Description |
|--------|------|-------------|
| entry_date | DATE | Date when the event occurred |
| entry_time | TIME | Time when the event occurred |
| employee_id | VARCHAR | Employee ID of the user who triggered the event |
| event_name | VARCHAR | Name of the event |
| meta_data | JSON | Additional metadata about the event |

## Event Constants Location

All event names are centrally defined in:
```
src/constants/eventNames.js
```

## Event Categories

### 1. Authentication Events

#### Login
- **Event Name**: `Login`
- **Constant**: `EVENT_LOGIN`
- **Triggered**: When user successfully logs in
- **Metadata**:
  - `employee_id`: Employee ID
  - `role`: User role
  - `timestamp`: ISO timestamp

#### Signup
- **Event Name**: `Signup`
- **Constant**: `EVENT_SIGNUP`
- **Triggered**: When user successfully signs up
- **Metadata**:
  - `employee_id`: Employee ID
  - `role`: User role
  - `timestamp`: ISO timestamp

#### Logout
- **Event Name**: `Logout`
- **Constant**: `EVENT_LOGOUT`
- **Triggered**: When user logs out
- **Metadata**:
  - `employee_id`: Employee ID
  - `role`: User role
  - `timestamp`: ISO timestamp

---

### 2. Page View Events

#### Home Page Viewed
- **Event Name**: `Home Page Viewed`
- **Constant**: `EVENT_HOME_PAGE_VIEWED`
- **Triggered**: When user navigates to home page
- **Metadata**:
  - `page`: "Home"
  - `timestamp`: ISO timestamp

#### Customers Page Viewed
- **Event Name**: `Customers Page Viewed`
- **Constant**: `EVENT_CUSTOMERS_PAGE_VIEWED`
- **Triggered**: When user navigates to customers page (formerly Target page)
- **Metadata**:
  - `page`: "Customers"
  - `timestamp`: ISO timestamp

---

### 3. Customer Interaction Events

#### Called Customer
- **Event Name**: `Called Customer`
- **Constant**: `EVENT_CALLED_CUSTOMER`
- **Triggered**: When user clicks the "Call" button for a customer
- **Metadata**:
  - `customer_id`: Customer ID
  - `customer_name`: Customer name
  - `phone_number`: Customer phone number
  - `source`: Source of customer card ("nudge-zone", "so-close", "nearby", "target-page")
  - `timestamp`: ISO timestamp

#### Customer Detail Modal Viewed
- **Event Name**: `Customer Detail Modal Viewed`
- **Constant**: `EVENT_CUSTOMER_DETAIL_VIEWED`
- **Triggered**: When user opens customer detail modal
- **Metadata**:
  - `customer_id`: Customer ID
  - `customer_name`: Customer name
  - `timestamp`: ISO timestamp

#### Customer SKU Details Viewed
- **Event Name**: `Customer SKU Details Viewed`
- **Constant**: `EVENT_CUSTOMER_SKU_VIEWED`
- **Triggered**: When user views SKU details for a customer
- **Metadata**:
  - `customer_id`: Customer ID
  - `sku_id`: SKU ID
  - `sku_name`: SKU name
  - `timestamp`: ISO timestamp

---

### 4. Home Page - Target Toggle Events

#### Home Page Targets Toggle - Daily
- **Event Name**: `Home Page Targets Toggle - Daily`
- **Constant**: `EVENT_HOME_TARGETS_TOGGLE_DAILY`
- **Triggered**: When user switches to daily targets on home page
- **Metadata**:
  - `target_type`: "daily"
  - `page`: "Home"
  - `timestamp`: ISO timestamp

#### Home Page Targets Toggle - Weekly
- **Event Name**: `Home Page Targets Toggle - Weekly`
- **Constant**: `EVENT_HOME_TARGETS_TOGGLE_WEEKLY`
- **Triggered**: When user switches to weekly targets on home page
- **Metadata**:
  - `target_type`: "weekly"
  - `page`: "Home"
  - `timestamp`: ISO timestamp

---

### 5. Customers Page - Toggle Events

#### Customers Page Toggle - Daily
- **Event Name**: `Customers Page Toggle - Daily`
- **Constant**: `EVENT_CUSTOMERS_PAGE_TOGGLE_DAILY`
- **Triggered**: When user switches to daily targets on customers page
- **Metadata**:
  - `target_type`: "daily"
  - `page`: "Customers"
  - `timestamp`: ISO timestamp

#### Customers Page Toggle - Weekly
- **Event Name**: `Customers Page Toggle - Weekly`
- **Constant**: `EVENT_CUSTOMERS_PAGE_TOGGLE_WEEKLY`
- **Triggered**: When user switches to weekly targets on customers page
- **Metadata**:
  - `target_type`: "weekly"
  - `page`: "Customers"
  - `timestamp`: ISO timestamp

#### Customers Page Metric Selected
- **Event Name**: `Customers Page Metric Selected`
- **Constant**: `EVENT_CUSTOMERS_METRIC_SELECTED`
- **Triggered**: When user selects a metric from the dropdown on customers page
- **Metadata**:
  - `metric_name`: Name of the selected metric (e.g., "AB", "Tonnage", "OC")
  - `period`: Current period ("daily" or "weekly")
  - `timestamp`: ISO timestamp

---

### 6. Leaderboard Events

#### Leaderboard Period Toggle - Day
- **Event Name**: `Leaderboard Period Toggle - Day`
- **Constant**: `EVENT_LEADERBOARD_PERIOD_DAY`
- **Triggered**: When user switches leaderboard period to day
- **Metadata**:
  - `period`: "day"
  - `timestamp`: ISO timestamp

#### Leaderboard Period Toggle - Week
- **Event Name**: `Leaderboard Period Toggle - Week`
- **Constant**: `EVENT_LEADERBOARD_PERIOD_WEEK`
- **Triggered**: When user switches leaderboard period to week
- **Metadata**:
  - `period`: "week"
  - `timestamp`: ISO timestamp

#### Leaderboard Layer Toggle - City
- **Event Name**: `Leaderboard Layer Toggle - City`
- **Constant**: `EVENT_LEADERBOARD_LAYER_CITY`
- **Triggered**: When user switches leaderboard layer to city
- **Metadata**:
  - `layer`: "city"
  - `timestamp`: ISO timestamp

#### Leaderboard Layer Toggle - Cluster
- **Event Name**: `Leaderboard Layer Toggle - Cluster`
- **Constant**: `EVENT_LEADERBOARD_LAYER_CLUSTER`
- **Triggered**: When user switches leaderboard layer to cluster
- **Metadata**:
  - `layer`: "cluster"
  - `timestamp`: ISO timestamp

---

### 7. Leaderboard Combined View Events

These events track the complete leaderboard state (period + layer combination):

#### Leaderboard View - Day + City
- **Event Name**: `Leaderboard View - Day + City`
- **Constant**: `EVENT_LEADERBOARD_DAY_CITY`
- **Triggered**: When leaderboard shows daily city rankings
- **Metadata**:
  - `period`: "day"
  - `layer`: "city"
  - `view_combination`: "day_city"
  - `timestamp`: ISO timestamp

#### Leaderboard View - Day + Cluster
- **Event Name**: `Leaderboard View - Day + Cluster`
- **Constant**: `EVENT_LEADERBOARD_DAY_CLUSTER`
- **Triggered**: When leaderboard shows daily cluster rankings
- **Metadata**:
  - `period`: "day"
  - `layer`: "cluster"
  - `view_combination`: "day_cluster"
  - `timestamp`: ISO timestamp

#### Leaderboard View - Week + City
- **Event Name**: `Leaderboard View - Week + City`
- **Constant**: `EVENT_LEADERBOARD_WEEK_CITY`
- **Triggered**: When leaderboard shows weekly city rankings
- **Metadata**:
  - `period`: "week"
  - `layer`: "city"
  - `view_combination`: "week_city"
  - `timestamp`: ISO timestamp

#### Leaderboard View - Week + Cluster
- **Event Name**: `Leaderboard View - Week + Cluster`
- **Constant**: `EVENT_LEADERBOARD_WEEK_CLUSTER`
- **Triggered**: When leaderboard shows weekly cluster rankings
- **Metadata**:
  - `period`: "week"
  - `layer`: "cluster"
  - `view_combination`: "week_cluster"
  - `timestamp`: ISO timestamp

---

### 8. Refresh Events

#### Global Refresh Triggered
- **Event Name**: `Global Refresh Triggered`
- **Constant**: `EVENT_GLOBAL_REFRESH`
- **Triggered**: When user clicks the global refresh button on home page
- **Metadata**:
  - `page`: "Home"
  - `timestamp`: ISO timestamp

#### Pull to Refresh Triggered
- **Event Name**: `Pull to Refresh Triggered`
- **Constant**: `EVENT_PULL_TO_REFRESH`
- **Triggered**: When user performs pull-to-refresh gesture
- **Metadata**:
  - `page`: Page name where refresh occurred
  - `timestamp`: ISO timestamp

---

### 9. News/Updates Events

#### News Viewed
- **Event Name**: `News Viewed`
- **Constant**: `EVENT_NEWS_VIEWED`
- **Triggered**: When user opens the notifications/news modal
- **Metadata**:
  - `timestamp`: ISO timestamp

#### News Item Read
- **Event Name**: `News Item Read`
- **Constant**: `EVENT_NEWS_ITEM_READ`
- **Triggered**: When user clicks/reads a specific news item
- **Metadata**:
  - `news_title`: Title of the news item
  - `news_type`: Type of news
  - `timestamp`: ISO timestamp

---

## Deprecated Events

The following events are no longer tracked as these pages have been disabled:

- ~~**Earnings Page Viewed**~~ - Page disabled
- ~~**More Page Viewed**~~ - Page disabled

---

## Duplicate Event Prevention

The analytics system includes built-in duplicate event prevention:

- **Window**: 2 seconds
- **Mechanism**: Event cache using Map with timestamp tracking
- **Cache Cleanup**: Automatic cleanup of entries older than 5 seconds when cache exceeds 100 items

Events with the same `employee_id`, `event_name`, and `metadata` within 2 seconds are automatically skipped.

---

## Usage Examples

### Import Events
```javascript
import {
  trackPageView,
  trackCustomerCall,
  trackHomeTargetsToggle,
  trackCustomerDetailViewed,
  trackCustomersMetricSelected
} from '../utils/analytics';
```

### Track Page View
```javascript
useEffect(() => {
  trackPageView('Customers');
}, []);
```

### Track Customer Call
```javascript
const handleCallClick = (customer) => {
  trackCustomerCall({
    customerId: customer.customerId,
    customerName: customer.customerName,
    phoneNumber: customer.phoneNumber,
    source: 'target-page'
  });
};
```

### Track Customer Detail Viewed
```javascript
const handleCustomerClick = (customer) => {
  setSelectedCustomer(customer);
  setIsModalOpen(true);
  trackCustomerDetailViewed(customer.customerId, customer.customerName);
};
```

### Track Metric Selection
```javascript
<CustomDropdown
  value={selectedMetric}
  onChange={(value) => {
    setSelectedMetric(value);
    trackCustomersMetricSelected(value, targetType);
  }}
/>
```

### Track Toggle Events
```javascript
const toggleTargetType = () => {
  setTargetType(prev => {
    const newType = prev === 'daily' ? 'weekly' : 'daily';
    trackCustomersPageToggle(newType);
    return newType;
  });
};
```

### Track Leaderboard View
```javascript
const toggleRankingPeriod = () => {
  setRankingPeriod(prev => {
    const newPeriod = prev === 'day' ? 'week' : 'day';
    trackLeaderboardPeriodToggle(newPeriod);
    trackLeaderboardView(newPeriod, rankingType);
    return newPeriod;
  });
};
```

---

## Analytics API Endpoint

### Development
**URL**: `http://localhost:5000/api/events/log`

### Production
**URL**: `https://executive-sales-assistant.onrender.com/api/events/log`

**Method**: POST

**Request Body**:
```json
{
  "employee_id": "EMP123",
  "event_name": "Login",
  "meta_data": "{\"role\":\"sales_executive\",\"timestamp\":\"2025-11-06T10:30:00.000Z\"}"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Event logged successfully"
}
```

---

## Event Tracking Implementation

### Core Files

1. **Event Constants**: `src/constants/eventNames.js`
   - Centralized event name definitions
   - Exported constants for type safety

2. **Analytics Utilities**: `src/utils/analytics.js`
   - `logEvent()` - Core logging function
   - Tracking helper functions for each event type
   - Duplicate prevention logic

3. **API Configuration**: `src/config.js`
   - Environment-based API URL switching
   - Auto-detects development vs production

### Flow

1. User performs action (click, navigation, etc.)
2. Component calls tracking function (e.g., `trackPageView('Home')`)
3. Tracking function calls `logEvent()` with event name and metadata
4. `logEvent()` checks for duplicates using event cache
5. If not duplicate, sends POST request to backend `/api/events/log`
6. Backend stores event in `SA_AppEvents` table
7. Console logs success/skip message

---

## Future Event Additions

To add a new event:

1. **Add event constant** to `src/constants/eventNames.js`:
   ```javascript
   export const EVENT_NEW_FEATURE = 'New Feature Used';
   ```

2. **Create tracking function** in `src/utils/analytics.js`:
   ```javascript
   export const trackNewFeature = (featureData) => {
     return logEvent(EventNames.EVENT_NEW_FEATURE, {
       feature_id: featureData.id,
       feature_name: featureData.name,
       timestamp: new Date().toISOString()
     });
   };
   ```

3. **Call tracking function** in component:
   ```javascript
   import { trackNewFeature } from '../utils/analytics';

   const handleFeatureUse = () => {
     trackNewFeature({ id: 1, name: 'Feature A' });
   };
   ```

4. **Update this documentation** with the new event details

---

## Console Logging

All events log to the browser console for debugging:
- ✅ **Success**: `Event logged: [event name]`
- ⏭️ **Skipped**: `Skipping duplicate event: [event name]`
- ⚠️ **Warning**: `Cannot log event: No employee ID found`
- ❌ **Error**: `Error logging event: [error message]`

---

## Analytics Dashboard (Future)

Potential analytics queries for reporting dashboard:

### Most Active Users
```sql
SELECT employee_id, COUNT(*) as event_count
FROM SA_AppEvents
WHERE entry_date >= CURDATE() - INTERVAL 7 DAY
GROUP BY employee_id
ORDER BY event_count DESC
LIMIT 10;
```

### Popular Features
```sql
SELECT event_name, COUNT(*) as usage_count
FROM SA_AppEvents
WHERE entry_date >= CURDATE() - INTERVAL 30 DAY
GROUP BY event_name
ORDER BY usage_count DESC;
```

### Customer Engagement
```sql
SELECT event_name, COUNT(*) as call_count
FROM SA_AppEvents
WHERE event_name = 'Called Customer'
  AND entry_date >= CURDATE() - INTERVAL 7 DAY
GROUP BY event_name;
```

---

**Last Updated**: 2025-11-10
**Version**: 2.0 (Post Customers Page Rename)
