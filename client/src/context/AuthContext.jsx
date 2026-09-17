import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModal, setAuthModal] = useState({ isOpen: false, view: 'login' }); // 'login' | 'signup' | 'forgot' | 'verify'
  const { showToast } = useToast();

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await authService.getMe();
      if (res.data?.success) {
        setUser(res.data.user);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();

    const handleSessionExpired = () => {
      setUser(null);
      showToast('Session expired. Please sign in again.', 'info');
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => window.removeEventListener('auth:session-expired', handleSessionExpired);
  }, [fetchCurrentUser, showToast]);

  const login = async (email, password) => {
    try {
      const res = await authService.login({ email, password });
      if (res.data?.success) {
        setUser(res.data.user);
        setAuthModal({ isOpen: false, view: 'login' });
        showToast(`Welcome back, ${res.data.user.name}! 🚀`, 'success');
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      showToast(msg, 'error');
      if (err.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
        setAuthModal({ isOpen: true, view: 'verify', email });
      }
      return { success: false, error: msg, code: err.response?.data?.code };
    }
  };

  const signup = async (userData) => {
    try {
      const res = await authService.signup(userData);
      if (res.data?.success) {
        showToast('Verification email simulated! Check simulated inbox or enter token.', 'info');
        setAuthModal({ isOpen: true, view: 'verify', email: userData.email, simulatedEmail: res.data.simulatedEmail });
        return { success: true, simulatedEmail: res.data.simulatedEmail };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Signup failed. Please check your details.';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  const verifyEmail = async (token, email) => {
    try {
      const res = await authService.verifyEmail({ token, email });
      if (res.data?.success) {
        setUser(res.data.user);
        setAuthModal({ isOpen: false, view: 'login' });
        showToast('Email verified successfully! Welcome to KudosWall 🎉', 'success');
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Verification failed. Invalid or expired token.';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore network failures on logout
    } finally {
      setUser(null);
      showToast('You have been logged out.', 'info');
    }
  };

  const refreshUser = async () => {
    try {
      const res = await authService.getMe();
      if (res.data?.success) {
        setUser(res.data.user);
      }
    } catch {
      // Silently catch
    }
  };

  const updateUser = (updatedData) => {
    setUser((prev) => (prev ? { ...prev, ...updatedData } : prev));
  };

  const openAuthModal = (view = 'login', extra = {}) => {
    setAuthModal({ isOpen: true, view, ...extra });
  };

  const closeAuthModal = () => {
    setAuthModal({ isOpen: false, view: 'login' });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        verifyEmail,
        logout,
        refreshUser,
        updateUser,
        authModal,
        openAuthModal,
        closeAuthModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
