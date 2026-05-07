import React from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';

/**
 * Breadcrumb Component
 * Displays navigation path hierarchy
 */
const Breadcrumb = ({ items = [], separator = '/', className = '' }) => {
  const location = useLocation();

  // Auto-generate breadcrumbs from route if items not provided
  const autoItems = React.useMemo(() => {
    if (items.length > 0) return items;

    const pathnames = location.pathname.split('/').filter((x) => x);
    return pathnames.map((name, index) => {
      const path = `/${pathnames.slice(0, index + 1).join('/')}`;
      const label = name
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      return {
        label,
        path,
        isCurrent: index === pathnames.length - 1,
      };
    });
  }, [location.pathname, items]);

  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
      {/* Home Link */}
      <Link
        to="/"
        className="text-gray-500 hover:text-gray-700 transition-colors"
      >
        <svg
          className="h-4 w-4"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      </Link>

      {/* Separator */}
      <span className="text-gray-400">{separator}</span>

      {/* Breadcrumb Items */}
      {autoItems.map((item, index) => (
        <React.Fragment key={item.path || index}>
          {item.isCurrent ? (
            /* Current Page (Not Clickable) */
            <span className="text-gray-900 font-medium truncate max-w-xs">
              {item.label}
            </span>
          ) : (
            /* Previous Pages (Clickable) */
            <>
              <Link
                to={item.path}
                className="text-gray-500 hover:text-gray-700 transition-colors truncate max-w-xs"
              >
                {item.label}
              </Link>
              {index < autoItems.length - 1 && (
                <span className="text-gray-400 flex-shrink-0">{separator}</span>
              )}
            </>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

Breadcrumb.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string,
      isCurrent: PropTypes.bool,
    })
  ),
  separator: PropTypes.string,
  className: PropTypes.string,
};

export default Breadcrumb;
