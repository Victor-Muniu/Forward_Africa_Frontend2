// Synchronous token validation without waiting for auth context
// This allows immediate redirects before any component renders
// Uses JWT tokens from cookies

const parseJWT = (token: string): any => {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;

    // Decode base64 with URL-safe padding
    let decoded = payload.replace(/-/g, '+').replace(/_/g, '/');

    // Browser-only solution using atob
    if (typeof window !== 'undefined' && window.atob) {
      const decodedString = atob(decoded);
      return JSON.parse(
        decodeURIComponent(
          decodedString
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        )
      );
    }

    return null;
  } catch (error) {
    console.error('JWT Parse Error in tokenValidator:', error);
    return null;
  }
};

const isTokenExpired = (token: string): boolean => {
  try {
    const payload = parseJWT(token);
    if (!payload || !payload.exp) return true;

    const expiryTime = payload.exp * 1000; // Convert to milliseconds
    return Date.now() > expiryTime;
  } catch (error) {
    return true;
  }
};

const getTokenFromCookie = (): string | null => {
  if (typeof document === 'undefined') return null;

  try {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const trimmed = cookie.trim();
      if (trimmed.startsWith('auth_token=')) {
        const value = trimmed.substring('auth_token='.length);
        if (value) {
          try {
            return decodeURIComponent(value);
          } catch (e) {
            return value;
          }
        }
      }
    }
  } catch (error) {
    console.error('Error reading cookie:', error);
  }
  return null;
};

export const hasValidToken = (): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    const token = getTokenFromCookie();

    if (!token) {
      console.log('🔍 No token found in cookies');
      return false;
    }

    if (isTokenExpired(token)) {
      console.log('⏳ Token is expired');
      return false;
    }

    console.log('✅ Valid token found in cookies');
    return true;
  } catch (error) {
    console.error('Error checking token:', error);
    return false;
  }
};

export const getStoredUser = () => {
  if (typeof window === 'undefined') return null;

  try {
    const token = getTokenFromCookie();
    if (!token) return null;

    const payload = parseJWT(token);
    if (!payload || isTokenExpired(token)) return null;

    return {
      uid: payload.userId,
      email: payload.email,
      displayName: payload.displayName || ''
    };
  } catch (error) {
    console.error('Error getting stored user:', error);
    return null;
  }
};
