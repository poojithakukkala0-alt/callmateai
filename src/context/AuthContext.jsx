import React, { createContext, useContext, useState, useEffect } from 'react';
import { getStorageItem, setStorageItem, removeStorageItem, KEYS, initializeStorage } from '../utils/storage';
import { normalizeEmail } from '../utils/validation';
import { hashPassword } from '../utils/crypto';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  // Trigger floating toast notification
  const showToast = (message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 7);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    async function init() {
      await initializeStorage();
      const currentSession = getStorageItem(KEYS.SESSION, null);
      if (currentSession && currentSession.email) {
        // verify user still exists
        const users = getStorageItem(KEYS.USERS, []);
        const matched = users.find(u => u.email === currentSession.email);
        if (matched) {
          setUser({ ...matched, token: currentSession.token });
        } else {
          removeStorageItem(KEYS.SESSION);
        }
      }
      setLoading(false);
    }
    init();
  }, []);

  const login = async (rawEmail, password, rememberMe = true) => {
    const email = normalizeEmail(rawEmail);
    const users = getStorageItem(KEYS.USERS, []);
    const foundUser = users.find(u => u.email === email);

    if (!foundUser) {
      return { success: false, error: 'No account found with this email. Please register first.' };
    }

    const inputHash = await hashPassword(password);
    if (foundUser.passwordHash !== inputHash) {
      return { success: false, error: 'Incorrect password. Please verify and try again.' };
    }

    const sessionData = {
      id: foundUser.id,
      email: foundUser.email,
      name: foundUser.name,
      avatar: foundUser.avatar,
      role: foundUser.role,
      token: `demo_jwt_token_${Date.now()}`
    };

    if (rememberMe) {
      setStorageItem(KEYS.SESSION, sessionData);
    } else {
      // In-memory or session
      setStorageItem(KEYS.SESSION, sessionData);
    }

    setUser(sessionData);
    showToast(`Welcome back, ${foundUser.name}!`, 'success');
    return { success: true };
  };

  const register = async (name, rawEmail, password) => {
    const email = normalizeEmail(rawEmail);
    const users = getStorageItem(KEYS.USERS, []);

    if (users.some(u => u.email === email)) {
      return { success: false, error: 'An account with this email already exists. Please sign in.' };
    }

    const passwordHash = await hashPassword(password);
    const newUser = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email,
      passwordHash,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80`,
      role: 'Personal Call Assistant',
      createdAt: new Date().toISOString()
    };

    const updatedUsers = [...users, newUser];
    setStorageItem(KEYS.USERS, updatedUsers);

    showToast('Registration successful! Please sign in with your credentials.', 'success');
    return { success: true, user: newUser };
  };

  const logout = () => {
    removeStorageItem(KEYS.SESSION);
    setUser(null);
    showToast('Signed out successfully.', 'info');
  };

  const updateProfile = (updatedFields) => {
    if (!user) return;
    const users = getStorageItem(KEYS.USERS, []);
    const updatedUsers = users.map(u => {
      if (u.email === user.email) {
        return { ...u, ...updatedFields };
      }
      return u;
    });
    setStorageItem(KEYS.USERS, updatedUsers);
    const updatedCurrent = { ...user, ...updatedFields };
    setUser(updatedCurrent);
    setStorageItem(KEYS.SESSION, updatedCurrent);
    showToast('Profile updated successfully!', 'success');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        toasts,
        showToast,
        removeToast
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
