import React from 'react';
import PropTypes from 'prop-types';

/**
 * AuthLayout Component
 * Layout for authentication pages (login, register, etc.)
 */
const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600">AIMS</h1>
          <p className="mt-2 text-sm text-gray-600">
            Advanced Inventory Management System
          </p>
        </div>

        {/* Auth Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">{children}</div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} AIMS. All rights reserved.
        </p>
      </div>
    </div>
  );
};

AuthLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthLayout;
