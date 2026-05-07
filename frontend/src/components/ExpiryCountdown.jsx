import React from 'react';
import PropTypes from 'prop-types';
import { differenceInDays, format } from 'date-fns';

/**
 * ExpiryCountdown Component
 * Shows days remaining until product expiry with color coding
 */
const ExpiryCountdown = ({ expiryDate, showDate = true, size = 'md' }) => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const daysRemaining = differenceInDays(expiry, today);

  const getStatus = () => {
    if (daysRemaining < 0) return 'expired';
    if (daysRemaining <= 7) return 'critical';
    if (daysRemaining <= 30) return 'warning';
    return 'good';
  };

  const status = getStatus();

  const getSizeClasses = () => {
    const sizes = {
      sm: {
        container: 'text-xs',
        badge: 'px-1.5 py-0.5',
        icon: 'h-3 w-3',
      },
      md: {
        container: 'text-sm',
        badge: 'px-2 py-1',
        icon: 'h-4 w-4',
      },
      lg: {
        container: 'text-base',
        badge: 'px-3 py-1.5',
        icon: 'h-5 w-5',
      },
    };
    return sizes[size];
  };

  const getStyles = () => {
    const base = {
      expired: 'bg-danger-100 text-danger-800 border-danger-200',
      critical: 'bg-danger-50 text-danger-700 border-danger-200',
      warning: 'bg-warning-50 text-warning-700 border-warning-200',
      good: 'bg-success-50 text-success-700 border-success-200',
    };

    const icons = {
      expired: '⚠️',
      critical: '🔴',
      warning: '🟡',
      good: '🟢',
    };

    return {
      container: base[status],
      icon: icons[status],
    };
  };

  const styles = getStyles();
  const sizeClasses = getSizeClasses();

  const getLabel = () => {
    if (daysRemaining < 0) {
      return `Expired ${Math.abs(daysRemaining)} days ago`;
    }
    if (daysRemaining === 0) {
      return 'Expires today';
    }
    if (daysRemaining === 1) {
      return '1 day remaining';
    }
    return `${daysRemaining} days remaining`;
  };

  return (
    <div className={`inline-flex items-center gap-2 ${sizeClasses.container}`}>
      {/* Status Badge */}
      <span
        className={`inline-flex items-center gap-1 font-medium rounded-full border ${styles.container} ${sizeClasses.badge}`}
      >
        <span className={sizeClasses.icon}>{styles.icon}</span>
        {getLabel()}
      </span>

      {/* Expiry Date */}
      {showDate && (
        <span className="text-gray-500">
          ({format(expiry, 'MMM dd, yyyy')})
        </span>
      )}
    </div>
  );
};

ExpiryCountdown.propTypes = {
  expiryDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
    .isRequired,
  showDate: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

export default ExpiryCountdown;
