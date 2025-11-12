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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(DEFAULT_ADMIN);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // No-op: we intentionally keep a default admin user to remove login flows
  }, []);

  const signIn = async (_credentials?: any) => {
    // No real sign-in: ensure user is set to admin
    setLoading(true);
    setError(null);
    setUser(DEFAULT_ADMIN);
    setLoading(false);
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
