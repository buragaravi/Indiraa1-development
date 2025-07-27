// Test Component to verify enhanced useAuth hook
import React, { useEffect } from 'react';
import { useAuth } from '../utils/useAuth';

const TestMultiAdminAuth = () => {
  const { 
    admin, 
    isAdmin, 
    isSuperAdmin, 
    adminPermissions, 
    permissionsLoading,
    hasModuleAccess, 
    hasFeaturePermission,
    loadAdminPermissions 
  } = useAuth();

  useEffect(() => {
    console.log('=== Multi-Admin Auth Test ===');
    console.log('Admin:', admin);
    console.log('Is Admin:', isAdmin);
    console.log('Is Super Admin:', isSuperAdmin);
    console.log('Permissions Loading:', permissionsLoading);
    console.log('Admin Permissions:', adminPermissions);
    
    // Test permission functions
    if (adminPermissions) {
      console.log('\n=== Permission Tests ===');
      console.log('Has Products Access:', hasModuleAccess('products'));
      console.log('Has Orders Access:', hasModuleAccess('orders'));
      console.log('Can View Products:', hasFeaturePermission('products', 'view_products', 'read'));
      console.log('Can Create Products:', hasFeaturePermission('products', 'create_product', 'write'));
      console.log('Can Edit Orders:', hasFeaturePermission('orders', 'update_status', 'write'));
    }
  }, [admin, adminPermissions, isSuperAdmin]);

  const handleTestPermissionLoad = () => {
    console.log('Testing permission reload...');
    loadAdminPermissions();
  };

  if (!isAdmin) {
    return (
      <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
        <h3>Multi-Admin Auth Test</h3>
        <p>❌ Not logged in as admin</p>
        <p>Please login as admin to test the enhanced auth system</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>🎯 Multi-Admin Auth Test Results</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <h4>Admin Info:</h4>
        <p><strong>Name:</strong> {admin?.name || 'N/A'}</p>
        <p><strong>Username:</strong> {admin?.username || 'N/A'}</p>
        <p><strong>Email:</strong> {admin?.email || 'N/A'}</p>
        <p><strong>Super Admin:</strong> {isSuperAdmin ? '✅ Yes' : '❌ No'}</p>
        <p><strong>Active:</strong> {admin?.isActive ? '✅ Yes' : '❌ No'}</p>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <h4>Permission System:</h4>
        <p><strong>Permissions Loading:</strong> {permissionsLoading ? '⏳ Loading...' : '✅ Loaded'}</p>
        <p><strong>Has Permissions:</strong> {adminPermissions ? '✅ Yes' : '❌ No'}</p>
      </div>

      {adminPermissions && (
        <div style={{ marginBottom: '15px' }}>
          <h4>Module Access Tests:</h4>
          <ul>
            <li>Products: {hasModuleAccess('products') ? '✅ Yes' : '❌ No'}</li>
            <li>Orders: {hasModuleAccess('orders') ? '✅ Yes' : '❌ No'}</li>
            <li>Users: {hasModuleAccess('users') ? '✅ Yes' : '❌ No'}</li>
            <li>Analytics: {hasModuleAccess('analytics') ? '✅ Yes' : '❌ No'}</li>
            <li>Admin Management: {hasModuleAccess('admin_management') ? '✅ Yes' : '❌ No'}</li>
          </ul>
        </div>
      )}

      {adminPermissions && (
        <div style={{ marginBottom: '15px' }}>
          <h4>Feature Permission Tests:</h4>
          <ul>
            <li>View Products: {hasFeaturePermission('products', 'view_products', 'read') ? '✅ Yes' : '❌ No'}</li>
            <li>Create Products: {hasFeaturePermission('products', 'create_product', 'write') ? '✅ Yes' : '❌ No'}</li>
            <li>Edit Products: {hasFeaturePermission('products', 'edit_product', 'write') ? '✅ Yes' : '❌ No'}</li>
            <li>View Orders: {hasFeaturePermission('orders', 'view_orders', 'read') ? '✅ Yes' : '❌ No'}</li>
            <li>Update Order Status: {hasFeaturePermission('orders', 'update_status', 'write') ? '✅ Yes' : '❌ No'}</li>
          </ul>
        </div>
      )}

      <div>
        <button 
          onClick={handleTestPermissionLoad}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🔄 Reload Permissions
        </button>
      </div>

      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
        <h4>Raw Permissions Data:</h4>
        <pre style={{ fontSize: '12px', overflow: 'auto' }}>
          {JSON.stringify(adminPermissions, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default TestMultiAdminAuth;
