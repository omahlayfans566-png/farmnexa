import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import api from '../services/api.js';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const searchParams = new URLSearchParams(location.search);
  const queryError = searchParams.get('error');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });

      if (res.data.success) {
        login(res.data.token, res.data.user);
        if (res.data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setErrorMsg('');
    try {
      const res = await api.get('/auth/google/url');
      if (res.data.success && res.data.url) {
        window.location.href = res.data.url;
      } else {
        setErrorMsg('Google Sign-In is temporarily unavailable.');
      }
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message ||
          'Google Sign-In is currently restricted to registered test users. Please log in with your email and password.'
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-surface-container-lowest p-6 sm:p-8 rounded-2xl shadow-xl border border-outline-variant/40 flex flex-col gap-5">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center font-display font-extrabold text-2xl mx-auto shadow-md">
            F
          </div>
          <h1 className="font-headline-lg text-2xl sm:text-3xl font-extrabold text-primary mt-3">
            Welcome to FarmNexa
          </h1>
          <p className="font-body-md text-sm text-on-surface-variant mt-1.5 leading-relaxed">
            Sign in to access your orders, manage your profile, and purchase authentic Nigerian farm produce.
          </p>
        </div>

        {(errorMsg || queryError) && (
          <div className="p-3.5 bg-error-container text-on-error-container rounded-xl text-sm font-semibold flex items-center gap-2.5">
            <span className="material-symbols-outlined text-lg shrink-0">error</span>
            <span>
              {errorMsg ||
                (queryError === 'google_cancelled'
                  ? 'Google Sign-In was cancelled.'
                  : queryError === 'oauth_failed'
                  ? 'Google authentication failed or is restricted. Please sign in with your email.'
                  : 'Authentication error occurred. Please try again.')}
            </span>
          </div>
        )}

        {/* Google Sign-In Button */}
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
          <span>{googleLoading ? 'Connecting...' : 'Continue with Google'}</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-outline-variant/40"></div>
          <span className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">
            Or Email
          </span>
          <div className="flex-1 h-px bg-outline-variant/40"></div>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="font-trade-unit text-xs text-on-surface font-semibold block mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-trade-unit text-xs text-on-surface font-semibold">
                Password
              </label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-3.5 pr-10 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl text-sm focus:outline-none focus:border-primary transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                tabIndex={-1}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                <span className="material-symbols-outlined text-base">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
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
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="text-center pt-3 border-t border-outline-variant/30 text-sm text-on-surface-variant">
          <span>Don't have an account yet? </span>
          <Link to="/register" className="font-bold text-primary hover:underline">
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
};
