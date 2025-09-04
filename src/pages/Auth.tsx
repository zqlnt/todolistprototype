import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, Shield } from 'lucide-react';
import { useTodoStore } from '../store';

const Auth: React.FC = () => {
  const { signIn, signUp, authStatus, authError, clearAuthError } = useTodoStore();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!email.trim()) {
      errors.push('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.push('Please enter a valid email address');
    }
    
    if (!password.trim()) {
      errors.push('Password is required');
    } else if (password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }
    
    if (isSignUp && password !== confirmPassword) {
      errors.push('Passwords do not match');
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    clearAuthError();
    
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      
      // Store token in localStorage for persistence
      const { session } = useTodoStore.getState();
      if (session?.access_token) {
        localStorage.setItem('auth_token', session.access_token);
      }
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setValidationErrors([]);
    clearAuthError();
    setPassword('');
    setConfirmPassword('');
  };

  const isLoading = authStatus === 'loading';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-8">
          {/* Header inside card */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <img 
                src="https://i.imghippo.com/files/XHpy4525kG.png" 
                alt="Sentinel Logo" 
                className="w-12 h-12 object-contain rounded-lg"
              />
              <h1 className="text-3xl font-bold text-neutral-900">Sentinel</h1>
            </div>
            <p className="text-sm text-neutral-500 mb-3">Presented by Watermelon AI</p>
            <p className="text-neutral-600 mb-6">Your intelligent productivity assistant</p>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-neutral-600">
              {isSignUp 
                ? 'Sign up to start organizing your tasks' 
                : 'Sign in to access your tasks and data'
              }
            </p>
          </div>

          {/* Error Messages */}
          {(authError || validationErrors.length > 0) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  {authError && (
                    <p className="text-sm text-red-700 mb-1">{authError.message}</p>
                  )}
                  {validationErrors.map((error, index) => (
                    <p key={index} className="text-sm text-red-700">
                      {error}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={16} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={16} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field (Sign Up Only) */}
            {isSignUp && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={16} />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full pl-10 pr-12 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
                </>
              ) : (
                <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button
                onClick={toggleMode}
                disabled={isLoading}
                className="ml-1 text-indigo-600 hover:text-indigo-700 font-medium disabled:opacity-50"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;