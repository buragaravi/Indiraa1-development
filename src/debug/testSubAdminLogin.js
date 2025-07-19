// Debug script to test sub-admin login
const testSubAdminLogin = async () => {
  console.log('[DEBUG] Starting sub-admin login test...');
  
  const testCredentials = {
    email: 'warehouse@test.com', // Replace with actual test credentials
    password: 'test123'
  };
  
  try {
    const response = await fetch('https://indiraa1-backend.onrender.com/api/sub-admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testCredentials)
    });
    
    console.log('[DEBUG] Response status:', response.status);
    console.log('[DEBUG] Response ok:', response.ok);
    
    const data = await response.json();
    console.log('[DEBUG] Response data:', data);
    
    if (data.success) {
      console.log('[DEBUG] Login successful!');
      console.log('[DEBUG] Token:', data.token);
      console.log('[DEBUG] Sub-admin data:', data.subAdmin);
      console.log('[DEBUG] Dashboard path:', data.dashboard);
      
      // Test storing in localStorage
      localStorage.setItem('subAdminToken', data.token);
      localStorage.setItem('subAdminData', JSON.stringify(data.subAdmin));
      
      console.log('[DEBUG] Token stored in localStorage');
      console.log('[DEBUG] Retrieved token:', localStorage.getItem('subAdminToken'));
      console.log('[DEBUG] Retrieved data:', localStorage.getItem('subAdminData'));
    } else {
      console.error('[DEBUG] Login failed:', data.message);
    }
    
  } catch (error) {
    console.error('[DEBUG] Login error:', error);
  }
};

// Export for manual testing in console
window.testSubAdminLogin = testSubAdminLogin;

console.log('[DEBUG] Test function loaded. Call window.testSubAdminLogin() to test login.');
