import { useState, useEffect, useCallback } from 'react';
import PullToRefresh from '../components/shared/PullToRefresh';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import CustomerDetailModal from '../components/shared/CustomerDetailModal';
import AttentionSKUModal from '../components/shared/AttentionSKUModal';
import BaseCustomerDetailModal from '../components/shared/BaseCustomerDetailModal';
import CustomDropdown from '../components/shared/CustomDropdown';
import { FaChevronDown, FaUser, FaPhone, FaBullseye, FaExclamationCircle, FaDatabase } from 'react-icons/fa';
import { trackPageView, trackCustomersPageToggle, trackPullToRefresh, trackCustomerDetailViewed, trackCustomersMetricSelected } from '../utils/analytics';
import { useDataCache } from '../contexts/DataCacheContext';
import { API_BASE_URL } from '../config';

const Target = () => {
  const { getCache, updateCache, getTargetCustomersCache, updateTargetCustomersCache } = useDataCache();

  // Tab state
  const [activeTab, setActiveTab] = useState('target'); // 'target', 'attention', 'base'

  // Target tab state
  const [targetType, setTargetType] = useState('daily'); // 'daily' or 'weekly'
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('');
  const [metricCustomers, setMetricCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Attention tab state
  const [attentionMetrics, setAttentionMetrics] = useState([]);
  const [loadingAttentionMetrics, setLoadingAttentionMetrics] = useState(false);
  const [selectedAttentionMetric, setSelectedAttentionMetric] = useState('');
  const [attentionCustomers, setAttentionCustomers] = useState([]);
  const [loadingAttentionCustomers, setLoadingAttentionCustomers] = useState(false);
  const [isAttentionModalOpen, setIsAttentionModalOpen] = useState(false);
  const [selectedAttentionCustomer, setSelectedAttentionCustomer] = useState(null);

  // Base tab state
  const [baseCustomers, setBaseCustomers] = useState([]);
  const [loadingBaseCustomers, setLoadingBaseCustomers] = useState(false);
  const [baseCustomerIdFilter, setBaseCustomerIdFilter] = useState('');
  const [baseContactFilter, setBaseContactFilter] = useState('');
  const [isBaseModalOpen, setIsBaseModalOpen] = useState(false);
  const [selectedBaseCustomer, setSelectedBaseCustomer] = useState(false);

  // Track page view on mount
  useEffect(() => {
    trackPageView('Customers');
  }, []);

  // Fetch targets based on targetType with caching
  const fetchTargets = useCallback(async () => {
    // Check cache first
    const cacheKey = `targetPage_${targetType}`;
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      setTargets(cachedData);
      setLoading(false);
      // Continue fetching fresh data in background
    } else {
      setLoading(true);
    }

    try {
      const user = JSON.parse(localStorage.getItem('user_data'));
      if (!user?.employee_id) {
        console.error('No employee ID found in localStorage');
        setTargets([]);
        setLoading(false);
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
            achieved: achieved,
            target: targetValue,
            percentage: percentage,
            unit: target.unit.includes('Count') ? 'orders' : (target.unit.includes('Base') ? 'bases' : 'units'),
            status: percentage >= 75 ? 'on-track' : 'needs-attention'
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
      setLoading(false);
    }
  }, [targetType, getCache, updateCache]);

  useEffect(() => {
    fetchTargets();
  }, [fetchTargets]);

  // Fetch customers based on selected metric and target type (daily/weekly) with caching
  const fetchCustomersByMetric = useCallback(async (metricName, period) => {
    if (!metricName) {
      setMetricCustomers([]);
      return;
    }

    // Check cache first
    const cachedData = getTargetCustomersCache(metricName, period);
    if (cachedData) {
      setMetricCustomers(cachedData);
      setLoadingCustomers(false);
      // Continue fetching fresh data in background
    } else {
      setLoadingCustomers(true);
    }

    try {
      const user = JSON.parse(localStorage.getItem('user_data'));
      if (!user?.employee_id) {
        console.error('No employee ID found in localStorage');
        setMetricCustomers([]);
        setLoadingCustomers(false);
        return;
      }

      const endpoint = `${API_BASE_URL}/target-customers/${user.employee_id}?metric=${encodeURIComponent(metricName)}&period=${period}`;
      const response = await fetch(endpoint);
      const data = await response.json();

      if (data.success && data.customers && Array.isArray(data.customers)) {
        setMetricCustomers(data.customers);
        updateTargetCustomersCache(metricName, period, data.customers);
      } else {
        console.warn('No customers data or invalid response');
        setMetricCustomers([]);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setMetricCustomers([]);
    } finally {
      setLoadingCustomers(false);
    }
  }, [getTargetCustomersCache, updateTargetCustomersCache]);

  // When selectedMetric or targetType changes, fetch customers
  useEffect(() => {
    if (selectedMetric) {
      fetchCustomersByMetric(selectedMetric, targetType);
    } else {
      setMetricCustomers([]);
    }
  }, [selectedMetric, targetType, fetchCustomersByMetric]);

  // Note: Data refreshes only on manual actions (pull-to-refresh)
  // No automatic refresh on page navigation or app resume

  // Scroll-to-refresh handler
  const handleRefresh = useCallback(async () => {
    console.log('🔄 Refreshing target data...');
    trackPullToRefresh('Target');
    await fetchTargets();
    if (selectedMetric) {
      await fetchCustomersByMetric(selectedMetric, targetType);
    }
  }, [fetchTargets, selectedMetric, targetType, fetchCustomersByMetric]);

  const { isRefreshing } = usePullToRefresh(handleRefresh);

  const toggleTargetType = () => {
    setTargetType(prev => {
      const newType = prev === 'daily' ? 'weekly' : 'daily';
      // Track the toggle event
      trackCustomersPageToggle(newType);
      return newType;
    });
  };

  const handleCustomerClick = (customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
    // Track customer detail viewed
    trackCustomerDetailViewed(customer.customerId, customer.customerName);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
  };

  // ============================================================================
  // ATTENTION TAB FUNCTIONS
  // ============================================================================

  // Fetch attention metrics when Attention tab is opened
  useEffect(() => {
    if (activeTab === 'attention') {
      fetchAttentionMetrics();
    }
  }, [activeTab]);

  const fetchAttentionMetrics = async () => {
    setLoadingAttentionMetrics(true);
    try {
      const user = JSON.parse(localStorage.getItem('user_data'));
      if (!user?.employee_id) {
        console.error('No employee ID found');
        setAttentionMetrics([]);
        setLoadingAttentionMetrics(false);
        return;
      }

      const endpoint = `${API_BASE_URL}/attention/metrics/${user.employee_id}`;
      const response = await fetch(endpoint);
      const data = await response.json();

      if (data.success && data.metrics) {
        setAttentionMetrics(data.metrics);
      } else {
        console.warn('No attention metrics found');
        setAttentionMetrics([]);
      }
    } catch (error) {
      console.error('Error fetching attention metrics:', error);
      setAttentionMetrics([]);
    } finally {
      setLoadingAttentionMetrics(false);
    }
  };

  // Fetch attention customers when metric is selected
  const fetchAttentionCustomers = useCallback(async (metricName) => {
    if (!metricName) {
      setAttentionCustomers([]);
      return;
    }

    setLoadingAttentionCustomers(true);
    try {
      const user = JSON.parse(localStorage.getItem('user_data'));
      if (!user?.employee_id) {
        console.error('No employee ID found');
        setAttentionCustomers([]);
        setLoadingAttentionCustomers(false);
        return;
      }

      const endpoint = `${API_BASE_URL}/attention/customers/${user.employee_id}?metric=${encodeURIComponent(metricName)}`;
      const response = await fetch(endpoint);
      const data = await response.json();

      if (data.success && data.customers) {
        setAttentionCustomers(data.customers);
      } else {
        console.warn('No customers found for attention metric');
        setAttentionCustomers([]);
      }
    } catch (error) {
      console.error('Error fetching attention customers:', error);
      setAttentionCustomers([]);
    } finally {
      setLoadingAttentionCustomers(false);
    }
  }, []);

  // When selectedAttentionMetric changes, fetch customers
  useEffect(() => {
    if (selectedAttentionMetric) {
      fetchAttentionCustomers(selectedAttentionMetric);
    } else {
      setAttentionCustomers([]);
    }
  }, [selectedAttentionMetric, fetchAttentionCustomers]);

  const handleAttentionCustomerClick = (customer) => {
    setSelectedAttentionCustomer(customer);
    setIsAttentionModalOpen(true);
  };

  const handleCloseAttentionModal = () => {
    setIsAttentionModalOpen(false);
    setSelectedAttentionCustomer(null);
  };

  // ============================================================================
  // BASE TAB FUNCTIONS
  // ============================================================================

  // Fetch base customers when Base tab is opened or filters change
  useEffect(() => {
    if (activeTab === 'base') {
      fetchBaseCustomers();
    }
  }, [activeTab, baseCustomerIdFilter, baseContactFilter]);

  const fetchBaseCustomers = async () => {
    setLoadingBaseCustomers(true);
    try {
      const user = JSON.parse(localStorage.getItem('user_data'));
      if (!user?.employee_id) {
        console.error('No employee ID found');
        setBaseCustomers([]);
        setLoadingBaseCustomers(false);
        return;
      }

      let endpoint = `${API_BASE_URL}/base/customers/${user.employee_id}`;
      const params = new URLSearchParams();
      if (baseCustomerIdFilter) params.append('customer_id', baseCustomerIdFilter);
      if (baseContactFilter) params.append('contact', baseContactFilter);
      if (params.toString()) endpoint += `?${params.toString()}`;

      const response = await fetch(endpoint);
      const data = await response.json();

      if (data.success && data.customers) {
        setBaseCustomers(data.customers);
      } else {
        console.warn('No base customers found');
        setBaseCustomers([]);
      }
    } catch (error) {
      console.error('Error fetching base customers:', error);
      setBaseCustomers([]);
    } finally {
      setLoadingBaseCustomers(false);
    }
  };

  const handleBaseCustomerClick = (customer) => {
    setSelectedBaseCustomer(customer);
    setIsBaseModalOpen(true);
  };

  const handleCloseBaseModal = () => {
    setIsBaseModalOpen(false);
    setSelectedBaseCustomer(null);
  };

  return (
    <>
      <PullToRefresh isRefreshing={isRefreshing} />
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center">
              <span className="w-2 h-10 bg-primary rounded-full mr-3"></span>
              Customers
            </h1>
            <p className="text-gray-600">
              {activeTab === 'target' && `Target customers based on ${targetType} metrics`}
              {activeTab === 'attention' && 'Customers requiring attention based on specific metrics'}
              {activeTab === 'base' && 'Base customers management'}
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('target')}
              className={`px-6 py-3 font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'target'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FaBullseye />
              Target
            </button>
            <button
              onClick={() => setActiveTab('attention')}
              className={`px-6 py-3 font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'attention'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FaExclamationCircle />
              Attention
            </button>
            <button
              onClick={() => setActiveTab('base')}
              className={`px-6 py-3 font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'base'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FaDatabase />
              Base
            </button>
          </div>

          {/* Target Tab Controls */}
          {activeTab === 'target' && (
            <div className="flex gap-4 items-center flex-wrap">
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

              {/* Custom Metric Dropdown */}
              <CustomDropdown
                options={targets.map(target => ({
                  value: target.name,
                  label: target.name
                }))}
                value={selectedMetric}
                onChange={(value) => {
                  setSelectedMetric(value);
                  // Track metric selection
                  trackCustomersMetricSelected(value, targetType);
                }}
                placeholder="Choose Metric"
              />
            </div>
          )}

          {/* Attention Tab Controls */}
          {activeTab === 'attention' && (
            <div className="flex gap-4 items-center flex-wrap">
              <CustomDropdown
                options={[
                  { value: 'All', label: 'All' },
                  ...attentionMetrics.map(metric => ({
                    value: metric,
                    label: metric
                  }))
                ]}
                value={selectedAttentionMetric}
                onChange={(value) => setSelectedAttentionMetric(value)}
                placeholder="Choose Metric"
              />
            </div>
          )}
        </div>

        {/* TARGET TAB CONTENT */}
        {activeTab === 'target' && !selectedMetric && (
          <div className="text-center py-20 animate-fade-in">
            <div className="bg-gradient-to-br from-primary-50 to-purple-50 rounded-2xl p-12 border-2 border-dashed border-primary-200">
              <FaChevronDown className="text-6xl text-primary mx-auto mb-4 animate-bounce" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Select a Metric</h3>
              <p className="text-gray-600 text-lg">Choose a metric from the dropdown above to view customer list</p>
            </div>
          </div>
        )}

        {activeTab === 'target' && selectedMetric && loadingCustomers && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="w-2 h-8 bg-primary rounded-full mr-3"></span>
                Customers for {selectedMetric}
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                Click on any customer to view detailed information and SKUs to pitch
              </p>
            </div>

            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </div>
        )}

        {activeTab === 'target' && selectedMetric && !loadingCustomers && metricCustomers.length > 0 && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="w-2 h-8 bg-primary rounded-full mr-3"></span>
                Customers for {selectedMetric}
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                Click on any customer to view detailed information and SKUs to pitch
              </p>
            </div>

            <div className="card p-6">
              {/* Customer List - Scrollable */}
              <div className="max-h-[600px] overflow-y-auto pr-2 space-y-3">
                {metricCustomers.map((customer) => (
                  <div
                    key={customer.customerId}
                    onClick={() => handleCustomerClick(customer)}
                    className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all duration-200 border border-gray-200 hover:border-primary hover:shadow-md cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      {/* Customer Info */}
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <FaUser className="text-gray-400 mr-2 text-sm" />
                          <h3 className="font-semibold text-gray-900">{customer.customerName}</h3>
                        </div>

                        <div className="space-y-1 ml-6">
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="font-medium text-gray-500 w-24">ID:</span>
                            <span className="text-gray-700">{customer.customerId}</span>
                          </div>

                          <div className="flex items-center text-sm text-gray-600">
                            <FaPhone className="mr-2 text-primary" />
                            <span className="text-primary">{customer.phoneNumber}</span>
                          </div>
                        </div>
                      </div>

                      {/* View Details Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCustomerClick(customer);
                        }}
                        className="ml-4 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-lg transition-all transform hover:scale-105"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-500">
                  Showing <span className="font-semibold text-gray-700">{metricCustomers.length}</span> customers
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'target' && selectedMetric && !loadingCustomers && metricCustomers.length === 0 && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="w-2 h-8 bg-primary rounded-full mr-3"></span>
                Customers for {selectedMetric}
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                Click on any customer to view detailed information and SKUs to pitch
              </p>
            </div>

            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <FaUser className="text-6xl text-gray-300 mb-4 mx-auto" />
              <p className="text-gray-600 text-lg">No customers found for this metric</p>
            </div>
          </div>
        )}

        {/* ATTENTION TAB CONTENT */}
        {activeTab === 'attention' && !selectedAttentionMetric && (
          <div className="text-center py-20 animate-fade-in">
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-12 border-2 border-dashed border-orange-200">
              <FaExclamationCircle className="text-6xl text-orange-500 mx-auto mb-4 animate-pulse" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Select a Metric</h3>
              <p className="text-gray-600 text-lg">Choose a metric from the dropdown above to view customers requiring attention</p>
            </div>
          </div>
        )}

        {activeTab === 'attention' && selectedAttentionMetric && loadingAttentionCustomers && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="w-2 h-8 bg-orange-500 rounded-full mr-3"></span>
                Attention Customers for {selectedAttentionMetric}
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                Click on any customer to view SKU details including order, billed, sale, return, and readjustment quantities
              </p>
            </div>

            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          </div>
        )}

        {activeTab === 'attention' && selectedAttentionMetric && !loadingAttentionCustomers && attentionCustomers.length > 0 && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="w-2 h-8 bg-orange-500 rounded-full mr-3"></span>
                Attention Customers for {selectedAttentionMetric}
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                Click on any customer to view SKU details including order, billed, sale, return, and readjustment quantities
              </p>
            </div>

            <div className="card p-6">
              {/* Customer List - Scrollable */}
              <div className="max-h-[600px] overflow-y-auto pr-2 space-y-3">
                {attentionCustomers.map((customer) => (
                  <div
                    key={customer.customerId}
                    onClick={() => handleAttentionCustomerClick(customer)}
                    className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-all duration-200 border border-orange-200 hover:border-orange-500 hover:shadow-md cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      {/* Customer Info */}
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <FaUser className="text-orange-400 mr-2 text-sm" />
                          <h3 className="font-semibold text-gray-900">{customer.customerName}</h3>
                        </div>

                        <div className="space-y-1 ml-6">
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="font-medium text-gray-500 w-24">ID:</span>
                            <span className="text-gray-700">{customer.customerId}</span>
                          </div>

                          <div className="flex items-center text-sm text-gray-600">
                            <FaPhone className="mr-2 text-orange-500" />
                            <span className="text-orange-600">{customer.phoneNumber}</span>
                          </div>
                        </div>
                      </div>

                      {/* View SKU Details Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAttentionCustomerClick(customer);
                        }}
                        className="ml-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-all transform hover:scale-105"
                      >
                        View SKU Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-500">
                  Showing <span className="font-semibold text-gray-700">{attentionCustomers.length}</span> customers
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attention' && selectedAttentionMetric && !loadingAttentionCustomers && attentionCustomers.length === 0 && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="w-2 h-8 bg-orange-500 rounded-full mr-3"></span>
                Attention Customers for {selectedAttentionMetric}
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                Click on any customer to view SKU details including order, billed, sale, return, and readjustment quantities
              </p>
            </div>

            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <FaUser className="text-6xl text-gray-300 mb-4 mx-auto" />
              <p className="text-gray-600 text-lg">No customers found for this metric</p>
            </div>
          </div>
        )}

        {/* BASE TAB CONTENT */}
        {activeTab === 'base' && (
          <div className="animate-fade-in">
            {/* Filters */}
            <div className="mb-6 flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Customer ID
                </label>
                <input
                  type="text"
                  value={baseCustomerIdFilter}
                  onChange={(e) => setBaseCustomerIdFilter(e.target.value)}
                  placeholder="Enter Customer ID"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Contact Number
                </label>
                <input
                  type="text"
                  value={baseContactFilter}
                  onChange={(e) => setBaseContactFilter(e.target.value)}
                  placeholder="Enter Contact Number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {(baseCustomerIdFilter || baseContactFilter) && (
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setBaseCustomerIdFilter('');
                      setBaseContactFilter('');
                    }}
                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>

            {/* Customer List */}
            {loadingBaseCustomers ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : baseCustomers.length > 0 ? (
              <div className="card p-6">
                <div className="max-h-[600px] overflow-y-auto pr-2 space-y-3">
                  {baseCustomers.map((customer) => (
                    <div
                      key={customer.customerId}
                      onClick={() => handleBaseCustomerClick(customer)}
                      className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all duration-200 border border-blue-200 hover:border-blue-500 hover:shadow-md cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <FaUser className="text-blue-400 mr-2 text-sm" />
                            <h3 className="font-semibold text-gray-900">{customer.customerName}</h3>
                          </div>
                          <div className="space-y-1 ml-6">
                            <div className="flex items-center text-sm text-gray-600">
                              <span className="font-medium text-gray-500 w-24">ID:</span>
                              <span className="text-gray-700">{customer.customerId}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <FaPhone className="mr-2 text-blue-500" />
                              <span className="text-blue-600">{customer.phoneNumber}</span>
                            </div>
                            {customer.customerType && (
                              <div className="flex items-center text-sm text-gray-600">
                                <span className="font-medium text-gray-500 w-24">Type:</span>
                                <span className="text-gray-700">{customer.customerType}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {/* View Details Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBaseCustomerClick(customer);
                          }}
                          className="ml-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg transition-all transform hover:scale-105"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                  <p className="text-sm text-gray-500">
                    Showing <span className="font-semibold text-gray-700">{baseCustomers.length}</span> customers
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <FaDatabase className="text-6xl text-gray-300 mb-4 mx-auto" />
                <p className="text-gray-600 text-lg">No customers found</p>
                {(baseCustomerIdFilter || baseContactFilter) && (
                  <p className="text-sm text-gray-500 mt-2">Try adjusting your filters</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Customer Detail Modal (Target Tab) */}
      <CustomerDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        customer={selectedCustomer}
      />

      {/* Attention SKU Modal (Attention Tab) */}
      <AttentionSKUModal
        isOpen={isAttentionModalOpen}
        onClose={handleCloseAttentionModal}
        customer={selectedAttentionCustomer}
        metric={selectedAttentionMetric}
      />

      {/* Base Customer Detail Modal (Base Tab) */}
      <BaseCustomerDetailModal
        isOpen={isBaseModalOpen}
        onClose={handleCloseBaseModal}
        customer={selectedBaseCustomer}
      />
    </>
  );
};

export default Target;
