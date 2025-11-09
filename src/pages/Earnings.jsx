import { useCallback, useEffect } from 'react';
import { useEarningsData } from '../hooks/usePlaceholderData';
import AnimatedCounter from '../components/shared/AnimatedCounter';
import PullToRefresh from '../components/shared/PullToRefresh';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { FaMoneyBillWave, FaTrophy, FaStar, FaChartBar, FaArrowUp } from 'react-icons/fa';

const Earnings = () => {
  const { totalEarnings, baseIncentive, performanceBonus, targetBonus, monthlyBreakdown, projectedEarnings } = useEarningsData();

  // Scroll-to-refresh handler
  const handleRefresh = useCallback(async () => {
    console.log('🔄 Refreshing earnings data...');
    // For now, just reload the page to refresh placeholder data
    // TODO: Replace with actual API call when backend is ready
    window.location.reload();
  }, []);

  // Use scroll-to-refresh hook
  const { isRefreshing } = usePullToRefresh(handleRefresh);

  // Note: Data refreshes only on manual actions (pull-to-refresh)
  // No automatic refresh on page navigation or app resume

  return (
    <>
      {/* Scroll to Refresh Indicator */}
      <PullToRefresh isRefreshing={isRefreshing} />

      <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center">
          <FaMoneyBillWave className="text-primary mr-4" />
          Earnings Dashboard
        </h1>
        <p className="text-gray-600">Track your incentives and performance bonuses</p>
      </div>

      {/* Total Earnings Hero Card */}
      <div className="card p-8 mb-6 bg-gradient-to-r from-primary to-primary-dark text-white">
        <div className="text-center">
          <p className="text-xl opacity-90 mb-2">Total Earnings This Month</p>
          <div className="text-6xl font-bold mb-4">
            <AnimatedCounter value={totalEarnings} prefix="₹" decimals={0} />
          </div>
          <div className="flex items-center justify-center space-x-2">
            <FaArrowUp className="text-green-300" />
            <span className="text-lg">Projected: ₹{projectedEarnings.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Earnings Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Base Incentive */}
        <div className="card p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600">Base Incentive</h3>
            <FaMoneyBillWave className="text-blue-500 text-2xl" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            <AnimatedCounter value={baseIncentive} prefix="₹" decimals={0} />
          </div>
          <p className="text-sm text-gray-500">Fixed monthly incentive</p>
        </div>

        {/* Performance Bonus */}
        <div className="card p-6 border-l-4 border-warning">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600">Performance Bonus</h3>
            <FaTrophy className="text-warning text-2xl" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            <AnimatedCounter value={performanceBonus} prefix="₹" decimals={0} />
          </div>
          <p className="text-sm text-gray-500">Based on sales performance</p>
        </div>

        {/* Target Bonus */}
        <div className="card p-6 border-l-4 border-success">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600">Target Bonus</h3>
            <FaStar className="text-success text-2xl" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            <AnimatedCounter value={targetBonus} prefix="₹" decimals={0} />
          </div>
          <p className="text-sm text-gray-500">Target achievement reward</p>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="card p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Monthly Earnings Trend</h2>
        <div className="space-y-4">
          {monthlyBreakdown.map((month, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-16 font-semibold text-gray-700">{month.month}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm text-gray-600">₹{month.amount.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">
                    {index > 0 && (
                      <span className={month.amount > monthlyBreakdown[index - 1].amount ? 'text-success' : 'text-danger'}>
                        {((month.amount - monthlyBreakdown[index - 1].amount) / monthlyBreakdown[index - 1].amount * 100).toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary-dark transition-all duration-1000"
                    style={{ width: `${(month.amount / Math.max(...monthlyBreakdown.map(m => m.amount))) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Earnings Chart Placeholder */}
      <div className="card p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Detailed Analytics</h2>
        <div className="h-72 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg flex items-center justify-center border-2 border-dashed border-green-300">
          <div className="text-center">
            <FaChartBar className="text-7xl text-green-300 mb-4 mx-auto" />
            <p className="text-xl text-gray-600 font-semibold">Earnings Analytics Chart</p>
            <p className="text-sm text-gray-500 mt-2">TODO: Add detailed earnings breakdown from database</p>
            <p className="text-xs text-gray-400 mt-1">Include: daily earnings, bonus triggers, commission rates</p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mt-6 card p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200">
        <div className="flex items-start space-x-4">
          <FaTrophy className="text-yellow-600 text-3xl flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Earnings Calculation</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              Your total earnings include base incentive, performance bonus (calculated based on sales achievement),
              and target bonus (awarded when you exceed your monthly targets). Keep pushing to maximize your earnings!
            </p>
            <p className="text-xs text-gray-500 mt-2">TODO: Update calculation logic with actual database formulas</p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Earnings;
