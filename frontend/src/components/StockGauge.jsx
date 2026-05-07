import React from 'react';
import PropTypes from 'prop-types';

/**
 * StockGauge Component
 * Visual indicator for stock levels
 */
const StockGauge = ({ current, min = 0, max, warningThreshold = 0.25, criticalThreshold = 0.1 }) => {
  const percentage = Math.min(Math.max((current - min) / (max - min), 0), 1);
  
  const getStatus = () => {
    if (percentage <= criticalThreshold) return 'critical';
    if (percentage <= warningThreshold) return 'warning';
    return 'good';
  };

  const status = getStatus();

  const getColor = () => {
    switch (status) {
      case 'critical':
        return 'text-danger-500';
      case 'warning':
        return 'text-warning-500';
      default:
        return 'text-success-500';
    }
  };

  const getBgColor = () => {
    switch (status) {
      case 'critical':
        return 'bg-danger-500';
      case 'warning':
        return 'bg-warning-500';
      default:
        return 'bg-success-500';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'critical':
        return 'Critical Stock';
      case 'warning':
        return 'Low Stock';
      default:
        return 'In Stock';
    }
  };

  return (
    <div className="w-full">
      {/* Label & Value */}
      <div className="flex justify-between items-center mb-2">
        <span className={`text-sm font-medium ${getColor()}`}>
          {getLabel()}
        </span>
        <span className="text-sm text-gray-600">
          {current.toLocaleString()} / {max.toLocaleString()}
        </span>
      </div>

      {/* Gauge Bar */}
      <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
        {/* Background Pattern for Empty Portion */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="h-full w-full"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, #000 5px, #000 6px)',
            }}
          />
        </div>

        {/* Fill Bar */}
        <div
          className={`h-full ${getBgColor()} transition-all duration-500 ease-out`}
          style={{ width: `${percentage * 100}%` }}
        />

        {/* Threshold Markers */}
        {warningThreshold && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-gray-600 opacity-30"
            style={{ left: `${warningThreshold * 100}%` }}
          />
        )}
        {criticalThreshold && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-gray-600 opacity-30"
            style={{ left: `${criticalThreshold * 100}%` }}
          />
        )}
      </div>

      {/* Percentage */}
      <div className="mt-1 text-xs text-gray-500 text-right">
        {(percentage * 100).toFixed(1)}% capacity
      </div>
    </div>
  );
};

StockGauge.propTypes = {
  current: PropTypes.number.isRequired,
  min: PropTypes.number,
  max: PropTypes.number.isRequired,
  warningThreshold: PropTypes.number,
  criticalThreshold: PropTypes.number,
};

export default StockGauge;
