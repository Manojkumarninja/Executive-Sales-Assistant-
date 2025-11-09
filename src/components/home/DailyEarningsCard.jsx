import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import AnimatedCounter from '../shared/AnimatedCounter';
import { FaFire, FaSyncAlt } from 'react-icons/fa';
import { useDataCache } from '../../contexts/DataCacheContext';

const DailyEarningsCard = forwardRef((_props, ref) => {
  const { getCache, updateCache } = useDataCache();
  const [isFlipped, setIsFlipped] = useState(false);
  const [dailyIncentives, setDailyIncentives] = useState(null);
  const [weeklyIncentives, setWeeklyIncentives] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch incentive data with caching
  const fetchIncentives = useCallback(async () => {
    // Check cache first
    const cachedDaily = getCache('homeDailyIncentives');
    const cachedWeekly = getCache('homeWeeklyIncentives');

    if (cachedDaily && cachedWeekly) {
      setDailyIncentives(cachedDaily);
      setWeeklyIncentives(cachedWeekly);
      setLoading(false);
      // Continue fetching fresh data in background
    } else {
      setLoading(true);
    }

    try {
      const user = JSON.parse(localStorage.getItem('user_data'));
      if (!user?.employee_id) {
        console.error('No employee ID found');
        setLoading(false);
        return;
      }

      // Fetch daily and weekly incentives in parallel
      const [dailyResponse, weeklyResponse] = await Promise.all([
        fetch(`http://localhost:5000/api/incentives/daily/${user.employee_id}`),
        fetch(`http://localhost:5000/api/incentives/weekly/${user.employee_id}`)
      ]);

      const dailyData = await dailyResponse.json();
      const weeklyData = await weeklyResponse.json();

      if (dailyData.success) {
        setDailyIncentives(dailyData.incentives);
        updateCache('homeDailyIncentives', dailyData.incentives);
      }
      if (weeklyData.success) {
        setWeeklyIncentives(weeklyData.incentives);
        updateCache('homeWeeklyIncentives', weeklyData.incentives);
      }
    } catch (error) {
      console.error('Error fetching incentives:', error);
    } finally {
      setLoading(false);
    }
  }, [getCache, updateCache]);

  useEffect(() => {
    fetchIncentives();
  }, [fetchIncentives]);

  // Expose refresh method to parent component via ref
  useImperativeHandle(ref, () => ({
    refresh: fetchIncentives
  }));

  // Card component for Daily/Weekly
  const IncentiveCard = ({ data, type }) => {
    const [activeSlab, setActiveSlab] = useState(null);

    if (!data) return null;

    const achievedAmount = data.achieved_amount;
    const remainingAmount = data.remaining_amount;
    const totalTarget = data.max_target;
    const percentage = totalTarget > 0 ? (achievedAmount / totalTarget) * 100 : 0;

    // Calculate slab percentages and values
    const slab1Percent = totalTarget > 0 ? (data.slab1_target / totalTarget) * 100 : 0;
    const slab2Percent = totalTarget > 0 ? (data.slab2_target / totalTarget) * 100 : 0;
    const slab3Percent = totalTarget > 0 ? (data.slab3_target / totalTarget) * 100 : 0;

    // Toggle slab tooltip on tap/click
    const toggleSlab = (slabNumber) => {
      setActiveSlab(prev => prev === slabNumber ? null : slabNumber);
    };

    return (
      <div className="h-full flex flex-col">
        {/* Top Section - Final Push - Mobile optimized */}
        <div className="flex items-center space-x-2 md:space-x-3 mb-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-danger to-warning rounded-xl flex items-center justify-center shadow-lg">
              <FaFire className="text-white text-lg md:text-xl animate-pulse" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xs md:text-sm font-medium text-gray-500 mb-0.5">⚡ Final Push {type}!</h3>
            <div className="text-xl md:text-2xl font-bold text-gray-900">
              <AnimatedCounter value={Math.round(remainingAmount)} prefix="₹" decimals={0} />
            </div>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5">₹{Math.round(remainingAmount).toLocaleString()} left for the {type.toLowerCase()}</p>
          </div>
        </div>

        {/* Progress Bar with Slabs - No extra spacing */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700">{type} Progress</span>
          </div>

          {/* Progress Bar with Markers - Mobile optimized */}
          <div className="relative px-1">
            {/* Progress Bar Container - Taller on mobile for easier interaction */}
            <div className="relative h-5 md:h-4 bg-gray-200 rounded-full overflow-visible">
              {/* Achieved Progress Bar */}
              <div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-success to-primary rounded-full transition-all duration-500 flex items-center"
                style={{ width: `${Math.min(percentage, 100)}%` }}
              >
                {/* Achievement Amount - INSIDE the progress bar - Only show when >= 8% */}
                {achievedAmount > 0 && percentage >= 8 && (
                  <div className="absolute right-1 text-white font-bold text-xs md:text-xs whitespace-nowrap">
                    ₹{Math.round(achievedAmount).toLocaleString()}
                  </div>
                )}
              </div>

              {/* Colored Slab Markers with hover/tap tooltips - Mobile optimized */}
              {slab1Percent > 0 && slab1Percent < 95 && (
                <div
                  className="absolute top-0 h-full transform -translate-x-1/2 group z-10 flex items-center"
                  style={{ left: `${slab1Percent}%` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSlab(1);
                  }}
                >
                  {/* Marker Circle - Larger on mobile for easier tapping */}
                  <div className="w-7 h-7 md:w-6 md:h-6 bg-blue-500 rounded-full border-3 border-white shadow-lg cursor-pointer hover:scale-125 active:scale-110 transition-transform"></div>
                  {/* Slab Label with Name + Value - Show on HOVER or TAP */}
                  <div className={`absolute top-9 md:top-8 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold shadow-lg whitespace-nowrap transition-opacity pointer-events-none z-20 ${activeSlab === 1 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <div>Slab 1</div>
                    <div>₹{Math.round(data.slab1_target).toLocaleString()}</div>
                  </div>
                </div>
              )}
              {slab2Percent > 0 && slab2Percent < 95 && (
                <div
                  className="absolute top-0 h-full transform -translate-x-1/2 group z-10 flex items-center"
                  style={{ left: `${slab2Percent}%` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSlab(2);
                  }}
                >
                  {/* Marker Circle - Larger on mobile for easier tapping */}
                  <div className="w-7 h-7 md:w-6 md:h-6 bg-yellow-500 rounded-full border-3 border-white shadow-lg cursor-pointer hover:scale-125 active:scale-110 transition-transform"></div>
                  {/* Slab Label with Name + Value - Show on HOVER or TAP */}
                  <div className={`absolute top-9 md:top-8 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold shadow-lg whitespace-nowrap transition-opacity pointer-events-none z-20 ${activeSlab === 2 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <div>Slab 2</div>
                    <div>₹{Math.round(data.slab2_target).toLocaleString()}</div>
                  </div>
                </div>
              )}
              {slab3Percent > 0 && (
                <div
                  className="absolute top-0 h-full transform -translate-x-1/2 group z-10 flex items-center"
                  style={{ left: '100%' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSlab(3);
                  }}
                >
                  {/* Marker Circle - Larger on mobile for easier tapping */}
                  <div className="w-7 h-7 md:w-6 md:h-6 bg-purple-500 rounded-full border-3 border-white shadow-lg cursor-pointer hover:scale-125 active:scale-110 transition-transform"></div>
                  {/* Slab Label with Name + Value - Show on HOVER or TAP - Always position left */}
                  <div className={`absolute top-9 md:top-8 right-0 transform bg-purple-500 text-white px-2 py-1 rounded text-xs font-bold shadow-lg whitespace-nowrap transition-opacity pointer-events-none z-20 ${activeSlab === 3 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <div>Slab 3 (Target)</div>
                    <div>₹{Math.round(data.slab3_target).toLocaleString()}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Achievement % at top-right end of progress bar - Mobile optimized */}
            <div className="absolute -top-6 right-0 text-xs md:text-sm font-bold text-primary">
              {percentage.toFixed(1)}%
            </div>

            {/* Still to go at bottom-LEFT (start) of progress bar - Mobile optimized */}
            <div className="absolute -bottom-5 left-0 text-[10px] md:text-xs text-gray-600">
              ₹{Math.round(remainingAmount).toLocaleString()} to go
            </div>

            {/* Target at bottom-RIGHT (end) of progress bar - Mobile optimized */}
            <div className="absolute -bottom-5 right-0 text-[10px] md:text-xs text-gray-500">
              Target: ₹{Math.round(totalTarget).toLocaleString()}
            </div>
          </div>

          {/* Extra spacing for labels */}
          <div className="mt-6"></div>
        </div>
      </div>
    );
  };

  if (loading || !dailyIncentives || !weeklyIncentives) {
    return (
      <div className="card p-6 mb-6 flex justify-center items-center" style={{ height: '240px' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      {/* Flip Container - Fixed height to prevent movement - Mobile optimized */}
      <div
        className="relative cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
        style={{
          perspective: '1500px',
          height: '250px', // Slightly taller for mobile markers
          WebkitPerspective: '1500px'
        }}
      >
        <div
          className="relative w-full h-full"
          style={{
            transformStyle: 'preserve-3d',
            WebkitTransformStyle: 'preserve-3d',
            transition: 'transform 0.7s',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            willChange: 'transform',
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden'
          }}
        >
          {/* Daily Card (Front) - Mobile optimized padding */}
          <div
            className="card p-4 md:p-6 overflow-visible absolute top-0 left-0 w-full h-full"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'translateZ(0) scale(1.0)',
              WebkitTransform: 'translateZ(0) scale(1.0)',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              willChange: 'transform',
              imageRendering: 'crisp-edges'
            }}
          >
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary to-primary-dark opacity-5 rounded-full blur-2xl"></div>

            {/* Flip Indicator - Mobile optimized */}
            <div className="absolute top-3 right-3 md:top-4 md:right-4 z-20">
              <div className="bg-primary text-white px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold flex items-center space-x-1">
                <span>Daily</span>
                <FaSyncAlt className="text-[10px] md:text-xs" />
              </div>
            </div>

            <div className="relative z-10 h-full">
              <IncentiveCard data={dailyIncentives} type="Daily" />
            </div>
          </div>

          {/* Weekly Card (Back) - Mobile optimized padding */}
          <div
            className="card p-4 md:p-6 overflow-visible absolute top-0 left-0 w-full h-full"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg) translateZ(0) scale(1.0)',
              WebkitTransform: 'rotateY(180deg) translateZ(0) scale(1.0)',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              willChange: 'transform',
              imageRendering: 'crisp-edges'
            }}
          >
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500 to-purple-700 opacity-5 rounded-full blur-2xl"></div>

            {/* Flip Indicator */}
            <div className="absolute top-4 right-4 z-20">
              <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                <span>Weekly</span>
                <FaSyncAlt className="text-xs" />
              </div>
            </div>

            <div className="relative z-10 h-full">
              <IncentiveCard data={weeklyIncentives} type="Weekly" />
            </div>
          </div>
        </div>
      </div>

      {/* Click to Flip Hint */}
      <div className="text-center mt-2">
        <p className="text-xs text-gray-500">Click card to flip between Daily & Weekly</p>
      </div>
    </div>
  );
});

DailyEarningsCard.displayName = 'DailyEarningsCard';

export default DailyEarningsCard;
