import { useState } from 'react';
import AnimatedCounter from '../shared/AnimatedCounter';
import { FaArrowUp, FaCheckCircle, FaExclamationTriangle, FaCoins } from 'react-icons/fa';

const TargetCard = ({ target }) => {
  const {
    name,
    fullName,
    achieved,
    target: targetValue,
    percentage,
    unit,
    id,
    slab1_target,
    slab2_target,
    slab3_target,
    incentive_pending
  } = target;

  // State for active slab marker
  const [activeSlab, setActiveSlab] = useState(null);

  // Calculate slab percentages relative to max target for progress bar markers
  const slab1Percent = targetValue > 0 ? (slab1_target / targetValue) * 100 : 0;
  const slab2Percent = targetValue > 0 ? (slab2_target / targetValue) * 100 : 0;
  const slab3Percent = targetValue > 0 ? (slab3_target / targetValue) * 100 : 0;

  // Toggle slab tooltip on tap/click
  const toggleSlab = (slabNumber) => {
    setActiveSlab(prev => prev === slabNumber ? null : slabNumber);
  };

  const getStatusIcon = () => {
    if (percentage >= 80) return <FaCheckCircle className="text-success" />;
    if (percentage >= 50) return <FaExclamationTriangle className="text-warning" />;
    return <FaExclamationTriangle className="text-danger" />;
  };

  const getStatusColor = () => {
    if (percentage >= 80) return 'from-success to-green-600';
    if (percentage >= 50) return 'from-warning to-orange-600';
    return 'from-danger to-red-600';
  };

  const getCardBorderColor = () => {
    if (percentage >= 80) return 'border-success';
    if (percentage >= 50) return 'border-warning';
    return 'border-danger';
  };

  return (
    <div
      className={`card p-4 border-l-4 ${getCardBorderColor()}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{name}</h3>
          <p className="text-xs text-gray-500">{fullName}</p>
        </div>
        <div className="text-xl">{getStatusIcon()}</div>
      </div>

      {/* Achievement Stats */}
      <div className="space-y-2 mb-3">
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-gray-600">Achieved</span>
          <span className={`text-xl font-bold bg-gradient-to-r ${getStatusColor()} bg-clip-text text-transparent`}>
            <AnimatedCounter
              value={Math.round(achieved)}
              prefix={unit === '₹' ? unit : ''}
              suffix={unit !== '₹' ? ' ' + unit : ''}
              decimals={0}
            />
          </span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-gray-600">Target</span>
          <span className="text-base font-semibold text-gray-700">
            {unit === '₹' ? unit : ''}{Math.round(targetValue).toLocaleString()}{unit !== '₹' ? ' ' + unit : ''}
          </span>
        </div>
      </div>

      {/* Progress Bar with Interactive Slab Markers */}
      <div className="relative px-1">
        {/* Progress Bar Container */}
        <div className="relative h-4 bg-gray-200 rounded-full overflow-visible">
          {/* Achieved Progress Bar */}
          <div
            className={`absolute left-0 top-0 h-full bg-gradient-to-r ${getStatusColor() === 'from-success to-green-600' ? 'from-success to-green-600' : getStatusColor() === 'from-warning to-orange-600' ? 'from-warning to-orange-600' : 'from-danger to-red-600'} rounded-full transition-all duration-500`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          ></div>

          {/* Slab 1 Marker - Show if exists and not at 0% or 100% */}
          {slab1Percent > 0 && slab1Percent < 100 && (
            <div
              className="absolute top-0 h-full transform -translate-x-1/2 group z-10 flex items-center"
              style={{ left: `${slab1Percent}%` }}
              onClick={(e) => {
                e.stopPropagation();
                toggleSlab(1);
              }}
            >
              <div className="w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-125 active:scale-110 transition-transform"></div>
              <div className={`absolute top-8 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold shadow-lg whitespace-nowrap transition-opacity pointer-events-none z-20 ${activeSlab === 1 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                <div>Slab 1</div>
                <div>{unit === '₹' ? '₹' : ''}{Math.round(slab1_target).toLocaleString()}{unit !== '₹' ? ' ' + unit : ''}</div>
              </div>
            </div>
          )}

          {/* Slab 2 Marker - Show if exists and not at 0% or 100% */}
          {slab2Percent > 0 && slab2Percent < 100 && (
            <div
              className="absolute top-0 h-full transform -translate-x-1/2 group z-10 flex items-center"
              style={{ left: `${slab2Percent}%` }}
              onClick={(e) => {
                e.stopPropagation();
                toggleSlab(2);
              }}
            >
              <div className="w-5 h-5 bg-yellow-500 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-125 active:scale-110 transition-transform"></div>
              <div className={`absolute top-8 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold shadow-lg whitespace-nowrap transition-opacity pointer-events-none z-20 ${activeSlab === 2 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                <div>Slab 2</div>
                <div>{unit === '₹' ? '₹' : ''}{Math.round(slab2_target).toLocaleString()}{unit !== '₹' ? ' ' + unit : ''}</div>
              </div>
            </div>
          )}

          {/* Slab 3 (Target) Marker - Always show at 100% if exists */}
          {slab3_target > 0 && (
            <div
              className="absolute top-0 h-full transform -translate-x-1/2 group z-10 flex items-center"
              style={{ left: '100%' }}
              onClick={(e) => {
                e.stopPropagation();
                toggleSlab(3);
              }}
            >
              <div className="w-5 h-5 bg-purple-500 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-125 active:scale-110 transition-transform"></div>
              <div className={`absolute top-8 right-0 transform bg-purple-500 text-white px-2 py-1 rounded text-xs font-bold shadow-lg whitespace-nowrap transition-opacity pointer-events-none z-20 ${activeSlab === 3 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                <div>Slab 3 (Target)</div>
                <div>{unit === '₹' ? '₹' : ''}{Math.round(slab3_target).toLocaleString()}{unit !== '₹' ? ' ' + unit : ''}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center space-x-1">
          <FaArrowUp className={`text-xs ${percentage >= 50 ? 'text-success' : 'text-danger'}`} />
          <span className={`text-xs font-semibold ${percentage >= 50 ? 'text-success' : 'text-danger'}`}>
            {percentage.toFixed(1)}%
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {targetValue - achieved > 0
            ? `${Math.round(targetValue - achieved).toLocaleString()} ${unit} remaining`
            : '🎉 Target Achieved!'}
        </span>
      </div>

      {/* Incentive Remaining */}
      {incentive_pending !== undefined && incentive_pending > 0 && (
        <div className="mt-3 p-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FaCoins className="text-purple-600" />
              <span className="text-xs font-semibold text-purple-900">Incentive Remaining</span>
            </div>
            <span className="text-sm font-bold text-purple-700">
              ₹{Math.round(incentive_pending).toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Status Badge */}
      <div className="mt-3">
        {percentage >= 100 ? (
          <div className="px-2.5 py-0.5 bg-success bg-opacity-10 border border-success rounded-full inline-flex items-center">
            <span className="text-xs font-semibold text-success">✓ Target Completed</span>
          </div>
        ) : percentage >= 80 ? (
          <div className="px-2.5 py-0.5 bg-success bg-opacity-10 border border-success rounded-full inline-flex items-center">
            <span className="text-xs font-semibold text-success">On Track</span>
          </div>
        ) : percentage >= 50 ? (
          <div className="px-2.5 py-0.5 bg-warning bg-opacity-10 border border-warning rounded-full inline-flex items-center">
            <span className="text-xs font-semibold text-warning">Needs Attention</span>
          </div>
        ) : (
          <div className="px-2.5 py-0.5 bg-danger bg-opacity-10 border border-danger rounded-full inline-flex items-center">
            <span className="text-xs font-semibold text-danger">Critical</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TargetCard;
