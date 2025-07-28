// PermissionButton - Button component with permission checking and tooltip
import React from 'react';
import { useAdminPermission } from '../context/AdminPermissionContext';

const PermissionButton = ({ 
  module, 
  action, 
  children, 
  onClick, 
  className = '', 
  variant = 'primary',
  size = 'md',
  disabled = false,
  disabledTooltip,
  title,
  ...props 
}) => {
  const { hasActionPermission, isSuperAdmin } = useAdminPermission();
  
  // Check if admin has permission for this action
  const hasPermission = isSuperAdmin || hasActionPermission(module, action);
  const isDisabled = disabled || !hasPermission;

  // Button variants
  const variants = {
    primary: hasPermission 
      ? 'bg-blue-500 hover:bg-blue-600 text-white' 
      : 'bg-gray-300 text-gray-500 cursor-not-allowed',
    secondary: hasPermission 
      ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300' 
      : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed',
    success: hasPermission 
      ? 'bg-green-500 hover:bg-green-600 text-white' 
      : 'bg-gray-300 text-gray-500 cursor-not-allowed',
    danger: hasPermission 
      ? 'bg-red-500 hover:bg-red-600 text-white' 
      : 'bg-gray-300 text-gray-500 cursor-not-allowed',
    warning: hasPermission 
      ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
  };

  // Button sizes
  const sizes = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const buttonClass = `
    ${variants[variant]} 
    ${sizes[size]} 
    ${className}
    rounded-lg font-medium transition-all duration-200 
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    ${hasPermission ? 'transform hover:scale-105' : ''}
  `.trim();

  const handleClick = (e) => {
    if (hasPermission && onClick) {
      onClick(e);
    } else {
      e.preventDefault();
    }
  };

  // Improved tooltip content
  const tooltipContent = !hasPermission 
    ? (disabledTooltip || `You don't have permission to ${action.replace('_', ' ')}`)
    : (title || `Click to ${action.replace('_', ' ')}`);

  return (
    <div className="relative inline-block">
      <button
        className={buttonClass}
        onClick={handleClick}
        disabled={isDisabled}
        title={tooltipContent}
        {...props}
      >
        {children}
      </button>
    </div>
  );
};

export default PermissionButton;
