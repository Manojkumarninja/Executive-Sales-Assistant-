import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaChartLine, FaLock, FaCheckCircle } from 'react-icons/fa';

const API_BASE_URL = 'http://localhost:5000/api';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const employee_id = searchParams.get('emp');

  const [formData, setFormData] = useState({
    new_password: '',
    confirm_password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Validate URL parameters
    if (!token || !employee_id) {
      setErrorMessage('Invalid reset link. Please request a new password reset.');
    }
  }, [token, employee_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setErrorMessage('');
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.new_password) {
      newErrors.new_password = 'Password is required';
    } else if (formData.new_password.length < 6) {
      newErrors.new_password = 'Password must be at least 6 characters';
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Please confirm your password';
    } else if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!token || !employee_id) {
      setErrorMessage('Invalid reset link');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employee_id,
          token,
          new_password: formData.new_password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      setSuccessMessage(data.message);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);

    } catch (error) {
      console.error('Reset password error:', error);
      setErrorMessage(error.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg p-4">
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Reset Password Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 md:p-10 animate-fade-in">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-full mb-4 shadow-lg">
            <FaChartLine className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
          <p className="text-gray-600">Create a new password for your account</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            <div className="flex items-center mb-2">
              <FaCheckCircle className="mr-2 text-lg" />
              <p className="font-semibold">Password Reset Successful!</p>
            </div>
            <p className="text-sm">{successMessage}</p>
            <p className="text-xs mt-2">Redirecting to login page...</p>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {errorMessage}
            {errorMessage.includes('expired') && (
              <button
                onClick={() => navigate('/forgot-password')}
                className="block mt-2 text-primary hover:text-primary-dark font-semibold underline"
              >
                Request a new reset link
              </button>
            )}
          </div>
        )}

        {/* Reset Password Form */}
        {!successMessage && token && employee_id && (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Employee ID Display */}
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-xs text-gray-600">Resetting password for:</p>
              <p className="text-sm font-semibold text-gray-900">{employee_id}</p>
            </div>

            {/* New Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  type="password"
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleChange}
                  className={`input-field pl-10 ${errors.new_password ? 'border-danger' : ''}`}
                  placeholder="Enter new password (min 6 characters)"
                  disabled={isLoading}
                />
              </div>
              {errors.new_password && (
                <p className="mt-1 text-sm text-danger">{errors.new_password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  type="password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className={`input-field pl-10 ${errors.confirm_password ? 'border-danger' : ''}`}
                  placeholder="Re-enter your new password"
                  disabled={isLoading}
                />
              </div>
              {errors.confirm_password && (
                <p className="mt-1 text-sm text-danger">{errors.confirm_password}</p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs font-semibold text-blue-800 mb-1">Password Requirements:</p>
              <ul className="text-xs text-blue-700 list-disc list-inside">
                <li>At least 6 characters long</li>
                <li>Mix of letters and numbers recommended</li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full btn-primary ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Resetting Password...
                </span>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        )}

        {/* Back to Login */}
        {!successMessage && (
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-primary hover:text-primary-dark font-medium text-sm"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
