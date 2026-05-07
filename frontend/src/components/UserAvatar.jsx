import React from 'react';
import PropTypes from 'prop-types';

/**
 * UserAvatar Component
 * Displays user profile image or initials
 */
const UserAvatar = ({ user, size = 'md', showName = false, className = '' }) => {
  const getSizeClasses = () => {
    const sizes = {
      sm: {
        container: 'h-8 w-8',
        text: 'text-xs',
      },
      md: {
        container: 'h-10 w-10',
        text: 'text-sm',
      },
      lg: {
        container: 'h-12 w-12',
        text: 'text-base',
      },
      xl: {
        container: 'h-16 w-16',
        text: 'text-lg',
      },
    };
    return sizes[size];
  };

  const sizeClasses = getSizeClasses();

  const getInitials = (name, email) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const avatarUrl = user?.avatar || user?.profileImage;
  const initials = getInitials(user?.name, user?.email);
  const bgColor = user?.avatarColor || 'bg-primary-500';

  const avatar = avatarUrl ? (
    <img
      src={avatarUrl}
      alt={user?.name || 'User'}
      className={`${sizeClasses.container} rounded-full object-cover`}
    />
  ) : (
    <div
      className={`${sizeClasses.container} ${bgColor} rounded-full flex items-center justify-center text-white font-medium ${sizeClasses.text}`}
    >
      {initials}
    </div>
  );

  if (showName) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {avatar}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {user?.name || 'User'}
          </p>
          {user?.role && (
            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
          )}
        </div>
      </div>
    );
  }

  return <div className={className}>{avatar}</div>;
};

UserAvatar.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    email: PropTypes.string,
    avatar: PropTypes.string,
    profileImage: PropTypes.string,
    avatarColor: PropTypes.string,
    role: PropTypes.string,
  }),
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  showName: PropTypes.bool,
  className: PropTypes.string,
};

export default UserAvatar;
