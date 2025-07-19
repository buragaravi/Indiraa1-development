import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';

const SubAdminEmailVerification = () => {
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const email = params.get('email');

        if (!token || !email) {
          setStatus('error');
          setMessage('Invalid verification link. Missing token or email.');
          return;
        }

        console.log('[EMAIL VERIFICATION] Verifying email:', email);

        const response = await fetch(
          `https://indiraa1-backend.onrender.com/api/sub-admin/verify-email?token=${token}&email=${encodeURIComponent(email)}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully!');
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/sub-admin/login');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.message || 'Email verification failed.');
        }

      } catch (error) {
        console.error('[EMAIL VERIFICATION] Error:', error);
        setStatus('error');
        setMessage('Network error. Please try again.');
      }
    };

    verifyEmail();
  }, [location.search, navigate]);

  const getStatusIcon = () => {
    switch (status) {
      case 'verifying':
        return <FaSpinner className="animate-spin text-4xl text-blue-500" />;
      case 'success':
        return <FaCheckCircle className="text-4xl text-green-500" />;
      case 'error':
        return <FaTimesCircle className="text-4xl text-red-500" />;
      default:
        return <FaSpinner className="animate-spin text-4xl text-blue-500" />;
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'verifying':
        return 'Verifying Email...';
      case 'success':
        return 'Email Verified!';
      case 'error':
        return 'Verification Failed';
      default:
        return 'Verifying Email...';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'verifying':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Logo/Brand */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#2ecc71] via-[#27ae60] to-[#2ecc71] bg-clip-text text-transparent">
            Indiraa E-commerce
          </h1>
          <p className="text-gray-600 text-sm">Sub Admin Panel</p>
        </div>

        {/* Status Icon */}
        <div className="mb-6 flex justify-center">
          {getStatusIcon()}
        </div>

        {/* Status Title */}
        <h2 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
          {getStatusTitle()}
        </h2>

        {/* Status Message */}
        <p className="text-gray-600 mb-6 leading-relaxed">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          {status === 'success' && (
            <div>
              <button
                onClick={() => navigate('/sub-admin/login')}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Go to Login
              </button>
              <p className="text-sm text-gray-500 mt-2">
                Redirecting automatically in 3 seconds...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/sub-admin/login')}
                className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
              >
                Go to Login
              </button>
            </div>
          )}

          {status === 'verifying' && (
            <div className="flex items-center justify-center space-x-2 text-blue-600">
              <FaSpinner className="animate-spin" />
              <span>Please wait...</span>
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Need help? Contact the administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubAdminEmailVerification;
