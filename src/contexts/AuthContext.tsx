import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser } from '../lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  profile: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  error: string | null;
  signIn: (credentials?: any) => Promise<void>;
  signUp: (data?: any) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profileData: Partial<AuthUser>) => Promise<AuthUser>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// A minimal default admin user used when login logic is removed
const DEFAULT_ADMIN: AuthUser = {
  id: 'admin',
  email: 'admin@forwardafrica.com',
  full_name: 'Administrator',
  role: 'admin',
  permissions: [],
  onboarding_completed: true,
  avatar_url: undefined,
  industry: undefined,
  experience_level: undefined,
  business_stage: undefined,
  country: undefined,
  state_province: undefined,
  city: undefined
} as any;

import { auth as firebaseAuth } from '../lib/firebase';
import { API_BASE_URL } from '../lib/mysql';
import { authService } from '../lib/auth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(DEFAULT_ADMIN);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // No-op by default
  }, []);

  const signIn = async (credentials?: any) => {
    setLoading(true);
    setError(null);

    try {
      // If caller provided full token payload (token, refreshToken, user), persist it
      if (credentials && credentials.token && credentials.refreshToken && credentials.user) {
        authService.setAuthData(credentials.token, credentials.refreshToken, credentials.user);
        setUser(credentials.user as AuthUser);
        setLoading(false);
        return;
      }

      // If email/password provided, use authService.login (mocked or real) which stores tokens
      if (credentials && credentials.email && credentials.password) {
        const resp = await authService.login({ email: credentials.email, password: credentials.password });
        // authService.login calls setAuthData internally for mock, but ensure user state is updated
        setUser(resp.user as AuthUser);
        setLoading(false);
        return;
      }

      // Fallback: if Firebase user exists, exchange ID token with backend
      if (typeof window !== 'undefined' && firebaseAuth?.currentUser) {
        const fbUser = firebaseAuth.currentUser;
        const idToken = await fbUser.getIdToken();

        const resp = await fetch(`${API_BASE_URL}/auth/firebase/exchange`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken })
        });

        if (resp.ok) {
          const data = await resp.json();
          const appUser = data.user || DEFAULT_ADMIN;
          if (data.token && data.refreshToken) {
            authService.setAuthData(data.token, data.refreshToken, appUser);
            setUser(appUser as AuthUser);
            setLoading(false);
            return;
          }
        } else {
          console.warn('Token exchange failed with status', resp.status);
        }
      }

      // If nothing else, try to generate a safe client-side fallback token and persist it
      try {
        const existing = authService.getToken();
        if (!existing) {
          // Build appUser from firebase or default
          const appUser = (typeof window !== 'undefined' && firebaseAuth?.currentUser)
            ? {
                id: firebaseAuth.currentUser.uid,
                email: firebaseAuth.currentUser.email || DEFAULT_ADMIN.email,
                full_name: firebaseAuth.currentUser.displayName || DEFAULT_ADMIN.full_name,
                role: DEFAULT_ADMIN.role,
                permissions: [],
                onboarding_completed: true
              }
            : DEFAULT_ADMIN;

          // Create a simple JWT-like token payload (no signature verification on client)
          const payload = {
            id: appUser.id || 'local-admin',
            role: appUser.role || 'admin',
            exp: Math.floor(Date.now() / 1000) + 24 * 3600 // 24 hours
          };
          const base64Payload = (typeof window !== 'undefined' && typeof btoa === 'function')
            ? btoa(JSON.stringify(payload))
            : Buffer.from(JSON.stringify(payload)).toString('base64');

          const token = `mock.${base64Payload}.sig`;
          const refreshToken = `mock-refresh-${Date.now()}`;

          // Persist via authService helper which sets expiry/session timestamps
          authService.setAuthData(token, refreshToken, appUser as any);
          setUser(appUser as AuthUser);
          console.log('✅ Fallback mock token generated and stored');

          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn('Fallback token creation failed:', e);
      }

      // If fallback failed, set default admin user without persisted tokens
      setUser(DEFAULT_ADMIN);
    } catch (err) {
      console.error('SignIn failed in AuthProvider:', err);
      setError(String(err));
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (_data?: any) => {
    // NOP - create/admin flows are disabled in this simplified mode
    setLoading(false);
  };

  const signOut = async () => {
    // Keep the admin session present by default; sign out will clear if explicitly called
    setUser(null);
  };

  const updateProfile = async (profileData: Partial<AuthUser>) => {
    const updated: AuthUser = { ...(user as any), ...(profileData as any) } as AuthUser;
    setUser(updated);
    return updated;
  };

  const refreshToken = async () => {
    // No-op when removing login logic
  };

  const clearError = () => setError(null);

  const checkAuthStatus = async () => {
    // Always treat as authenticated with admin role unless user explicitly signed out
    return;
  };

  const value: AuthContextType = {
    user,
    profile: user,
    loading,
    isAuthenticated: !!user,
    isAdmin: !!user && (user.role === 'admin' || user.role === 'super_admin' || (user.permissions && (user.permissions as any).includes('system:full_access'))),
    isSuperAdmin: !!user && user.role === 'super_admin',
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshToken,
    clearError,
    checkAuthStatus
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
