import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      localStorage.setItem('fnx_token', token);
      refreshUser().then(() => {
        navigate('/account');
      });
    } else {
      navigate('/login?error=no_token');
    }
  }, [location, navigate, refreshUser]);

  return (
    <div className="w-full min-h-[60vh] flex items-center justify-center">
      <div className="flex items-center gap-3 text-primary font-trade-unit text-lg font-bold">
        <span className="material-symbols-outlined animate-spin text-3xl">sync</span>
        <span>Completing Google Sign-In verification...</span>
      </div>
    </div>
  );
};
