import React from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';

/**
 * SidebarItem Component
 * Navigation menu item for sidebar
 */
const SidebarItem = ({
  icon: Icon,
  label,
  path,
  badge,
  subItems = [],
  collapsed = false,
}) => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = React.useState(false);

  const isActive = path ? location.pathname === path : false;
  const hasActiveChild = subItems.some((item) => location.pathname === item.path);
  const isCurrentlyActive = isActive || hasActiveChild;

  const handleClick = (e) => {
    if (subItems.length > 0) {
      e.preventDefault();
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <li className="mb-1">
      {/* Main Item */}
      <Link
        to={path || '#'}
        onClick={handleClick}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${
          isCurrentlyActive
            ? 'bg-primary-50 text-primary-700'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        {/* Icon */}
        {Icon && (
          <Icon
            className={`h-5 w-5 flex-shrink-0 ${
              isCurrentlyActive ? 'text-primary-600' : 'text-gray-500 group-hover:text-gray-700'
            }`}
          />
        )}

        {/* Label */}
        {!collapsed && (
          <>
            <span className="flex-1 text-sm font-medium truncate">{label}</span>

            {/* Badge */}
            {badge && (
              <span className="px-2 py-0.5 text-xs font-semibold bg-danger-500 text-white rounded-full">
                {badge}
              </span>
            )}

            {/* Chevron for Submenu */}
            {subItems.length > 0 && (
              <svg
                className={`h-4 w-4 transition-transform ${
                  isExpanded ? 'rotate-90' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
          </>
        )}
      </Link>

      {/* Submenu Items */}
      {!collapsed && subItems.length > 0 && isExpanded && (
        <ul className="mt-1 ml-4 space-y-1 border-l-2 border-gray-200 pl-2">
          {subItems.map((item) => (
            <SidebarItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              path={item.path}
              badge={item.badge}
              collapsed={collapsed}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

SidebarItem.propTypes = {
  icon: PropTypes.elementType,
  label: PropTypes.string.isRequired,
  path: PropTypes.string,
  badge: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  subItems: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.elementType,
      label: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
      badge: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })
  ),
  collapsed: PropTypes.bool,
};

export default SidebarItem;
