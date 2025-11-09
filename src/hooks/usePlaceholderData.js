import { useState, useEffect } from 'react';

// Hook for daily earnings data
export const useDailyEarnings = () => {
  const [data, setData] = useState({
    remainingTarget: 25000,
    achievedToday: 18500,
    totalTarget: 43500,
    percentage: 42.5,
    weeklyRemainingTarget: 85000,
    lastUpdated: new Date().toLocaleTimeString(),
  });

  // TODO: Replace with actual database query
  // Example: const fetchData = async () => {
  //   const response = await fetch('/api/daily-earnings?userId=' + userId);
  //   const result = await response.json();
  //   setData(result);
  // };

  return data;
};

// Hook for target metrics (AB, Tonnage, OC)
export const useTargets = () => {
  const [targets, setTargets] = useState([
    {
      id: 1,
      name: 'AB',
      fullName: 'Annual Budget',
      achieved: 75000,
      target: 100000,
      percentage: 75,
      status: 'on-track', // 'on-track', 'warning', 'critical'
      unit: '₹',
    },
    {
      id: 2,
      name: 'Tonnage',
      fullName: 'Product Tonnage',
      achieved: 450,
      target: 600,
      percentage: 75,
      status: 'on-track',
      unit: 'tons',
    },
    {
      id: 3,
      name: 'OC',
      fullName: 'Order Count',
      achieved: 82,
      target: 150,
      percentage: 54.67,
      status: 'warning',
      unit: 'orders',
    },
  ]);

  // TODO: Replace with actual database query
  // Example query placeholder:
  // SELECT
  //   target_type,
  //   SUM(achieved_value) as achieved,
  //   target_value,
  //   (SUM(achieved_value) / target_value * 100) as percentage
  // FROM sales_targets
  // WHERE user_id = ? AND month = CURRENT_MONTH
  // GROUP BY target_type;

  return targets;
};

// Hook for rankings data
export const useRankings = () => {
  const [rankingType, setRankingType] = useState('city'); // 'city' or 'cluster'
  const [rankings, setRankings] = useState({
    city: [
      { rank: 1, name: 'Rajesh Kumar', achievement: 95, revenue: 125000, id: 101 },
      { rank: 2, name: 'Priya Sharma', achievement: 88, revenue: 118000, id: 102 },
      { rank: 3, name: 'You', achievement: 75, revenue: 95000, id: 103, isCurrentUser: true },
      { rank: 4, name: 'Amit Patel', achievement: 70, revenue: 88000, id: 104 },
      { rank: 5, name: 'Sneha Reddy', achievement: 68, revenue: 85000, id: 105 },
    ],
    cluster: [
      { rank: 8, name: 'Vikram Singh', achievement: 82, revenue: 105000, id: 201 },
      { rank: 9, name: 'Deepak Verma', achievement: 78, revenue: 98000, id: 202 },
      { rank: 10, name: 'You', achievement: 75, revenue: 95000, id: 103, isCurrentUser: true },
      { rank: 11, name: 'Kavita Desai', achievement: 72, revenue: 92000, id: 203 },
      { rank: 12, name: 'Rohit Malhotra', achievement: 70, revenue: 89000, id: 204 },
    ],
  });

  // TODO: Replace with actual database query
  // Example query placeholder:
  // SELECT
  //   u.user_id,
  //   u.name,
  //   RANK() OVER (ORDER BY SUM(s.revenue) DESC) as rank,
  //   SUM(s.revenue) as revenue,
  //   (SUM(s.revenue) / u.target * 100) as achievement
  // FROM users u
  // JOIN sales s ON u.user_id = s.user_id
  // WHERE u.city = ? OR u.cluster = ?
  // GROUP BY u.user_id
  // HAVING rank BETWEEN (SELECT rank - 2) AND (SELECT rank + 2);

  const toggleRankingType = () => {
    setRankingType(prev => prev === 'city' ? 'cluster' : 'city');
  };

  return {
    rankings: rankings[rankingType],
    rankingType,
    toggleRankingType,
  };
};

// Hook for user authentication
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = (credentials) => {
    // TODO: Replace with actual authentication logic
    // Example:
    // const response = await fetch('/api/auth/login', {
    //   method: 'POST',
    //   body: JSON.stringify(credentials),
    // });
    // if (response.ok) {
    //   const userData = await response.json();
    //   setUser(userData);
    //   setIsAuthenticated(true);
    // }

    // Placeholder logic
    if (credentials.username && credentials.password) {
      setUser({
        id: 103,
        name: 'Sales Executive',
        email: credentials.email,
        username: credentials.username,
      });
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    isAuthenticated,
    login,
    logout,
  };
};

// Hook for metrics pages (Metric1, Metric2, Metric3)
export const useMetricsData = (metricType) => {
  const [data, setData] = useState({
    metric1: {
      title: 'Customer Acquisition',
      value: 245,
      target: 300,
      percentage: 81.67,
      trend: '+12%',
      chartData: [65, 72, 68, 80, 85, 90, 95],
    },
    metric2: {
      title: 'Product Mix',
      value: 18,
      target: 25,
      percentage: 72,
      trend: '+5%',
      chartData: [50, 55, 60, 58, 65, 70, 72],
    },
    metric3: {
      title: 'Market Coverage',
      value: 42,
      target: 50,
      percentage: 84,
      trend: '+8%',
      chartData: [70, 72, 75, 78, 80, 82, 84],
    },
  });

  // TODO: Replace with actual database query
  // Example query for specific metric:
  // SELECT
  //   metric_value,
  //   metric_target,
  //   DATE(created_at) as date
  // FROM metrics
  // WHERE user_id = ? AND metric_type = ?
  // ORDER BY created_at DESC
  // LIMIT 7;

  return data[metricType] || {};
};

// Hook for earnings breakdown
export const useEarningsData = () => {
  const [earnings, setEarnings] = useState({
    totalEarnings: 95000,
    baseIncentive: 45000,
    performanceBonus: 35000,
    targetBonus: 15000,
    monthlyBreakdown: [
      { month: 'Jan', amount: 78000 },
      { month: 'Feb', amount: 82000 },
      { month: 'Mar', amount: 88000 },
      { month: 'Apr', amount: 95000 },
    ],
    projectedEarnings: 105000,
  });

  // TODO: Replace with actual database query
  // Example:
  // SELECT
  //   SUM(base_incentive) as base,
  //   SUM(performance_bonus) as performance,
  //   SUM(target_bonus) as target_bonus,
  //   MONTH(date) as month
  // FROM earnings
  // WHERE user_id = ? AND YEAR(date) = CURRENT_YEAR
  // GROUP BY MONTH(date);

  return earnings;
};

// Hook for Nudge Zone - All customers
export const useNudgeZoneCustomers = () => {
  const [customers] = useState([
    { customerId: 'C001', customerName: 'Rajesh Enterprises', phoneNumber: '+91 98765 43210', lastOrder: '2 days ago' },
    { customerId: 'C002', customerName: 'Sharma Traders', phoneNumber: '+91 98765 43211', lastOrder: '1 week ago' },
    { customerId: 'C003', customerName: 'Kumar & Sons', phoneNumber: '+91 98765 43212', lastOrder: '3 days ago' },
    { customerId: 'C004', customerName: 'Patel Industries', phoneNumber: '+91 98765 43213', lastOrder: '5 days ago' },
    { customerId: 'C005', customerName: 'Singh Distributors', phoneNumber: '+91 98765 43214', lastOrder: '1 day ago' },
    { customerId: 'C006', customerName: 'Gupta Wholesale', phoneNumber: '+91 98765 43215', lastOrder: '4 days ago' },
    { customerId: 'C007', customerName: 'Mehta Retail', phoneNumber: '+91 98765 43216', lastOrder: '6 days ago' },
    { customerId: 'C008', customerName: 'Verma Stores', phoneNumber: '+91 98765 43217', lastOrder: '2 days ago' },
    { customerId: 'C009', customerName: 'Reddy Outlets', phoneNumber: '+91 98765 43218', lastOrder: '3 days ago' },
    { customerId: 'C010', customerName: 'Chopra Trading Co', phoneNumber: '+91 98765 43219', lastOrder: '1 week ago' },
  ]);

  // TODO: Replace with actual database query
  // Example:
  // SELECT customer_id, customer_name, phone_number,
  //        MAX(order_date) as last_order
  // FROM customers c
  // LEFT JOIN orders o ON c.customer_id = o.customer_id
  // WHERE c.assigned_to = ?
  // GROUP BY c.customer_id
  // ORDER BY last_order DESC;

  return customers;
};

// Hook for "So Close" customers - Opened app but didn't order
export const useSoCloseCustomers = () => {
  const [customers] = useState([
    { customerId: 'C011', customerName: 'Bajaj Enterprises', phoneNumber: '+91 98765 43220', lastSeen: 'Today 10:30 AM' },
    { customerId: 'C012', customerName: 'Kapoor Traders', phoneNumber: '+91 98765 43221', lastSeen: 'Today 9:15 AM' },
    { customerId: 'C013', customerName: 'Malhotra & Co', phoneNumber: '+91 98765 43222', lastSeen: 'Today 11:45 AM' },
    { customerId: 'C014', customerName: 'Joshi Industries', phoneNumber: '+91 98765 43223', lastSeen: 'Today 8:20 AM' },
    { customerId: 'C015', customerName: 'Desai Wholesale', phoneNumber: '+91 98765 43224', lastSeen: 'Today 2:30 PM' },
  ]);

  // TODO: Replace with actual database query
  // Example:
  // SELECT customer_id, customer_name, phone_number, last_login
  // FROM customers c
  // JOIN app_sessions s ON c.customer_id = s.customer_id
  // WHERE DATE(s.last_login) = CURRENT_DATE
  //   AND c.customer_id NOT IN (
  //     SELECT customer_id FROM orders WHERE DATE(order_date) = CURRENT_DATE
  //   )
  // ORDER BY s.last_login DESC;

  return customers;
};

// Hook for nearby customers
export const useNearbyCustomers = () => {
  const [customers] = useState([
    { customerId: 'C016', customerName: 'Agarwal Stores', phoneNumber: '+91 98765 43225', distance: '0.5 km', location: 'MG Road' },
    { customerId: 'C017', customerName: 'Bhatt Retail', phoneNumber: '+91 98765 43226', distance: '1.2 km', location: 'Sector 5' },
    { customerId: 'C018', customerName: 'Chauhan Traders', phoneNumber: '+91 98765 43227', distance: '0.8 km', location: 'Main Market' },
    { customerId: 'C019', customerName: 'Dhawan Enterprises', phoneNumber: '+91 98765 43228', distance: '1.5 km', location: 'Industrial Area' },
    { customerId: 'C020', customerName: 'Bansal Wholesale', phoneNumber: '+91 98765 43229', distance: '0.3 km', location: 'Near Metro' },
  ]);

  // TODO: Replace with actual database query using geolocation
  // Example:
  // SELECT customer_id, customer_name, phone_number, address,
  //        ST_Distance_Sphere(
  //          point(longitude, latitude),
  //          point(?, ?)
  //        ) / 1000 as distance_km
  // FROM customers
  // WHERE assigned_to = ?
  // HAVING distance_km < 5
  // ORDER BY distance_km ASC
  // LIMIT 10;

  return customers;
};

// Simulated real-time data updates (optional)
export const useRealtimeUpdates = (callback, interval = 30000) => {
  useEffect(() => {
    const timer = setInterval(() => {
      // TODO: Replace with actual real-time data fetching
      // Example: WebSocket connection or polling
      callback();
    }, interval);

    return () => clearInterval(timer);
  }, [callback, interval]);
};
