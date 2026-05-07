import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FiCalendar } from 'react-icons/fi';

/**
 * DateRangePicker Component
 * Select start and end dates for filtering
 */
const DateRangePicker = ({
  startDate,
  endDate,
  onChange,
  maxDate,
  minDate,
  className = '',
}) => {
  const [localStart, setLocalStart] = useState(startDate || '');
  const [localEnd, setLocalEnd] = useState(endDate || '');
  const [error, setError] = useState(null);

  const handleStartDateChange = (e) => {
    const newStart = e.target.value;
    setLocalStart(newStart);

    // Validate: start date should not be after end date
    if (localEnd && new Date(newStart) > new Date(localEnd)) {
      setError('Start date cannot be after end date');
      return;
    }

    setError(null);
    onChange?.(newStart, localEnd);
  };

  const handleEndDateChange = (e) => {
    const newEnd = e.target.value;
    setLocalEnd(newEnd);

    // Validate: end date should not be before start date
    if (localStart && new Date(newEnd) < new Date(localStart)) {
      setError('End date cannot be before start date');
      return;
    }

    setError(null);
    onChange?.(localStart, newEnd);
  };

  const presetRanges = [
    { label: 'Last 7 days', start: -7, end: 0 },
    { label: 'Last 30 days', start: -30, end: 0 },
    { label: 'This month', type: 'month' },
    { label: 'Last quarter', start: -90, end: 0 },
    { label: 'This year', type: 'year' },
  ];

  const applyPreset = (preset) => {
    const today = new Date();
    let start, end;

    if (preset.type === 'month') {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = today;
    } else if (preset.type === 'year') {
      start = new Date(today.getFullYear(), 0, 1);
      end = today;
    } else {
      start = new Date(today);
      start.setDate(start.getDate() + preset.start);
      end = today;
    }

    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    setLocalStart(startStr);
    setLocalEnd(endStr);
    onChange?.(startStr, endStr);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Preset Ranges */}
      <div className="flex flex-wrap gap-2">
        {presetRanges.map((preset) => (
          <button
            key={preset.label}
            onClick={() => applyPreset(preset)}
            className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Date Inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={localStart}
              onChange={handleStartDateChange}
              min={minDate}
              max={maxDate || localEnd || undefined}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={localEnd}
              onChange={handleEndDateChange}
              min={localStart || minDate}
              max={maxDate}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-danger-600">{error}</p>
      )}
    </div>
  );
};

DateRangePicker.propTypes = {
  startDate: PropTypes.string,
  endDate: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  maxDate: PropTypes.string,
  minDate: PropTypes.string,
  className: PropTypes.string,
};

export default DateRangePicker;
