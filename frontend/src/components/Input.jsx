import React, { useId } from 'react';
import PropTypes from 'prop-types';

/**
 * Input Component
 * Shared text input with optional label, icon and error message.
 */
const Input = ({
  label,
  error,
  hint,
  icon,
  type = 'text',
  className = '',
  id,
  ...rest
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          type={type}
          aria-invalid={error ? 'true' : undefined}
          className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:text-gray-500 ${
            icon ? 'pl-9' : ''
          } ${
            error
              ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-200'
              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
          }`}
          {...rest}
        />
      </div>
      {error && <p className="mt-1 text-xs text-danger-600">{error}</p>}
      {!error && hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
};

Input.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  hint: PropTypes.string,
  icon: PropTypes.node,
  type: PropTypes.string,
  className: PropTypes.string,
  id: PropTypes.string,
};

export default Input;
