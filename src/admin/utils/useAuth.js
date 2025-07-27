import { useState, useEffect } from "react";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [isAdmin, setIsAdmin] = useState(false);
  
  // NEW: Multi-admin permission states
  const [adminPermissions, setAdminPermissions] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [permissionsLoading, setPermissionsLoading] = useState(false);

  useEffect(() => {
    // Check if user is admin based on stored data
    const storedUser = localStorage.getItem("user");
    const storedAdmin = localStorage.getItem("admin");
    
    if (storedAdmin) {
      setAdmin(JSON.parse(storedAdmin));
      setIsAdmin(true);
      // NEW: Load permissions when admin is found
      loadAdminPermissions();
    } else if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAdmin(false);
    }
  }, []);

  // NEW: Load admin permissions from backend
  const loadAdminPermissions = async () => {
    if (!token || !isAdmin) return;
    
    try {
      setPermissionsLoading(true);
      const response = await fetch('http://localhost:5001/api/admin/me', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.admin) {
          // Update admin data with fresh info from server
          setAdmin(data.admin);
          setAdminPermissions(data.admin.permissions);
          setIsSuperAdmin(data.admin.isSuperAdmin || false);
          
          // Update localStorage with fresh admin data
          localStorage.setItem("admin", JSON.stringify(data.admin));
        }
      } else {
        console.warn('Failed to load admin permissions:', response.status);
      }
    } catch (error) {
      console.error('Error loading admin permissions:', error);
    } finally {
      setPermissionsLoading(false);
    }
  };

  // NEW: Permission checking functions
  const checkPermissionLevel = (userLevel, requiredLevel) => {
    const levels = { 'none': 0, 'read': 1, 'write': 2 };
    return levels[userLevel] >= levels[requiredLevel];
  };

  const hasModuleAccess = (module) => {
    // Super admin has access to everything
    if (isSuperAdmin) return true;
    
    // Check if admin has permission for this module
    if (!adminPermissions?.modules) return false;
    
    // Handle Map objects from MongoDB
    if (adminPermissions.modules instanceof Map) {
      return adminPermissions.modules.get(module)?.enabled || false;
    }
    
    // Handle plain objects
    return adminPermissions.modules[module]?.enabled || false;
  };

  const hasFeaturePermission = (module, feature, requiredLevel = 'read') => {
    // Super admin has access to everything
    if (isSuperAdmin) return true;
    
    // Check module access first
    if (!hasModuleAccess(module)) return false;
    
    if (!adminPermissions?.modules) return false;
    
    let modulePerms;
    // Handle Map objects from MongoDB
    if (adminPermissions.modules instanceof Map) {
      modulePerms = adminPermissions.modules.get(module);
    } else {
      // Handle plain objects
      modulePerms = adminPermissions.modules[module];
    }
    
    if (!modulePerms?.enabled) return false;
    
    let featureLevel;
    // Handle Map objects for features
    if (modulePerms.features instanceof Map) {
      featureLevel = modulePerms.features.get(feature) || 'none';
    } else {
      // Handle plain objects
      featureLevel = modulePerms.features?.[feature] || 'none';
    }
    
    return checkPermissionLevel(featureLevel, requiredLevel);
  };

  const login = (userData, jwt) => {
    setUser(userData);
    setAdmin(null);
    setToken(jwt);
    setIsAdmin(false);
    // Reset admin-specific states
    setAdminPermissions(null);
    setIsSuperAdmin(false);
    localStorage.setItem("token", jwt);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.removeItem("admin");
  };

  const adminLogin = async (adminData, jwt) => {
    setAdmin(adminData);
    setUser(null);
    setToken(jwt);
    setIsAdmin(true);
    localStorage.setItem("token", jwt);
    localStorage.setItem("admin", JSON.stringify(adminData));
    localStorage.removeItem("user");
    
    // NEW: Load permissions after admin login
    try {
      await loadAdminPermissions();
    } catch (error) {
      console.error('Error loading permissions after login:', error);
    }
  };

  const logout = () => {
    setUser(null);
    setAdmin(null);
    setToken("");
    setIsAdmin(false);
    // NEW: Reset admin-specific states
    setAdminPermissions(null);
    setIsSuperAdmin(false);
    setPermissionsLoading(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("admin");
  };

  const getCurrentUser = () => isAdmin ? admin : user;

  return { 
    // Existing exports (unchanged)
    user, 
    admin, 
    token, 
    isAdmin, 
    login, 
    adminLogin, 
    logout, 
    getCurrentUser,
    
    // NEW: Multi-admin permission exports
    adminPermissions,
    isSuperAdmin,
    permissionsLoading,
    loadAdminPermissions,
    hasModuleAccess,
    hasFeaturePermission
  };
}
