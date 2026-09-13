import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  authService,
  getAllAvailableAccounts,
  getRegisteredAccounts,
  saveRegisteredAccount,
  removeRegisteredAccount,
} from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('med_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);
  const [savedAccounts, setSavedAccounts] = useState(() => getAllAvailableAccounts());

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('med_access_token');
      if (token) {
        try {
          const profile = await authService.getProfile();
          setUser(profile);
          localStorage.setItem('med_user', JSON.stringify(profile));
        } catch (err) {
          console.warn('Could not refresh remote profile, preserving local session:', err);
        }
      }
      setLoading(false);
    };

    initAuth();

    const handleLogoutEvent = () => {
      setUser(null);
    };

    const handleAccountsUpdated = () => {
      setSavedAccounts(getAllAvailableAccounts());
    };

    window.addEventListener('auth:logout', handleLogoutEvent);
    window.addEventListener('med:accounts-updated', handleAccountsUpdated);

    return () => {
      window.removeEventListener('auth:logout', handleLogoutEvent);
      window.removeEventListener('med:accounts-updated', handleAccountsUpdated);
    };
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    localStorage.setItem('med_access_token', data.access);
    localStorage.setItem('med_refresh_token', data.refresh);
    localStorage.setItem('med_user', JSON.stringify(data.user));
    setUser(data.user);
    setSavedAccounts(getAllAvailableAccounts());
    return data.user;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    setSavedAccounts(getAllAvailableAccounts());
    return data;
  };

  const removeAccount = (email) => {
    removeRegisteredAccount(email);
    setSavedAccounts(getAllAvailableAccounts());
  };

  const addAccount = (account) => {
    saveRegisteredAccount(account);
    setSavedAccounts(getAllAvailableAccounts());
  };

  const logout = () => {
    localStorage.removeItem('med_access_token');
    localStorage.removeItem('med_refresh_token');
    localStorage.removeItem('med_user');
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('med_user', JSON.stringify(updatedUser));
    setSavedAccounts(getAllAvailableAccounts());
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        savedAccounts,
        isAuthenticated: !!user,
        isAdmin: user?.is_admin || user?.role === 'admin',
        login,
        register,
        removeAccount,
        addAccount,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
