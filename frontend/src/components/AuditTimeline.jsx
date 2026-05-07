import React from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';

/**
 * AuditTimeline Component
 * Displays a vertical timeline of audit log entries
 */
const AuditTimeline = ({ events, className = '' }) => {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No audit history available
      </div>
    );
  }

  const getActionColor = (action) => {
    const colors = {
      CREATE: 'bg-success-500',
      UPDATE: 'bg-primary-500',
      DELETE: 'bg-danger-500',
      APPROVE: 'bg-success-500',
      REJECT: 'bg-danger-500',
      TRANSFER: 'bg-warning-500',
      ADJUST: 'bg-info-500',
    };
    return colors[action] || 'bg-gray-500';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {events.map((event, index) => (
        <div key={event.id || index} className="relative flex gap-4">
          {/* Timeline Line */}
          {index !== events.length - 1 && (
            <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-gray-200" />
          )}

          {/* Timeline Dot */}
          <div
            className={`relative z-10 w-6 h-6 rounded-full ${getActionColor(
              event.action
            )} flex items-center justify-center flex-shrink-0`}
          >
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>

          {/* Event Content */}
          <div className="flex-1 pb-4">
            <div className="bg-gray-50 rounded-lg p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-gray-900">{event.action}</h4>
                  <p className="text-sm text-gray-600">{event.entity}</p>
                </div>
                <span className="text-xs text-gray-500">
                  {format(new Date(event.timestamp), 'MMM dd, yyyy HH:mm')}
                </span>
              </div>

              {/* Changes */}
              {event.changes && Object.keys(event.changes).length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-2">
                    Changes:
                  </p>
                  <div className="space-y-1">
                    {Object.entries(event.changes).map(([field, change]) => (
                      <div key={field} className="text-xs">
                        <span className="text-gray-600">{field}:</span>
                        {change.from !== undefined && (
                          <span className="ml-2 text-danger-600 line-through">
                            {String(change.from)}
                          </span>
                        )}
                        {change.to !== undefined && (
                          <span className="ml-2 text-success-600">
                            → {String(change.to)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* User & Notes */}
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                <span className="font-medium">{event.user?.name || 'System'}</span>
                {event.notes && (
                  <>
                    <span>•</span>
                    <span className="italic">{event.notes}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

AuditTimeline.propTypes = {
  events: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      action: PropTypes.string.isRequired,
      entity: PropTypes.string,
      timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
        .isRequired,
      user: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        name: PropTypes.string,
      }),
      changes: PropTypes.object,
      notes: PropTypes.string,
    })
  ).isRequired,
  className: PropTypes.string,
};

export default AuditTimeline;
