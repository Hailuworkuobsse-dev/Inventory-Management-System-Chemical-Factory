import React from 'react';
import PropTypes from 'prop-types';

/**
 * StatusBadge Component
 * Displays a color-coded status indicator
 */
const StatusBadge = ({ status, variant = 'default', size = 'md' }) => {
  const getStatusStyles = () => {
    const baseStyles = 'inline-flex items-center font-medium rounded-full';
    
    const sizeStyles = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-0.5 text-sm',
      lg: 'px-3 py-1 text-base',
    };

    const variantStyles = {
      default: 'bg-gray-100 text-gray-800',
      success: 'bg-success-100 text-success-800',
      warning: 'bg-warning-100 text-warning-800',
      danger: 'bg-danger-100 text-danger-800',
      info: 'bg-primary-100 text-primary-800',
    };

    // Auto-detect variant based on status if not provided
    const autoVariant = {
      active: 'success',
      completed: 'success',
      approved: 'success',
      in_stock: 'success',
      pending: 'warning',
      processing: 'info',
      shipped: 'info',
      inactive: 'default',
      draft: 'default',
      cancelled: 'danger',
      rejected: 'danger',
      expired: 'danger',
      out_of_stock: 'danger',
      quarantine: 'warning',
    };

    const finalVariant = variant !== 'default' ? variant : (autoVariant[status] || 'default');

    return `${baseStyles} ${sizeStyles[size]} ${variantStyles[finalVariant]}`;
  };

  const formatStatus = (str) => {
    return str
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <span className={getStatusStyles()}>
      {formatStatus(status)}
    </span>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['default', 'success', 'warning', 'danger', 'info']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

export default StatusBadge;
