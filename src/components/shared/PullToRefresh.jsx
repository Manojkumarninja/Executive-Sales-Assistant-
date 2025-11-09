import { FaSyncAlt } from 'react-icons/fa';

const PullToRefresh = ({ isRefreshing }) => {
  if (!isRefreshing) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
      <div className="bg-white shadow-lg rounded-full px-6 py-3 flex items-center space-x-3 border border-gray-200">
        <FaSyncAlt className="text-primary text-lg animate-spin" />
        <p className="text-sm font-semibold text-gray-700">Refreshing data...</p>
      </div>
    </div>
  );
};

export default PullToRefresh;
