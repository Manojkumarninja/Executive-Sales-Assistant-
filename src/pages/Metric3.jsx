import { useCallback } from 'react';
import { useMetricsData } from '../hooks/usePlaceholderData';
import ProgressBar from '../components/shared/ProgressBar';
import AnimatedCounter from '../components/shared/AnimatedCounter';
import PullToRefresh from '../components/shared/PullToRefresh';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { FaMapMarkedAlt, FaGlobeAmericas, FaMapPin } from 'react-icons/fa';

const Metric3 = () => {
  const data = useMetricsData('metric3');
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
          <FaGlobeAmericas className="text-primary mr-4" />
          {title || 'Metric 3'}
        </h1>
        <p className="text-gray-600">Expand your market coverage and reach new territories</p>
      </div>

      {/* Main Coverage Stats */}
      <div className="card p-8 mb-6 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <FaMapMarkedAlt className="text-6xl text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Areas Covered</h2>
          <div className="text-6xl font-bold text-primary mb-4">
            <AnimatedCounter value={value || 0} />
            <span className="text-2xl text-gray-600">/{target || 0}</span>
          </div>
          <ProgressBar percentage={percentage || 0} height="16px" />
          <p className="text-lg font-semibold text-gray-700 mt-4">
            {(percentage || 0).toFixed(1)}% Market Coverage
          </p>
        </div>
      </div>

      {/* Coverage Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-600">Urban Coverage</h3>
            <FaMapPin className="text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-blue-600 mb-2">32</div>
          <ProgressBar percentage={85} height="8px" />
          <p className="text-xs text-gray-500 mt-2">TODO: Replace with DB query</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-600">Rural Coverage</h3>
            <FaMapPin className="text-green-500" />
          </div>
          <div className="text-3xl font-bold text-green-600 mb-2">10</div>
          <ProgressBar percentage={60} height="8px" />
          <p className="text-xs text-gray-500 mt-2">TODO: Replace with DB query</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-600">Growth Trend</h3>
            <div className="text-success text-xl">{trend || '+0%'}</div>
          </div>
          <div className="text-3xl font-bold text-purple-600 mb-2">This Month</div>
          <p className="text-sm text-gray-600">Excellent progress!</p>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="card p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Coverage Map</h2>
        <div className="h-96 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg flex items-center justify-center border-2 border-dashed border-blue-300">
          <div className="text-center">
            <FaMapMarkedAlt className="text-8xl text-blue-300 mb-4 mx-auto" />
            <p className="text-xl text-gray-600 font-semibold">Interactive Map Placeholder</p>
            <p className="text-sm text-gray-500 mt-2">TODO: Integrate map with geographic data from database</p>
            <p className="text-xs text-gray-400 mt-1">Suggestion: Use Google Maps API or Leaflet</p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Metric3;
