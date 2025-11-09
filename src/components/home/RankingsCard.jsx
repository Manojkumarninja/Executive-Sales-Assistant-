import { FaMedal, FaTrophy, FaAward } from 'react-icons/fa';

const RankingsCard = ({ rankings, rankingType, onToggleLayer, period, onTogglePeriod, isGrouped }) => {
  const getMedalIcon = (rank) => {
    if (rank === 1) return <FaTrophy className="text-yellow-500 text-2xl" />;
    if (rank === 2) return <FaMedal className="text-gray-400 text-2xl" />;
    if (rank === 3) return <FaMedal className="text-orange-600 text-2xl" />;
    return <FaAward className="text-gray-300 text-xl" />;
  };

  const getRankBadgeColor = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
    if (rank === 3) return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
    return 'bg-gray-200 text-gray-700';
  };

  return (
    <div className="card p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-gray-900 flex items-center">
          <FaTrophy className="text-primary mr-2 text-base" />
          Leaderboard Rankings
        </h2>
      </div>

      {/* Toggle Switches Container */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        {/* Daily/Weekly Toggle */}
        <div className="flex items-center space-x-1 bg-gray-100 rounded-full p-1">
          <button
            onClick={onTogglePeriod}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
              period === 'day'
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Daily
          </button>
          <button
            onClick={onTogglePeriod}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
              period === 'week'
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Weekly
          </button>
        </div>

        {/* City/Cluster Toggle */}
        <div className="flex items-center space-x-1 bg-gray-100 rounded-full p-1">
          <button
            onClick={onToggleLayer}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
              rankingType === 'city'
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            City
          </button>
          <button
            onClick={onToggleLayer}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
              rankingType === 'cluster'
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Cluster
          </button>
        </div>
      </div>

      {/* Rankings List - Scrollable */}
      <div className="space-y-2 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {isGrouped ? (
          // Grouped by cluster view
          rankings.map((clusterGroup, groupIndex) => (
            <div key={groupIndex} className="mb-4">
              {/* Cluster Header */}
              <div className="bg-gradient-to-r from-primary to-primary-dark text-white px-3 py-2 rounded-t-lg font-bold text-sm sticky top-0 z-10 shadow-md">
                {clusterGroup.cluster}
              </div>

              {/* Cluster Rankings */}
              <div className="space-y-2 mt-2">
                {clusterGroup.rankings.map((executive) => (
                  <div
                    key={executive.employee_id}
                    className={`flex items-center p-2.5 rounded-lg transition-all duration-300 ${
                      executive.isCurrentUser
                        ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-md scale-102 border border-primary'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    {/* Rank & Medal */}
                    <div className="flex items-center space-x-2 flex-shrink-0 w-16">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${getRankBadgeColor(executive.rank)}`}>
                        {executive.rank <= 3 ? (
                          <div className="text-lg">
                            {getMedalIcon(executive.rank)}
                          </div>
                        ) : (
                          `#${executive.rank}`
                        )}
                      </div>
                    </div>

                    {/* Executive Info */}
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`font-semibold text-sm truncate ${
                          executive.isCurrentUser ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {executive.name}
                        {executive.isCurrentUser && (
                          <span className="ml-1.5 px-1.5 py-0.5 bg-white bg-opacity-20 rounded-full text-xs">
                            You
                          </span>
                        )}
                      </h3>
                      {executive.cluster && (
                        <p
                          className={`text-xs truncate ${
                            executive.isCurrentUser ? 'text-white text-opacity-80' : 'text-gray-600'
                          }`}
                        >
                          Cluster: {executive.cluster}
                        </p>
                      )}
                    </div>

                    {/* Achievement Badge */}
                    <div className="flex-shrink-0">
                      <div
                        className={`px-2.5 py-1.5 rounded-md font-bold text-xs ${
                          executive.isCurrentUser
                            ? 'bg-white bg-opacity-20 text-white'
                            : executive.achievement >= 90
                            ? 'bg-success bg-opacity-10 text-success'
                            : executive.achievement >= 75
                            ? 'bg-warning bg-opacity-10 text-warning'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {executive.achievement.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          // Flat city view
          rankings.map((executive) => (
            <div
              key={executive.employee_id || executive.id}
              className={`flex items-center p-2.5 rounded-lg transition-all duration-300 ${
                executive.isCurrentUser
                  ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-md scale-102 border border-primary'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              {/* Rank & Medal */}
              <div className="flex items-center space-x-2 flex-shrink-0 w-16">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${getRankBadgeColor(executive.rank)}`}>
                  {executive.rank <= 3 ? (
                    <div className="text-lg">
                      {getMedalIcon(executive.rank)}
                    </div>
                  ) : (
                    `#${executive.rank}`
                  )}
                </div>
              </div>

              {/* Executive Info */}
              <div className="flex-1 min-w-0">
                <h3
                  className={`font-semibold text-sm truncate ${
                    executive.isCurrentUser ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {executive.name}
                  {executive.isCurrentUser && (
                    <span className="ml-1.5 px-1.5 py-0.5 bg-white bg-opacity-20 rounded-full text-xs">
                      You
                    </span>
                  )}
                </h3>
                {executive.cluster && (
                  <p
                    className={`text-xs truncate ${
                      executive.isCurrentUser ? 'text-white text-opacity-80' : 'text-gray-600'
                    }`}
                  >
                    Cluster: {executive.cluster}
                  </p>
                )}
              </div>

              {/* Achievement Badge */}
              <div className="flex-shrink-0">
                <div
                  className={`px-2.5 py-1.5 rounded-md font-bold text-xs ${
                    executive.isCurrentUser
                      ? 'bg-white bg-opacity-20 text-white'
                      : executive.achievement >= 90
                      ? 'bg-success bg-opacity-10 text-success'
                      : executive.achievement >= 75
                      ? 'bg-warning bg-opacity-10 text-warning'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {executive.achievement.toFixed(1)}%
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-3 p-2.5 bg-purple-50 border border-purple-200 rounded-lg">
        <p className="text-xs text-purple-800 text-center">
          <span className="font-semibold">Pro Tip:</span> Stay in the top 3 to unlock bonus incentives!
        </p>
      </div>
    </div>
  );
};

export default RankingsCard;
