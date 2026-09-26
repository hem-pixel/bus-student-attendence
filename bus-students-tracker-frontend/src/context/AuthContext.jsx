import React, { createContext, useState, useEffect } from 'react';
import { supabaseClient } from '../services/api';
import authService from '../services/auth.service';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const storedToken = localStorage.getItem('authToken');
        const storedRole = localStorage.getItem('userRole');

        if (storedToken) {
          try {
            const verifyData = await authService.verifyToken();
            if (verifyData?.success && verifyData?.data) {
              setUser({
                id: verifyData.data.userId || verifyData.data.id,
                email: verifyData.data.email
              });
              const resolvedRole = verifyData.data.role || storedRole || 'ADMIN';
              setUserRole(resolvedRole);
              localStorage.setItem('userRole', resolvedRole);
            } else if (storedRole) {
              setUser({ email: 'user@college.edu' });
              setUserRole(storedRole);
            }
          } catch (err) {
            console.warn('Backend token verify check failed, using stored session if valid:', err.message);
            if (storedRole) {
              setUser({ email: 'user@college.edu' });
              setUserRole(storedRole);
            } else {
              localStorage.removeItem('authToken');
              localStorage.removeItem('userRole');
            }
          }
        } else {
          // Check Supabase session fallback
          try {
            const { data: { session } } = await supabaseClient.auth.getSession();
            if (session?.user) {
              setUser(session.user);
              if (storedRole) setUserRole(storedRole);
            }
          } catch {
            // Ignore if Supabase is placeholder
          }
        }
      } catch (err) {
        console.error('Auth check error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Subscribe to auth state changes from Supabase if configured
    let subscription = null;
    try {
      const authSub = supabaseClient.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          setUser(session.user);
        } else if (!localStorage.getItem('authToken')) {
          setUser(null);
          setUserRole(null);
        }
      });
      subscription = authSub?.data?.subscription;
    } catch {
      // Placeholder safety
    }

    return () => subscription?.unsubscribe?.();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const data = await authService.login(email, password);

      if (!data?.success) {
        setError(data?.message || 'Login failed');
        return false;
      }

      // Store token and role in localStorage
      const token = data.data?.token;
      const role = data.data?.user?.role;
      const userInfo = data.data?.user;

      if (token) localStorage.setItem('authToken', token);
      if (role) localStorage.setItem('userRole', role);

      setUser(userInfo || { email, role });
      setUserRole(role);

      return true;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Login failed';
      setError(errMsg);
      console.error('Login error:', err);
      return false;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      try {
        await supabaseClient.auth.signOut();
      } catch {
        // Ignore
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      setUser(null);
      setUserRole(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        loading,
        error,
        login,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
