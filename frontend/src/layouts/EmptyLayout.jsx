import React from 'react';
import PropTypes from 'prop-types';

/**
 * EmptyLayout Component
 * Minimal layout without sidebar/header (for error pages, etc.)
 */
const EmptyLayout = ({ children }) => {
  return <>{children}</>;
};

EmptyLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default EmptyLayout;
