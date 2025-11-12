// Synchronous token validation without waiting for auth context
// This allows immediate redirects before any component renders

import { authService } from './auth';

export const hasValidToken = (): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    const token = authService.getToken();
    return !!token;
  } catch (error) {
    console.error('Error checking token:', error);
    return false;
  }
};

export const getStoredUser = () => {
  if (typeof window === 'undefined') return null;

  try {
    return authService.getUser();
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};
