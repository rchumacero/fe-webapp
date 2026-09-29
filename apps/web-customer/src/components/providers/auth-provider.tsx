"use client"

import { SessionProvider } from "next-auth/react"
import { useEffect } from "react"
import { getSession } from "next-auth/react"
import { setTokenProvider, setGlobalErrorHandler, setVendorProvider, setLanguageProvider, setTimezoneProvider, unlockApi } from "@kplian/infrastructure"
import i18n from "@kplian/i18n"
import { toast } from "@/hooks/use-toast"
import { usePathname } from "next/navigation"

import { signOut } from "next-auth/react"

let isLoggingOut = false;

// Register a global error handler to show toasts for API errors
setGlobalErrorHandler((message, code) => {
  if (code === '401') {
    // In web-customer, we do not redirect to login on 401 errors
    return;
  }

  // Ignore locked API errors (they are already handled)
  if (message === 'API_LOCKED') return;

  toast.error(message, { 
    title: code ? `Error ${code}` : 'API Error',
    duration: 8000 // Keep errors visible a bit longer
  });
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // If we are on the login page, always unlock the API
    if (pathname === '/login') {
      isLoggingOut = false;
      unlockApi();
    }
  }, [pathname]);

  useEffect(() => {
    let cachedVendor: string | null = null;
    let cachedToken: string | null = null;
    let lastFetch = 0;
    let sessionPromise: Promise<{ token: string | null; vendor: string | null }> | null = null;

    const getOrFetchSession = async () => {
      const now = Date.now();
      // Cache session for 5 seconds to avoid spamming /api/auth/session during bursts
      if (lastFetch > 0 && now - lastFetch < 5000) {
        return { token: cachedToken, vendor: cachedVendor };
      }

      // If a fetch is already in flight, reuse the same promise
      if (sessionPromise) {
        return sessionPromise;
      }

      sessionPromise = (async () => {
        try {
          const session = await getSession();
          cachedToken = (session as any)?.accessToken || null;
          cachedVendor = (session as any)?.vendor || null;
          lastFetch = Date.now();

          // If we got a token, make sure API is unlocked
          if (cachedToken) {
            isLoggingOut = false;
            unlockApi();
          }
        } catch (error) {
          console.error("AuthProvider: Failed to fetch session", error);
        } finally {
          sessionPromise = null;
        }

        return { token: cachedToken, vendor: cachedVendor };
      })();

      return sessionPromise;
    };

    // Inject providers
    setTokenProvider(async () => {
      const { token } = await getOrFetchSession();
      return token;
    });

    setVendorProvider(async () => {
      const { vendor } = await getOrFetchSession();
      return vendor;
    });

    setLanguageProvider(() => i18n.language || (typeof window !== 'undefined' ? localStorage.getItem('i18nextLng') : null) || 'es');
    setTimezoneProvider(() => (typeof window !== 'undefined' ? localStorage.getItem('app-timezone') : null) || Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  return <SessionProvider>{children}</SessionProvider>
}

