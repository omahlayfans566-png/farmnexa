import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import api from '../services/api.js';

export const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Inline Validation States
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [generalError, setGeneralError] = useState('');

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const validateEmail = (val: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!val.trim()) {
      setEmailError('Email address is required.');
      return false;
    }
    if (!emailRegex.test(val.trim())) {
      setEmailError('Please enter a valid email address.');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (val: string): boolean => {
    if (!val) {
      setPasswordError('Password is required.');
      return false;
    }
    if (val.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateConfirmPassword = (val: string, pwd = password): boolean => {
    if (!val) {
      setConfirmError('Please confirm your password.');
      return false;
    }
    if (val !== pwd) {
      setConfirmError('Passwords do not match.');
      return false;
    }
    setConfirmError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmValid = validateConfirmPassword(confirmPassword, password);

    if (!isEmailValid || !isPasswordValid || !isConfirmValid) {
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/register', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim(),
      });

      if (res.data.success) {
        login(res.data.token, res.data.user);
        navigate('/dashboard');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create account. Please try again.';
      setGeneralError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setGeneralError('');
    try {
      const res = await api.get('/auth/google/url');
      if (res.data.success && res.data.url) {
        window.location.href = res.data.url;
      } else {
        setGeneralError('Google Sign-In is temporarily unavailable.');
      }
    } catch (err: any) {
      setGeneralError(
        err.response?.data?.message ||
          'Google Sign-In is currently in test mode. Please register with your email.'
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-surface-container-lowest p-6 sm:p-8 rounded-2xl shadow-xl border border-outline-variant/40 flex flex-col gap-5">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center font-display font-extrabold text-2xl mx-auto shadow-md">
            F
          </div>
          <h1 className="font-headline-lg text-2xl sm:text-3xl font-extrabold text-primary mt-3">
            Create Customer Account
          </h1>
          <p className="font-body-md text-sm text-on-surface-variant mt-1.5 leading-relaxed">
            Register to browse fresh Nigerian produce, order authentic commodities, and manage your account.
          </p>
        </div>

        {generalError && (
          <div className="p-3.5 bg-error-container text-on-error-container rounded-xl text-sm font-semibold flex items-center gap-2.5">
            <span className="material-symbols-outlined text-lg shrink-0">error</span>
            <span>{generalError}</span>
          </div>
        )}

        {/* Google Sign-In Option */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full py-2.5 px-4 bg-surface-container-low hover:bg-surface-container border border-outline-variant/60 rounded-xl font-trade-unit text-sm font-semibold text-on-surface flex items-center justify-center gap-3 transition-colors shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{googleLoading ? 'Connecting...' : 'Sign up with Google'}</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-outline-variant/40"></div>
          <span className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">
            Or with Email
          </span>
          <div className="flex-1 h-px bg-outline-variant/40"></div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="font-trade-unit text-xs text-on-surface font-semibold block mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Daniel Adeyemi"
              className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="font-trade-unit text-xs text-on-surface font-semibold block mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) validateEmail(e.target.value);
              }}
              onBlur={() => validateEmail(email)}
              placeholder="name@example.com"
              className={`w-full px-3.5 py-2.5 bg-surface-container-low border rounded-xl text-sm focus:outline-none transition-colors ${
                emailError ? 'border-error focus:border-error' : 'border-outline-variant/60 focus:border-primary'
              }`}
            />
            {emailError && (
              <p className="text-xs text-error mt-1 flex items-center gap-1 font-medium">
                <span className="material-symbols-outlined text-xs">error</span>
                <span>{emailError}</span>
              </p>
            )}
          </div>

          <div>
            <label className="font-trade-unit text-xs text-on-surface font-semibold block mb-1">
              WhatsApp Phone Number (Optional)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 08031234567 or +2348031234567"
              className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-trade-unit text-xs text-on-surface font-semibold block mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) validatePassword(e.target.value);
                    if (confirmPassword) validateConfirmPassword(confirmPassword, e.target.value);
                  }}
                  onBlur={() => validatePassword(password)}
                  placeholder="Min. 6 characters"
                  className={`w-full pl-3.5 pr-10 py-2.5 bg-surface-container-low border rounded-xl text-sm focus:outline-none transition-colors ${
                    passwordError ? 'border-error focus:border-error' : 'border-outline-variant/60 focus:border-primary'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined text-base">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {passwordError && (
                <p className="text-xs text-error mt-1 flex items-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-xs">error</span>
                  <span>{passwordError}</span>
                </p>
              )}
            </div>

            <div>
              <label className="font-trade-unit text-xs text-on-surface font-semibold block mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (confirmError) validateConfirmPassword(e.target.value, password);
                  }}
                  onBlur={() => validateConfirmPassword(confirmPassword, password)}
                  placeholder="Repeat password"
                  className={`w-full pl-3.5 pr-10 py-2.5 bg-surface-container-low border rounded-xl text-sm focus:outline-none transition-colors ${
                    confirmError ? 'border-error focus:border-error' : 'border-outline-variant/60 focus:border-primary'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined text-base">
                    {showConfirmPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {confirmError && (
                <p className="text-xs text-error mt-1 flex items-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-xs">error</span>
                  <span>{confirmError}</span>
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container font-trade-unit text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin text-base">sync</span>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        <div className="text-center pt-3 border-t border-outline-variant/30 text-sm text-on-surface-variant">
          <span>Already have an account? </span>
          <Link to="/login" className="font-bold text-primary hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
