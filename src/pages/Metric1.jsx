import { useCallback } from 'react';
import { useMetricsData } from '../hooks/usePlaceholderData';
import ProgressBar from '../components/shared/ProgressBar';
import AnimatedCounter from '../components/shared/AnimatedCounter';
import PullToRefresh from '../components/shared/PullToRefresh';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { FaUsers, FaChartLine, FaArrowUp } from 'react-icons/fa';

const Metric1 = () => {
  const data = useMetricsData('metric1');
  const { title, value, target, percentage, trend, chartData } = data;

  // Scroll-to-refresh handler
  const handleRefresh = useCallback(async () => {
    console.log('🔄 Refreshing metric data...');
    window.location.reload();
  }, []);

  const { isRefreshing } = usePullToRefresh(handleRefresh);

  return (
    <>
      <PullToRefresh isRefreshing={isRefreshing} />
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center">
          <FaUsers className="text-primary mr-4" />
          {title || 'Metric 1'}
        </h1>
        <p className="text-gray-600">Track and analyze your customer acquisition metrics</p>
      </div>

      {/* Main Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Current Value */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600">Current</h3>
            <FaChartLine className="text-primary text-2xl" />
          </div>
          <div className="text-4xl font-bold text-gray-900">
            <AnimatedCounter value={value || 0} />
          </div>
          <p className="text-sm text-gray-500 mt-2">Total acquisitions</p>
        </div>

        {/* Target Value */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600">Target</h3>
            <FaArrowUp className="text-success text-2xl" />
          </div>
          <div className="text-4xl font-bold text-gray-900">{target || 0}</div>
          <p className="text-sm text-gray-500 mt-2">Monthly goal</p>
        </div>

        {/* Trend */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600">Trend</h3>
            <div className="w-8 h-8 bg-success bg-opacity-10 rounded-full flex items-center justify-center">
              <FaArrowUp className="text-success" />
            </div>
          </div>
          <div className="text-4xl font-bold text-success">{trend || '+0%'}</div>
          <p className="text-sm text-gray-500 mt-2">vs last month</p>
        </div>
      </div>

      {/* Progress Section */}
      <div className="card p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Progress Overview</h2>
        <ProgressBar percentage={percentage || 0} height="16px" showLabel={true} />
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Remaining</p>
            <p className="text-2xl font-bold text-gray-900">{(target || 0) - (value || 0)}</p>
          </div>
          <div className="p-4 bg-primary bg-opacity-5 rounded-lg">
            <p className="text-sm text-gray-600">Completion</p>
            <p className="text-2xl font-bold text-primary">{(percentage || 0).toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="card p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Weekly Trend</h2>
        <div className="h-64 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg flex items-center justify-center border-2 border-dashed border-purple-300">
          <div className="text-center">
            <FaChartLine className="text-6xl text-purple-300 mb-4 mx-auto" />
            <p className="text-gray-600 font-semibold">Chart visualization placeholder</p>
            <p className="text-sm text-gray-500 mt-2">TODO: Replace with actual chart data from database</p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Metric1;
