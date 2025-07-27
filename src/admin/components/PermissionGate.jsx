// PermissionGate - Component for protecting UI elements based on admin permissions
import React from 'react';
import { useAdminPermission } from '../context/AdminPermissionContext';

/**
 * PermissionGate Component
 * 
 * Protects UI elements based on admin permissions. Only renders children if admin has required access.
 * 
 * @param {React.ReactNode} children - Content to render if permission check passes
 * @param {string} module - Module name to check access for (e.g., 'products', 'orders')
 * @param {string} feature - Specific feature to check (e.g., 'create_product', 'edit_order')
 * @param {string} permission - Required permission level ('read', 'write')
 * @param {React.ReactNode|null} fallback - Content to show if access denied (default: null)
 * @param {boolean} requireSuperAdmin - If true, only super admins can access (default: false)
 * @param {boolean} showLoadingSpinner - Show loading spinner while checking permissions (default: false)
 */
export const PermissionGate = ({ 
  children, 
  module = null,
  feature = null,
  permission = 'read',
  fallback = null,
  requireSuperAdmin = false,
  showLoadingSpinner = false,
  className = ''
}) => {
  const { 
    isAdmin, 
    isSuperAdmin, 
    loading,
    hasModuleAccess, 
    hasFeaturePermission 
  } = useAdminPermission();

  // Show loading state if permissions are still loading
  if (loading && showLoadingSpinner) {
    return (
      <div className={`permission-gate-loading ${className}`}>
        <div className="loading-spinner">⏳</div>
      </div>
    );
  }

  // If not admin at all, deny access
  if (!isAdmin) {
    return fallback;
  }

  // If super admin is required and user is not super admin
  if (requireSuperAdmin && !isSuperAdmin) {
    return fallback;
  }

  // If super admin, grant access to everything (unless specifically denied)
  if (isSuperAdmin) {
    return children;
  }

  // Check module access if module is specified
  if (module && !hasModuleAccess(module)) {
    return fallback;
  }

  // Check feature permission if feature is specified
  if (feature && !hasFeaturePermission(module, feature, permission)) {
    return fallback;
  }

  // All checks passed, render children
  return children;
};

/**
 * PermissionButton - Button component with built-in permission checking
 */
export const PermissionButton = ({ 
  children, 
  onClick,
  module,
  feature,
  permission = 'write',
  requireSuperAdmin = false,
  disabled = false,
  className = '',
  variant = 'primary',
  ...props 
}) => {
  return (
    <PermissionGate 
      module={module} 
      feature={feature} 
      permission={permission}
      requireSuperAdmin={requireSuperAdmin}
      fallback={null}
    >
      <button
        onClick={onClick}
        disabled={disabled}
        className={`permission-button ${variant} ${className}`}
        {...props}
      >
        {children}
      </button>
    </PermissionGate>
  );
};

/**
 * PermissionLink - Link component with built-in permission checking
 */
export const PermissionLink = ({ 
  children, 
  to,
  module,
  feature,
  permission = 'read',
  requireSuperAdmin = false,
  className = '',
  ...props 
}) => {
  return (
    <PermissionGate 
      module={module} 
      feature={feature} 
      permission={permission}
      requireSuperAdmin={requireSuperAdmin}
      fallback={null}
    >
      <Link
        to={to}
        className={`permission-link ${className}`}
        {...props}
      >
        {children}
      </Link>
    </PermissionGate>
  );
};

/**
 * PermissionSection - Section wrapper with permission checking
 */
export const PermissionSection = ({ 
  children, 
  title,
  module,
  feature,
  permission = 'read',
  requireSuperAdmin = false,
  showTitle = true,
  className = ''
}) => {
  return (
    <PermissionGate 
      module={module} 
      feature={feature} 
      permission={permission}
      requireSuperAdmin={requireSuperAdmin}
      fallback={null}
    >
      <div className={`permission-section ${className}`}>
        {showTitle && title && (
          <h3 className="permission-section-title">{title}</h3>
        )}
        {children}
      </div>
    </PermissionGate>
  );
};

/**
 * SuperAdminOnly - Component that only renders for super admins
 */
export const SuperAdminOnly = ({ children, fallback = null }) => {
  return (
    <PermissionGate requireSuperAdmin={true} fallback={fallback}>
      {children}
    </PermissionGate>
  );
};

/**
 * ReadOnlyMode - Component that shows different content based on permission level
 */
export const ReadOnlyMode = ({ 
  children, 
  readOnlyContent,
  module,
  feature,
  className = ''
}) => {
  const { hasFeaturePermission } = useAdminPermission();
  
  const hasWriteAccess = hasFeaturePermission(module, feature, 'write');
  
  return (
    <div className={`read-only-mode ${className}`}>
      {hasWriteAccess ? children : readOnlyContent}
    </div>
  );
};

/**
 * PermissionIndicator - Visual indicator of current permission level
 */
export const PermissionIndicator = ({ 
  module, 
  feature, 
  showLevel = true,
  className = '' 
}) => {
  const { hasFeaturePermission, isSuperAdmin } = useAdminPermission();
  
  if (isSuperAdmin) {
    return (
      <span className={`permission-indicator super-admin ${className}`}>
        👑 Super Admin
      </span>
    );
  }
  
  const hasWrite = hasFeaturePermission(module, feature, 'write');
  const hasRead = hasFeaturePermission(module, feature, 'read');
  
  if (hasWrite) {
    return (
      <span className={`permission-indicator write ${className}`}>
        ✏️ {showLevel ? 'Full Access' : ''}
      </span>
    );
  } else if (hasRead) {
    return (
      <span className={`permission-indicator read ${className}`}>
        👁️ {showLevel ? 'Read Only' : ''}
      </span>
    );
  } else {
    return (
      <span className={`permission-indicator none ${className}`}>
        🚫 {showLevel ? 'No Access' : ''}
      </span>
    );
  }
};

// Export all components
export default PermissionGate;
