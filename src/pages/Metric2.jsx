import { useCallback } from 'react';
import { useMetricsData } from '../hooks/usePlaceholderData';
import ProgressBar from '../components/shared/ProgressBar';
import AnimatedCounter from '../components/shared/AnimatedCounter';
import PullToRefresh from '../components/shared/PullToRefresh';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { FaBoxes, FaChartPie, FaTrophy } from 'react-icons/fa';

const Metric2 = () => {
  const data = useMetricsData('metric2');
  const { title, value, target, percentage, trend } = data;

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
          <FaBoxes className="text-primary mr-4" />
          {title || 'Metric 2'}
        </h1>
        <p className="text-gray-600">Monitor your product mix performance and diversity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="card p-6 border-l-4 border-primary">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Product Lines</h3>
          <div className="text-3xl font-bold text-gray-900">
            <AnimatedCounter value={value || 0} />
          </div>
        </div>
        <div className="card p-6 border-l-4 border-success">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Target</h3>
          <div className="text-3xl font-bold text-gray-900">{target || 0}</div>
        </div>
        <div className="card p-6 border-l-4 border-warning">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Achievement</h3>
          <div className="text-3xl font-bold text-warning">{(percentage || 0).toFixed(0)}%</div>
        </div>
        <div className="card p-6 border-l-4 border-purple-500">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Growth</h3>
          <div className="text-3xl font-bold text-purple-600">{trend || '+0%'}</div>
        </div>
      </div>

      {/* Progress Card */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Product Mix Progress</h2>
          <FaTrophy className="text-yellow-500 text-3xl" />
        </div>
        <ProgressBar percentage={percentage || 0} height="14px" showLabel={true} />
        <p className="text-sm text-gray-600 mt-4">
          You're {(target || 0) - (value || 0)} product lines away from your target!
        </p>
      </div>

      {/* Placeholder Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Products</h3>
          <div className="h-48 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg flex items-center justify-center border-2 border-dashed border-green-300">
            <div className="text-center">
              <FaChartPie className="text-5xl text-green-300 mb-3 mx-auto" />
              <p className="text-gray-600 font-semibold">Product breakdown</p>
              <p className="text-xs text-gray-500 mt-1">TODO: Add database query</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Category Performance</h3>
          <div className="h-48 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg flex items-center justify-center border-2 border-dashed border-purple-300">
            <div className="text-center">
              <FaBoxes className="text-5xl text-purple-300 mb-3 mx-auto" />
              <p className="text-gray-600 font-semibold">Category stats</p>
              <p className="text-xs text-gray-500 mt-1">TODO: Add database query</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Metric2;
