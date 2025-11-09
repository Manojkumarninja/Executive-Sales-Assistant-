import AnimatedCounter from '../shared/AnimatedCounter';
import ProgressBar from '../shared/ProgressBar';
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

  // Calculate slab percentages relative to max target for progress bar markers
  const slabPercentages = targetValue > 0 ? {
    slab1: (slab1_target / targetValue) * 100,
    slab2: (slab2_target / targetValue) * 100,
    slab3: (slab3_target / targetValue) * 100
  } : null;

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

      {/* Progress Bar with Slab Markers */}
      <ProgressBar
        percentage={percentage}
        height="8px"
        animated={true}
        slabs={slabPercentages}
      />

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
