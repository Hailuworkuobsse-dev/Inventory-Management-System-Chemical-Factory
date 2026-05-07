import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FiScan } from 'react-icons/fi';

/**
 * ScanInput Component
 * Barcode/QR code scanner input with auto-focus
 */
const ScanInput = ({
  onScan,
  placeholder = 'Scan barcode or enter manually',
  disabled = false,
  autoFocus = true,
  className = '',
}) => {
  const inputRef = useRef(null);
  const [value, setValue] = React.useState('');
  const [error, setError] = React.useState(null);

  // Auto-focus on mount
  useEffect(() => {
    if (autoFocus && inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [autoFocus, disabled]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!value.trim()) {
      setError('Please enter or scan a barcode');
      return;
    }

    try {
      onScan(value.trim());
      setValue('');
      setError(null);
      
      // Refocus after successful scan
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (err) {
      setError(err.message || 'Scan failed');
    }
  };

  const handleKeyDown = (e) => {
    // Hardware scanners typically send Enter key after scanning
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          {/* Scan Icon */}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiScan className="h-5 w-5 text-gray-400" />
          </div>

          {/* Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              error
                ? 'border-danger-300 bg-danger-50'
                : 'border-gray-300 bg-white'
            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          />
        </div>

        {/* Error Message */}
        {error && (
          <p className="mt-1 text-sm text-danger-600">{error}</p>
        )}

        {/* Helper Text */}
        {!error && (
          <p className="mt-1 text-xs text-gray-500">
            Press Enter or scan with barcode reader
          </p>
        )}
      </form>
    </div>
  );
};

ScanInput.propTypes = {
  onScan: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  autoFocus: PropTypes.bool,
  className: PropTypes.string,
};

export default ScanInput;
