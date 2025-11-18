import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaIdCard } from 'react-icons/fa';
import { trackLogin, trackSignup } from '../utils/analytics';
import NinjacartLogo from '../components/shared/NinjacartLogo';
import ServerWakeupLoader from '../components/shared/ServerWakeupLoader';
import { API_BASE_URL } from '../config';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [formData, setFormData] = useState({
    employee_id: '',
    password: '',
    confirmPassword: '', // Only for signup
    full_name: '', // Auto-filled from database during signup
    email: '', // Auto-filled from database during signup
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    setApiError('');
  };

  const validateLoginForm = () => {
    const newErrors = {};

    if (!formData.employee_id.trim()) {
      newErrors.employee_id = 'Employee ID is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    return newErrors;
  };

  const validateSignupForm = () => {
    const newErrors = {};

    if (!formData.employee_id.trim()) {
      newErrors.employee_id = 'Employee ID is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const newErrors = validateLoginForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setApiError('');

    try {
      // Create AbortController for timeout (3 minutes for server wake-up)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 minutes

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employee_id: formData.employee_id,
          password: formData.password,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token in localStorage
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_data', JSON.stringify(data.user));

      // Track login event
      trackLogin(data.user.employee_id, data.user.role);

      // Call parent onLogin with user data
      onLogin(data.user);

    } catch (error) {
      console.error('Login error:', error);

      // Better error messages for different scenarios
      if (error.name === 'AbortError') {
        setApiError('Server is taking longer than expected to wake up. Please try again or contact support.');
      } else if (error.message === 'Failed to fetch') {
        setApiError('Server is waking up (this may take 1-2 minutes on first access). Please wait and try again.');
      } else {
        setApiError(error.message || 'Failed to login. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    const newErrors = validateSignupForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setApiError('');
    setSuccessMessage('');

    try {
      // Create AbortController for timeout (3 minutes for server wake-up)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 minutes

      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employee_id: formData.employee_id,
          password: formData.password,
          full_name: formData.full_name || 'Sales Executive', // Fallback
          email: formData.email || 'executive@company.com', // Fallback
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      // Show success message
      setSuccessMessage('Signup successful! You can now login.');

      // Store token in localStorage
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_data', JSON.stringify(data.user));

      // Track signup event
      trackSignup(data.user.employee_id, data.user.role);

      // Auto-login after successful signup
      setTimeout(() => {
        onLogin(data.user);
      }, 1500);

    } catch (error) {
      console.error('Signup error:', error);

      // Better error messages for different scenarios
      if (error.name === 'AbortError') {
        setApiError('Server is taking longer than expected to wake up. Please try again or contact support.');
      } else if (error.message === 'Failed to fetch') {
        setApiError('Server is waking up (this may take 1-2 minutes on first access). Please wait and try again.');
      } else {
        setApiError(error.message || 'Failed to signup. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setErrors({});
    setApiError('');
    setSuccessMessage('');
    setFormData({
      employee_id: '',
      password: '',
      confirmPassword: '',
      full_name: '',
      email: '',
    });
  };

  return (
    <>
      {/* Server Wakeup Loader */}
      <ServerWakeupLoader isLoading={isLoading} />

      <div className="min-h-screen flex items-center justify-center gradient-bg p-4">
        {/* Animated background circles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        </div>

      {/* Login/Signup Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 md:p-10 animate-fade-in">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <NinjacartLogo size="normal" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            <span className="bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent">
              Executive Sales Assistant
            </span>
          </h1>
          <p className="text-sm md:text-base text-gray-600">Drive your success, achieve your targets</p>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${
              mode === 'login'
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => switchMode('signup')}
            className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${
              mode === 'signup'
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
            {successMessage}
          </div>
        )}

        {/* API Error Message */}
        {apiError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {apiError}
          </div>
        )}

        {/* Login Form */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Employee ID Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Employee ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaIdCard className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="employee_id"
                  value={formData.employee_id}
                  onChange={handleChange}
                  className={`input-field pl-10 ${errors.employee_id ? 'border-danger' : ''}`}
                  placeholder="Enter your employee ID"
                />
              </div>
              {errors.employee_id && (
                <p className="mt-1 text-sm text-danger">{errors.employee_id}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input-field pl-10 ${errors.password ? 'border-danger' : ''}`}
                  placeholder="Enter your password"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-danger">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="ml-2 text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-primary hover:text-primary-dark font-medium"
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
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
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </button>
          </form>
        )}

        {/* Signup Form */}
        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-5">
            {/* Employee ID Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Employee ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaIdCard className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="employee_id"
                  value={formData.employee_id}
                  onChange={handleChange}
                  className={`input-field pl-10 ${errors.employee_id ? 'border-danger' : ''}`}
                  placeholder="Enter your employee ID"
                />
              </div>
              {errors.employee_id && (
                <p className="mt-1 text-sm text-danger">{errors.employee_id}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Must be a registered Business Development Executive
              </p>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Create Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input-field pl-10 ${errors.password ? 'border-danger' : ''}`}
                  placeholder="Create a password (min 6 characters)"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-danger">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`input-field pl-10 ${errors.confirmPassword ? 'border-danger' : ''}`}
                  placeholder="Re-enter your password"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-danger">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Signup Button */}
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
                  Creating account...
                </span>
              ) : (
                'Sign Up'
              )}
            </button>
          </form>
        )}

        {/* Info Message */}
        <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-xs text-purple-800 text-center">
            {mode === 'login' ? (
              <>
                <span className="font-semibold">New user?</span> Click on Sign Up to create an account
              </>
            ) : (
              <>
                <span className="font-semibold">Note:</span> Your employee details will be fetched from the database
              </>
            )}
          </p>
        </div>
      </div>
    </div>
    </>
  );
};

export default Login;
