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

#### Target Page Viewed
- **Event Name**: `Target Page Viewed`
- **Constant**: `EVENT_TARGET_PAGE_VIEWED`
- **Triggered**: When user navigates to target page
- **Metadata**:
  - `page`: "Target"
  - `timestamp`: ISO timestamp

#### Earnings Page Viewed
- **Event Name**: `Earnings Page Viewed`
- **Constant**: `EVENT_EARNINGS_PAGE_VIEWED`
- **Triggered**: When user navigates to earnings page
- **Metadata**:
  - `page`: "Earnings"
  - `timestamp`: ISO timestamp

#### More Page Viewed
- **Event Name**: `More Page Viewed`
- **Constant**: `EVENT_MORE_PAGE_VIEWED`
- **Triggered**: When user navigates to more page
- **Metadata**:
  - `page`: "More"
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
  - `source`: Source of customer card ("nudge-zone", "so-close", "nearby")
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

### 5. Target Page - Toggle Events

#### Target Page Toggle - Daily
- **Event Name**: `Target Page Toggle - Daily`
- **Constant**: `EVENT_TARGET_PAGE_TOGGLE_DAILY`
- **Triggered**: When user switches to daily targets on target page
- **Metadata**:
  - `target_type`: "daily"
  - `page`: "Target"
  - `timestamp`: ISO timestamp

#### Target Page Toggle - Weekly
- **Event Name**: `Target Page Toggle - Weekly`
- **Constant**: `EVENT_TARGET_PAGE_TOGGLE_WEEKLY`
- **Triggered**: When user switches to weekly targets on target page
- **Metadata**:
  - `target_type`: "weekly"
  - `page`: "Target"
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
import { trackPageView, trackCustomerCall, trackHomeTargetsToggle } from '../utils/analytics';
```

### Track Page View
```javascript
useEffect(() => {
  trackPageView('Home');
}, []);
```

### Track Customer Call
```javascript
const handleCallClick = (customer) => {
  trackCustomerCall({
    customerId: customer.customerId,
    customerName: customer.customerName,
    phoneNumber: customer.phoneNumber,
    source: 'nudge-zone'
  });
};
```

### Track Toggle Events
```javascript
const toggleTargetType = () => {
  setTargetType(prev => {
    const newType = prev === 'daily' ? 'weekly' : 'daily';
    trackHomeTargetsToggle(newType);
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

**URL**: `http://localhost:5000/api/events/log`

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

## Future Event Additions

To add a new event:

1. Add event name constant to `src/constants/eventNames.js`
2. Create tracking function in `src/utils/analytics.js`
3. Call tracking function at the appropriate location in the component
4. Update this documentation file

---

## Console Logging

All events log to the browser console:
- ✅ Success: `Event logged: [event name]`
- ⏭️ Skipped: `Skipping duplicate event: [event name]`
- ⚠️ Warning: `Cannot log event: No employee ID found`
