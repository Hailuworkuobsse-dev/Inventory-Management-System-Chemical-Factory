import React from 'react';
import PropTypes from 'prop-types';
import { FiAlertTriangle } from 'react-icons/fi';

/**
 * ConfirmDialog Component
 * Reusable confirmation modal for destructive actions
 */
const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
  loading = false,
}) => {
  if (!isOpen) return null;

  const variantStyles = {
    warning: 'bg-warning-500 hover:bg-warning-600',
    danger: 'bg-danger-500 hover:bg-danger-600',
    info: 'bg-primary-500 hover:bg-primary-600',
    success: 'bg-success-500 hover:bg-success-600',
  };

  const iconColors = {
    warning: 'text-warning-500',
    danger: 'text-danger-500',
    info: 'text-primary-500',
    success: 'text-success-500',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          {/* Icon */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
            <FiAlertTriangle className={`h-6 w-6 ${iconColors[variant]}`} />
          </div>

          {/* Title */}
          <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
            {title}
          </h3>

          {/* Message */}
          {message && (
            <p className="text-sm text-gray-500 text-center mb-6">{message}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-center">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${variant}-500 disabled:opacity-50 ${variantStyles[variant]}`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing...
                </span>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

ConfirmDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  variant: PropTypes.oneOf(['warning', 'danger', 'info', 'success']),
  loading: PropTypes.bool,
};

export default ConfirmDialog;
