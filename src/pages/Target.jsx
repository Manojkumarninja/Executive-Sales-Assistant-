import { useState, useEffect, useCallback } from 'react';
import PullToRefresh from '../components/shared/PullToRefresh';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import CustomerDetailModal from '../components/shared/CustomerDetailModal';
import CustomDropdown from '../components/shared/CustomDropdown';
import { FaChevronDown, FaUser, FaPhone } from 'react-icons/fa';
import { trackPageView, trackTargetPageToggle, trackPullToRefresh } from '../utils/analytics';
import { useDataCache } from '../contexts/DataCacheContext';

const Target = () => {
  const { getCache, updateCache, getTargetCustomersCache, updateTargetCustomersCache } = useDataCache();
  const [targetType, setTargetType] = useState('daily'); // 'daily' or 'weekly'
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('');
  const [metricCustomers, setMetricCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Track page view on mount
  useEffect(() => {
    trackPageView('Target');
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
        ? `http://localhost:5000/api/targets/daily/${user.employee_id}`
        : `http://localhost:5000/api/targets/weekly/${user.employee_id}`;

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

      const endpoint = `http://localhost:5000/api/target-customers/${user.employee_id}?metric=${encodeURIComponent(metricName)}&period=${period}`;
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
      trackTargetPageToggle(newType);
      return newType;
    });
  };

  const handleCustomerClick = (customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
  };

  return (
    <>
      <PullToRefresh isRefreshing={isRefreshing} />
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center">
                <span className="w-2 h-10 bg-primary rounded-full mr-3"></span>
                Customers
              </h1>
              <p className="text-gray-600">Target customers based on {targetType} metrics</p>
            </div>

            {/* Daily/Weekly Toggle and Metric Dropdown */}
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
                onChange={(value) => setSelectedMetric(value)}
                placeholder="Choose Metric"
              />
            </div>
          </div>
        </div>

        {/* Customer List Section */}
        {!selectedMetric ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="bg-gradient-to-br from-primary-50 to-purple-50 rounded-2xl p-12 border-2 border-dashed border-primary-200">
              <FaChevronDown className="text-6xl text-primary mx-auto mb-4 animate-bounce" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Select a Metric</h3>
              <p className="text-gray-600 text-lg">Choose a metric from the dropdown above to view customer list</p>
            </div>
          </div>
        ) : (
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

            {loadingCustomers ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : metricCustomers.length > 0 ? (
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
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <FaUser className="text-6xl text-gray-300 mb-4 mx-auto" />
                <p className="text-gray-600 text-lg">No customers found for this metric</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Customer Detail Modal */}
      <CustomerDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        customer={selectedCustomer}
      />
    </>
  );
};

export default Target;
