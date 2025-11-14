import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { validateTokenInCookie } from '../lib/validateToken';

/**
 * Hook to protect pages that require authentication
 * Redirects to login if no valid token is found in cookie
 */
export const useProtectedPage = () => {
  const router = useRouter();

  useEffect(() => {
    const isTokenValid = validateTokenInCookie();
    if (!isTokenValid) {
      console.log('❌ No valid token, redirecting to login');
      router.replace('/login');
    }
  }, [router]);
};
