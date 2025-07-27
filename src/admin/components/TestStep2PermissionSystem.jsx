// Enhanced Test Component for Step 2: Permission Context & PermissionGate Testing
import React, { useState } from 'react';
import { useAuth } from '../utils/useAuth';
import { useAdminPermission } from '../context/AdminPermissionContext';
import { 
  PermissionGate, 
  PermissionButton, 
  SuperAdminOnly, 
  PermissionSection,
  PermissionIndicator,
  ReadOnlyMode 
} from './PermissionGate';

const TestStep2PermissionSystem = () => {
  const { admin, isAdmin, token } = useAuth();
  const { 
    isSuperAdmin, 
    loading, 
    hasModuleAccess, 
    hasFeaturePermission,
    canManageAdmins,
    hasWriteAccess,
    hasReadOnlyAccess,
    getAccessibleModules,
    getModuleFeatures 
  } = useAdminPermission();

  const [testResults, setTestResults] = useState({});

  const runPermissionTests = () => {
    const results = {
      moduleTests: {},
      featureTests: {},
      componentTests: {}
    };

    // Test modules
    const modules = ['products', 'orders', 'users', 'analytics', 'admin_management'];
    modules.forEach(module => {
      results.moduleTests[module] = {
        hasAccess: hasModuleAccess(module),
        hasWrite: hasWriteAccess(module),
        hasReadOnly: hasReadOnlyAccess(module),
        features: getModuleFeatures(module)
      };
    });

    // Test specific features
    results.featureTests = {
      canCreateProducts: hasFeaturePermission('products', 'create_product', 'write'),
      canViewOrders: hasFeaturePermission('orders', 'view_orders', 'read'),
      canEditUsers: hasFeaturePermission('users', 'edit_user', 'write'),
      canViewAnalytics: hasFeaturePermission('analytics', 'view_dashboard', 'read'),
      canManageAdmins: canManageAdmins()
    };

    // Test component states
    results.componentTests = {
      accessibleModules: getAccessibleModules(),
      isSuperAdmin,
      loading
    };

    setTestResults(results);
  };

  if (!isAdmin) {
    return (
      <div className="test-component p-6 border border-red-300 bg-red-50 rounded-lg">
        <h3 className="text-lg font-bold text-red-700 mb-4">Step 2 Test - Not Admin</h3>
        <p>❌ Not logged in as admin. Please login as admin to test the permission system.</p>
      </div>
    );
  }

  return (
    <div className="test-component p-6 border border-blue-300 bg-blue-50 rounded-lg space-y-6">
      <div className="header">
        <h2 className="text-2xl font-bold text-blue-800 mb-4">
          🧪 Step 2 Test: Permission Context & PermissionGate
        </h2>
        <div className="admin-info bg-white p-4 rounded-lg mb-4">
          <h3 className="font-semibold mb-2">Current Admin Info:</h3>
          <p><strong>Name:</strong> {admin?.name}</p>
          <p><strong>Super Admin:</strong> {isSuperAdmin ? '✅ Yes' : '❌ No'}</p>
          <p><strong>Loading:</strong> {loading ? '⏳ Yes' : '✅ No'}</p>
        </div>
      </div>

      {/* Permission Context Tests */}
      <div className="context-tests bg-white p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">🎯 Permission Context Tests</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Module Access:</h4>
            <ul className="space-y-1 text-sm">
              <li>Products: {hasModuleAccess('products') ? '✅' : '❌'}</li>
              <li>Orders: {hasModuleAccess('orders') ? '✅' : '❌'}</li>
              <li>Users: {hasModuleAccess('users') ? '✅' : '❌'}</li>
              <li>Analytics: {hasModuleAccess('analytics') ? '✅' : '❌'}</li>
              <li>Admin Management: {hasModuleAccess('admin_management') ? '✅' : '❌'}</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Feature Permissions:</h4>
            <ul className="space-y-1 text-sm">
              <li>Create Products: {hasFeaturePermission('products', 'create_product', 'write') ? '✅' : '❌'}</li>
              <li>View Orders: {hasFeaturePermission('orders', 'view_orders', 'read') ? '✅' : '❌'}</li>
              <li>Edit Users: {hasFeaturePermission('users', 'edit_user', 'write') ? '✅' : '❌'}</li>
              <li>Can Manage Admins: {canManageAdmins() ? '✅' : '❌'}</li>
            </ul>
          </div>
        </div>
        <button 
          onClick={runPermissionTests}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          🔄 Run Detailed Tests
        </button>
      </div>

      {/* PermissionGate Component Tests */}
      <div className="permission-gate-tests bg-white p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">🚪 PermissionGate Component Tests</h3>
        
        <div className="space-y-4">
          {/* Basic Module Gate */}
          <div className="test-section">
            <h4 className="font-medium mb-2">Module-Level Protection:</h4>
            <PermissionGate module="products">
              <div className="bg-green-100 p-2 rounded">✅ You can see this because you have Products access</div>
            </PermissionGate>
            <PermissionGate module="fake_module" fallback={
              <div className="bg-red-100 p-2 rounded">❌ This shows because 'fake_module' doesn't exist</div>
            }>
              <div className="bg-green-100 p-2 rounded">You shouldn't see this</div>
            </PermissionGate>
          </div>

          {/* Feature-Level Gate */}
          <div className="test-section">
            <h4 className="font-medium mb-2">Feature-Level Protection:</h4>
            <PermissionGate module="products" feature="create_product" permission="write">
              <div className="bg-green-100 p-2 rounded">✅ You can CREATE products</div>
            </PermissionGate>
            <PermissionGate module="orders" feature="view_orders" permission="read">
              <div className="bg-green-100 p-2 rounded">✅ You can VIEW orders</div>
            </PermissionGate>
          </div>

          {/* Super Admin Only */}
          <div className="test-section">
            <h4 className="font-medium mb-2">Super Admin Only:</h4>
            <SuperAdminOnly fallback={
              <div className="bg-yellow-100 p-2 rounded">⚠️ Super Admin Only - You can't see the secret content</div>
            }>
              <div className="bg-purple-100 p-2 rounded">👑 Super Admin Secret Content - Only super admins see this!</div>
            </SuperAdminOnly>
          </div>
        </div>
      </div>

      {/* Component Variations Tests */}
      <div className="component-variations bg-white p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">🧩 Component Variations Tests</h3>
        
        <div className="space-y-4">
          {/* Permission Button */}
          <div className="test-section">
            <h4 className="font-medium mb-2">PermissionButton:</h4>
            <div className="space-x-2">
              <PermissionButton 
                module="products" 
                feature="create_product" 
                onClick={() => alert('Create Product clicked!')}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Create Product
              </PermissionButton>
              <PermissionButton 
                module="fake_module" 
                feature="fake_feature" 
                onClick={() => alert('This should not be visible')}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Hidden Button
              </PermissionButton>
            </div>
          </div>

          {/* Permission Section */}
          <div className="test-section">
            <h4 className="font-medium mb-2">PermissionSection:</h4>
            <PermissionSection 
              title="Products Management" 
              module="products"
              className="border border-gray-200 p-3 rounded"
            >
              <p>This entire section is only visible if you have Products access.</p>
              <p>It includes the title and all content inside.</p>
            </PermissionSection>
          </div>

          {/* Permission Indicator */}
          <div className="test-section">
            <h4 className="font-medium mb-2">PermissionIndicator:</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span>Products Create:</span>
                <PermissionIndicator module="products" feature="create_product" />
              </div>
              <div className="flex items-center space-x-2">
                <span>Orders View:</span>
                <PermissionIndicator module="orders" feature="view_orders" />
              </div>
              <div className="flex items-center space-x-2">
                <span>Users Edit:</span>
                <PermissionIndicator module="users" feature="edit_user" />
              </div>
            </div>
          </div>

          {/* Read Only Mode */}
          <div className="test-section">
            <h4 className="font-medium mb-2">ReadOnlyMode:</h4>
            <ReadOnlyMode 
              module="products" 
              feature="edit_product"
              readOnlyContent={
                <div className="bg-gray-100 p-2 rounded">📖 Read-only: You can only view products</div>
              }
            >
              <div className="bg-green-100 p-2 rounded">✏️ Full Access: You can edit products</div>
            </ReadOnlyMode>
          </div>
        </div>
      </div>

      {/* Detailed Test Results */}
      {Object.keys(testResults).length > 0 && (
        <div className="test-results bg-white p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">📊 Detailed Test Results</h3>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(testResults, null, 2)}
          </pre>
        </div>
      )}

      {/* Success Indicators */}
      <div className="success-indicators bg-green-50 border border-green-200 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-green-800 mb-3">✅ Step 2 Success Indicators</h3>
        <ul className="space-y-2 text-green-700">
          <li>✅ AdminPermissionContext loads permissions</li>
          <li>✅ useAdminPermission hook works in components</li>
          <li>✅ PermissionGate protects UI elements</li>
          <li>✅ Permission components render correctly</li>
          <li>✅ Module and feature-level checking works</li>
          <li>✅ Super admin detection works</li>
        </ul>
      </div>
    </div>
  );
};

export default TestStep2PermissionSystem;
