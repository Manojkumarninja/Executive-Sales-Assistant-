import {
  useNearbyCustomers,
} from '../hooks/usePlaceholderData';
import DailyEarningsCard from '../components/home/DailyEarningsCard';
import TargetCard from '../components/home/TargetCard';
import RankingsCard from '../components/home/RankingsCard';
import CustomerListCard from '../components/home/CustomerListCard';
import GlobalRefreshButton from '../components/shared/GlobalRefreshButton';
import CountdownTimer from '../components/shared/CountdownTimer';
import { FaClock } from 'react-icons/fa';
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  trackPageView,
  trackHomeTargetsToggle,
  trackLeaderboardPeriodToggle,
  trackLeaderboardLayerToggle,
  trackLeaderboardView,
  trackGlobalRefresh
} from '../utils/analytics';
import { useDataCache } from '../contexts/DataCacheContext';
import { API_BASE_URL } from '../config';

const Home = () => {
  const { getCache, updateCache } = useDataCache();
  const nearbyCustomers = useNearbyCustomers();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [targetType, setTargetType] = useState('daily'); // 'daily' or 'weekly'
  const [targets, setTargets] = useState([]);
  const [loadingTargets, setLoadingTargets] = useState(true);
  const dailyEarningsRef = useRef(null);

  // Leaderboard state
  const [rankings, setRankings] = useState([]);
  const [rankingType, setRankingType] = useState('city'); // 'city' or 'cluster'
  const [rankingPeriod, setRankingPeriod] = useState('day'); // 'day' or 'week'
  const [loadingRankings, setLoadingRankings] = useState(true);
  const [isGrouped, setIsGrouped] = useState(false); // Track if data is grouped by cluster

  // Customer data state
  const [nudgeZoneCustomers, setNudgeZoneCustomers] = useState([]);
  const [soCloseCustomers, setSoCloseCustomers] = useState([]);
  const [loadingNudgeZone, setLoadingNudgeZone] = useState(true);
  const [loadingSoClose, setLoadingSoClose] = useState(true);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Nudge Zone customers with caching
  const fetchNudgeZoneCustomers = useCallback(async () => {
    // Check cache first
    const cachedData = getCache('homeNudgeZone');
    if (cachedData) {
      setNudgeZoneCustomers(cachedData);
      setLoadingNudgeZone(false);
      // Continue fetching fresh data in background
    } else {
      setLoadingNudgeZone(true);
    }

    try {
      const user = JSON.parse(localStorage.getItem('user_data'));
      if (!user?.employee_id) {
        console.error('No employee ID found for Nudge Zone customers');
        setNudgeZoneCustomers([]);
        setLoadingNudgeZone(false);
        return;
      }

      const endpoint = `${API_BASE_URL}/customers/nudge-zone/${user.employee_id}`;
      const response = await fetch(endpoint);
      const data = await response.json();

      if (data.success && data.customers && Array.isArray(data.customers)) {
        setNudgeZoneCustomers(data.customers);
        updateCache('homeNudgeZone', data.customers);
      } else {
        console.warn('No Nudge Zone customers or invalid response');
        setNudgeZoneCustomers([]);
      }
    } catch (error) {
      console.error('Error fetching Nudge Zone customers:', error);
      setNudgeZoneCustomers([]);
    } finally {
      setLoadingNudgeZone(false);
    }
  }, [getCache, updateCache]);

  // Fetch So Close customers with caching
  const fetchSoCloseCustomers = useCallback(async () => {
    // Check cache first
    const cachedData = getCache('homeSoClose');
    if (cachedData) {
      setSoCloseCustomers(cachedData);
      setLoadingSoClose(false);
      // Continue fetching fresh data in background
    } else {
      setLoadingSoClose(true);
    }

    try {
      const user = JSON.parse(localStorage.getItem('user_data'));
      if (!user?.employee_id) {
        console.error('No employee ID found for So Close customers');
        setSoCloseCustomers([]);
        setLoadingSoClose(false);
        return;
      }

      const endpoint = `${API_BASE_URL}/customers/so-close/${user.employee_id}`;
      const response = await fetch(endpoint);
      const data = await response.json();

      if (data.success && data.customers && Array.isArray(data.customers)) {
        setSoCloseCustomers(data.customers);
        updateCache('homeSoClose', data.customers);
      } else {
        console.warn('No So Close customers or invalid response');
        setSoCloseCustomers([]);
      }
    } catch (error) {
      console.error('Error fetching So Close customers:', error);
      setSoCloseCustomers([]);
    } finally {
      setLoadingSoClose(false);
    }
  }, [getCache, updateCache]);

  // Fetch customer data on mount
  useEffect(() => {
    fetchNudgeZoneCustomers();
    fetchSoCloseCustomers();
  }, [fetchNudgeZoneCustomers, fetchSoCloseCustomers]);

  // Track page view on mount
  useEffect(() => {
    trackPageView('Home');
  }, []);

  // Fetch targets based on targetType with caching
  const fetchTargets = useCallback(async () => {
    // Check cache first
    const cacheKey = `homeTargets_${targetType}`;
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      setTargets(cachedData);
      setLoadingTargets(false);
      // Continue fetching fresh data in background
    } else {
      setLoadingTargets(true);
    }

    try {
      const user = JSON.parse(localStorage.getItem('user_data'));
      if (!user?.employee_id) {
        console.error('No employee ID found in localStorage');
        setTargets([]);
        setLoadingTargets(false);
        return;
      }

      const endpoint = targetType === 'daily'
        ? `${API_BASE_URL}/targets/daily/${user.employee_id}`
        : `${API_BASE_URL}/targets/weekly/${user.employee_id}`;

      const response = await fetch(endpoint);
      const data = await response.json();

      if (data.success && data.targets && Array.isArray(data.targets)) {
        const transformedTargets = data.targets.map((target, index) => {
          const achieved = target.achieved || 0;
          const targetValue = target.target || 1;
          const percentage = (achieved / targetValue) * 100;

          return {
            id: index + 1,
            name: target.metric,
            fullName: target.unit,
            shortName: target.metric,
            description: target.unit,
            achieved: achieved,
            target: targetValue,
            percentage: percentage,
            unit: target.unit.includes('Count') ? 'orders' : (target.unit.includes('Base') ? 'bases' : 'units'),
            status: percentage >= 75 ? 'on-track' : 'needs-attention',
            route: `/metric${index + 1}`,
            slab1_target: target.slab1_target || 0,
            slab2_target: target.slab2_target || 0,
            slab3_target: target.slab3_target || 0,
            incentive_pending: target.incentive_pending || 0
          };
        });
        setTargets(transformedTargets);
        updateCache(cacheKey, transformedTargets);
      } else {
        console.warn('No targets data or invalid response');
        setTargets([]);
      }
    } catch (error) {
      console.error('Error fetching targets:', error);
      setTargets([]);
    } finally {
      setLoadingTargets(false);
    }
  }, [targetType, getCache, updateCache]);

  useEffect(() => {
    fetchTargets();
  }, [fetchTargets]);

  // Fetch rankings based on rankingType and rankingPeriod with caching
  const fetchRankings = useCallback(async () => {
    // Check cache first
    const cacheKey = `homeRankings_${rankingPeriod}_${rankingType}`;
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      setRankings(cachedData.rankings);
      setIsGrouped(cachedData.grouped);
      setLoadingRankings(false);
      // Continue fetching fresh data in background
    } else {
      setLoadingRankings(true);
    }

    try {
      const user = JSON.parse(localStorage.getItem('user_data'));
      if (!user?.employee_id) {
        console.error('No employee ID found for rankings');
        setRankings([]);
        setLoadingRankings(false);
        return;
      }

      const endpoint = `${API_BASE_URL}/leaderboard/${user.employee_id}?period=${rankingPeriod}&layer=${rankingType}`;
      const response = await fetch(endpoint);
      const data = await response.json();

      if (data.success && data.rankings && Array.isArray(data.rankings)) {
        setRankings(data.rankings);
        setIsGrouped(data.grouped || false);
        updateCache(cacheKey, { rankings: data.rankings, grouped: data.grouped || false });
      } else {
        console.warn('No rankings data or invalid response');
        setRankings([]);
        setIsGrouped(false);
      }
    } catch (error) {
      console.error('Error fetching rankings:', error);
      setRankings([]);
    } finally {
      setLoadingRankings(false);
    }
  }, [rankingPeriod, rankingType, getCache, updateCache]);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  // Global refresh handler - refreshes all data on the page
  const handleGlobalRefresh = useCallback(async () => {
    console.log('🔄 Global refresh: Refreshing all data...');

    // Track global refresh event
    trackGlobalRefresh();

    // Refresh targets
    await fetchTargets();

    // Refresh rankings
    await fetchRankings();

    // Refresh customer data
    await fetchNudgeZoneCustomers();
    await fetchSoCloseCustomers();

    // Refresh daily earnings (call the child component's refresh)
    if (dailyEarningsRef.current?.refresh) {
      await dailyEarningsRef.current.refresh();
    }

    console.log('✅ Global refresh complete!');
  }, [fetchTargets, fetchRankings, fetchNudgeZoneCustomers, fetchSoCloseCustomers]);

  // Note: Data refreshes only on manual actions (pull-to-refresh or refresh button)
  // No automatic refresh on page navigation or app resume

  const toggleTargetType = () => {
    setTargetType(prev => {
      const newType = prev === 'daily' ? 'weekly' : 'daily';
      // Track the toggle event
      trackHomeTargetsToggle(newType);
      return newType;
    });
  };

  const toggleRankingType = () => {
    setRankingType(prev => {
      const newType = prev === 'city' ? 'cluster' : 'city';
      // Track the layer toggle event
      trackLeaderboardLayerToggle(newType);
      // Track combined view with current period
      trackLeaderboardView(rankingPeriod, newType);
      return newType;
    });
  };

  const toggleRankingPeriod = () => {
    setRankingPeriod(prev => {
      const newPeriod = prev === 'day' ? 'week' : 'day';
      // Track the period toggle event
      trackLeaderboardPeriodToggle(newPeriod);
      // Track combined view with current layer
      trackLeaderboardView(newPeriod, rankingType);
      return newPeriod;
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Welcome Back Ninja! 👋
            </h1>
            <p className="text-gray-600 flex items-center">
              <FaClock className="mr-2 text-primary" />
              {formatDate(currentTime)}
            </p>
          </div>

          {/* Global Refresh Button - Inline */}
          <GlobalRefreshButton onRefresh={handleGlobalRefresh} />
        </div>
      </div>

      {/* Countdown Timer */}
      <div className="animate-fade-in mb-4" style={{ animationDelay: '0.05s' }}>
        <CountdownTimer />
      </div>

      {/* Daily Earnings Section */}
      <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <DailyEarningsCard ref={dailyEarningsRef} />
      </div>

      {/* Targets Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <span className="w-2 h-8 bg-primary rounded-full mr-3"></span>
            Your Targets
          </h2>
          {/* Daily/Weekly Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={toggleTargetType}
              className={`px-4 py-2 rounded-md font-medium transition-all ${
                targetType === 'daily'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Daily
            </button>
            <button
              onClick={toggleTargetType}
              className={`px-4 py-2 rounded-md font-medium transition-all ${
                targetType === 'weekly'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Weekly
            </button>
          </div>
        </div>
        {loadingTargets ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : targets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {targets.map((target) => (
              <div key={target.id}>
                <TargetCard target={target} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-xl">
            <p className="text-gray-600">No targets assigned for this period</p>
          </div>
        )}
      </div>

      {/* Rankings Section */}
      <div className="animate-fade-in mb-6" style={{ animationDelay: '0.5s' }}>
        {loadingRankings ? (
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Leaderboard Rankings</h2>
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </div>
        ) : (
          <RankingsCard
            rankings={rankings}
            rankingType={rankingType}
            onToggleLayer={toggleRankingType}
            period={rankingPeriod}
            onTogglePeriod={toggleRankingPeriod}
            isGrouped={isGrouped}
          />
        )}
      </div>

      {/* Customer Sections */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <span className="w-2 h-8 bg-primary rounded-full mr-3"></span>
          Customer Engagement
        </h2>
      </div>

      {/* Customer Cards in Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Nudge Zone */}
        <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <CustomerListCard
            title="💬 Nudge Zone"
            subtitle="All your customers - time to connect!"
            customers={nudgeZoneCustomers}
            showLastOrder={true}
            iconColor="text-primary"
            source="nudge-zone"
          />
        </div>

        {/* So Close */}
        <div className="animate-fade-in" style={{ animationDelay: '0.7s' }}>
          <CustomerListCard
            title="🔥 So Close!"
            subtitle="Opened the app but didn't order today"
            customers={soCloseCustomers}
            showLastSeen={true}
            iconColor="text-warning"
            source="so-close"
          />
        </div>

        {/* Nearby Customers - DISABLED FOR NOW (to re-enable, uncomment this section) */}
        {/* <div className="animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <CustomerListCard
            title="📍 In and Around You"
            subtitle="Customers near your location"
            customers={nearbyCustomers}
            showDistance={true}
            iconColor="text-success"
            source="nearby"
          />
        </div> */}
      </div>

      {/* Motivational Quote */}
      <div className="mt-6 card p-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 animate-fade-in" style={{ animationDelay: '0.9s' }}>
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-800 mb-2">
            "Success is not final, failure is not fatal: It is the courage to continue that counts."
          </p>
          <p className="text-sm text-gray-600">- Winston Churchill</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
